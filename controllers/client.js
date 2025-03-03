
import Log from '../model/Log.js';
import { createLog } from '../controllers/try.js';  
import Customer from "../model/Customer.js";
import User from "../model/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateUsername } from "../UTIL/generateCode.js";
import Joi from "joi";
import PasswordComplexity from "joi-password-complexity";
import {generateOAuthToken }from '../UTIL/jwt.js'
import { io } from "../index.js"; // Import Socket.IO instance
import {
    logLoginAttempt,
    checkForUnusualLogin,
    getRecentFailedAttempts,
    createSecurityAlert,
    checkLoginRateLimit,
    createAccountLockoutAlert,
    createLogger
} from '../UTIL/securityUtils.js';

  
const passwordComplexityOptions = {
    min: 8,
    max: 30,
    lowerCase: 1,
    upperCase: 1,
    numeric: 1,
    symbol: 1,
    requirementCount: 4,
};





// Register User


export const registerUser = async (req, res) => {
    const { name, email, password, phoneNumber, role, department } = req.body;
  
    // Validate the request payload
    const schema = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string()
        .min(8)
        .pattern(/[a-z]/, "lowercase")
        .pattern(/[A-Z]/, "uppercase")
        .pattern(/[0-9]/, "numbers")
        .pattern(/[@$!%*?&#]/, "special characters")
        .required(),
      phoneNumber: Joi.string().optional(),
      role: Joi.string().valid("admin", "manager", "superadmin").required(),
      department: Joi.string().valid("HR", "Core", "Logistics", "Finance", "Administrative").required(),
    });
  
    const { error } = schema.validate({ name, email, password, phoneNumber, role, department });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
  
    try {
      // Check if the email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "Email already exists" });
      }
  
      // Generate a hashed password
      const hashedPassword = await bcrypt.hash(password, 10);
      const username = generateUsername(role);
  
      // Create the new user
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        phoneNumber,
        role,
        department,
        username,
      });
  
      // Save the user in the database
      const savedUser = await newUser.save();
      const userResponse = savedUser.toObject();
      delete userResponse.password;
  
      // Emit event via Socket.IO
      io.emit("newUserRegistered", {
        message: "A new user has registered!",
        user: {
          id: savedUser._id,
          name: savedUser.name,
          email: savedUser.email,
          role: savedUser.role,
          department: savedUser.department,
        },
      });
  
      res.status(201).json(userResponse);
    } catch (error) {
      console.error("Registration error:", error.message);
      res.status(500).json({ message: "Server error. Please try again later.", error: error.message });
    }
  };

  
// Login endpoint
export const loginUser = async (req, res) => {
    const { identifier, password } = req.body;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    try {
        // Find user by email or username
        const user = await User.findOne({
            $or: [
                { email: identifier },
                { username: identifier }
            ]
        });
        
        // Check if this specific account is locked (only if user exists)
        if (user && user.accountLocked && user.lockExpiration > new Date()) {
            // Log the blocked attempt for a locked account
            await logLoginAttempt({
                identifier,
                userId: user._id,
                ipAddress,
                userAgent,
                status: 'unauthorized',
                reason: 'Account locked'
            });
            
            return res.status(429).json({
                message: "This account is temporarily locked due to too many failed attempts.",
                lockedUntil: user.lockExpiration,
                remainingTime: Math.ceil((user.lockExpiration - new Date()) / 1000)
            });
        }
        
        // If account was locked but lock has expired, unlock it
        if (user && user.accountLocked && user.lockExpiration <= new Date()) {
            user.accountLocked = false;
            user.lockExpiration = null;
            await user.save();
        }
        
        // If user doesn't exist, log attempt but don't reveal this info
        if (!user) {
            await logLoginAttempt({
                identifier,
                ipAddress,
                userAgent,
                status: 'failed',
                reason: 'User not found'
            });
            
            // Check if there are too many failed attempts for this specific identifier
            const failedAttempts = await getRecentFailedAttempts(null, identifier);
            
            // We won't lock anything here since the user doesn't exist
            // Just return the generic error
            return res.status(401).json({ message: "Invalid credentials" });
        }
        
        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            // Log failed login attempt
            await logLoginAttempt({
                userId: user._id,
                identifier,
                ipAddress,
                userAgent,
                status: 'failed',
                reason: 'Incorrect password'
            });
            
            // Check for too many failed attempts for this specific user
            const failedAttempts = await getRecentFailedAttempts(user._id, identifier);
            
            if (failedAttempts >= 5) {
                // Lock this specific account in the database
                const lockoutEnd = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
                
                user.accountLocked = true;
                user.lockExpiration = lockoutEnd;
                await user.save();
                
                // Create security alert for account lockout
                await createAccountLockoutAlert(user._id, ipAddress, userAgent);
                
                return res.status(429).json({
                    message: "Too many failed login attempts. This account has been temporarily locked.",
                    lockedUntil: lockoutEnd,
                    remainingTime: 300 // 5 minutes in seconds
                });
            }
            
            return res.status(401).json({ message: "Invalid credentials" });
        }
        
        // Login successful - generate JWT tokens
        const accessToken = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        
        const refreshToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        );
        
        // Log successful login
        await logLoginAttempt({
            userId: user._id,
            identifier,
            ipAddress,
            userAgent,
            status: 'success'
        });
        
        // Check for unusual login patterns
        let securityAlert = null;
        const unusualLogin = await checkForUnusualLogin(user._id, ipAddress, userAgent);
        
        if (unusualLogin) {
            securityAlert = {
                type: 'unusual_login_detected',
                message: "We noticed a login from a new location or device."
            };
            
            // Create security alert
            await createSecurityAlert(user._id, 'unusual_login_detected', {
                currentIp: ipAddress,
                currentUserAgent: userAgent,
                previousIp: unusualLogin.previousIp,
                previousUserAgent: unusualLogin.previousUserAgent
            });
        }
        
        // Update last login info
        user.lastLogin = new Date();
        user.lastIpAddress = ipAddress;
        await user.save();
        
        // Return user data and tokens
        return res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                username: user.username,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                permissions: user.permissions
            },
            accessToken,
            refreshToken,
            securityAlert
        });
        
    } catch (error) {
        console.error("Login error:", error);
        
        // Log error
        await logLoginAttempt({
            identifier,
            ipAddress,
            userAgent,
            status: 'error',
            error: error.message
        });
        
        return res.status(500).json({
            message: "An error occurred during login."
        });
    }
};
  


export const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token is required' });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id);

        if (!user || user.refreshToken !== refreshToken) {
            return res.status(400).json({ message: 'Invalid refresh token' });
        }

        const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });

        res.status(200).json({ accessToken });
    } catch (error) {
        console.error("Refresh token error:", error); // Log the error for debugging
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

export const getCustomers = async (req, res) => {
    try {
        const customers = await Customer.find();
        res.status(200).json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching customers', error: error.message });
    }
};
// Register Customer
export const registerCustomer = async (req, res) => {
    const { name, email, password, phoneNumber, country, occupation } = req.body;
    console.log("Received customer registration data:", req.body);

    if (!name || !email || !password) {
        return res.status(400).json({ error: "Name, email, and password are required" });
    }

    try {
        const existingCustomer = await Customer.findOne({ email });
        if (existingCustomer) {
            return res.status(400).json({ error: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newCustomer = new Customer({
            name,
            email,
            password: hashedPassword,
            phoneNumber,
            country,
            occupation,
        });

        await newCustomer.save();

        res.status(201).json({ message: "Customer registered successfully" });
    } catch (error) {
        console.error("Customer registration error:", error.message);
        res.status(500).json({ message: "Server error. Please try again later.", error: error.message });
    }
};

export const changePassword = async (req, res) => {
    const { email, currentPassword, newPassword } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Check if the current password is correct
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Current password is incorrect" });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update the user's password
        user.password = hashedPassword;
        await user.save();

        return res.json({ success: true, message: "Password changed successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

