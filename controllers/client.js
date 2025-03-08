import Product from "../model/Product.js";
import Customer from "../model/Customer.js";
import User from "../model/User.js";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateUsername } from "../UTIL/generateCode.js";
import Joi from "joi";
import PasswordComplexity from "joi-password-complexity";
import {generateOAuthToken }from '../UTIL/jwt.js'
import {
    logLoginAttempt,
    checkForUnusualLogin,
    getRecentFailedAttempts,
    createSecurityAlert,
    checkLoginRateLimit,
    createAccountLockoutAlert,
    createLogger
} from '../UTIL/securityUtils.js';
import { sendOTPEmail } from "../UTIL/emailService.js";
import OTP from '../model/OTP.js'; // Ensure the correct path
import {resetFailedAttempts} from '../UTIL/resetFailedAttempts'
const OTP_EXPIRY = 10 * 60 * 1000; 
  
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
    const { name, email, password, phoneNumber, role, adminUsername, department } = req.body;
    console.log("Received registration data:", req.body);

    // Validate input
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
        role: Joi.string().valid("admin", "manager", "employee", "user").required(),
        adminUsername: Joi.string().when("role", { is: Joi.valid("admin", "manager", "employee"), then: Joi.required() }),
        department: Joi.string().required() // New field for department
    });

    const { error } = schema.validate({ name, email, password, phoneNumber, role, adminUsername, department });
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    try {
        // Check for existing user
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already exists" });
        }

        // Check for admin username if applicable
        if (["admin", "manager", "employee"].includes(role)) {
            const existingAdmin = await User.findOne({ username: adminUsername, role: "admin" });
            if (!existingAdmin) {
                return res.status(400).json({ error: "Invalid admin username" });
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            phoneNumber,
            role,
            department, // Save the department
            username: generateUsername(role), // Example username generation
        });

        const savedUser = await newUser.save();
        const userResponse = savedUser.toObject();
        delete userResponse.password; // Don't send password back to client

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
    const MAX_ATTEMPTS = 5;
    const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

    try {
        // Find user by email or username
        const user = await User.findOne({
            $or: [
                { email: identifier },
                { username: identifier }
            ]
        });

        if (user.accountLocked && user.lockExpiration>Date.now()){
            return res.status(429).json({message:"Account is Lock. Use OTP to login"})
        }
        if (user && user.accountLocked && user.lockExpiration > new Date()) {
            await logLoginAttempt({
                identifier,
                userId: user._id,
                name: user.name,
                department: user.department,
                role: user.role,
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

            return res.status(401).json({
                message: "Invalid credentials",
                remainingAttempts: MAX_ATTEMPTS - 1
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            // Count failed login attempts
            const failedAttempts = await getRecentFailedAttempts(user._id, identifier);
            const remainingAttempts = MAX_ATTEMPTS - failedAttempts - 1;

            // Log failed attempt
            await logLoginAttempt({
                identifier,
                userId: user._id,
                name: user.name,
                department: user.department,
                role: user.role,
                ipAddress,
                userAgent,
                status: 'failed',
                reason: 'Incorrect password'
            });

            if (failedAttempts + 1 >= MAX_ATTEMPTS) {
                // Lock the account for 15 minutes
                const lockoutEnd = new Date(Date.now() + LOCKOUT_DURATION);

                user.accountLocked = true;
                user.lockExpiration = lockoutEnd;
                await user.save();

                await createAccountLockoutAlert(user._id, ipAddress, userAgent);

                return res.status(429).json({
                    message: "Too many failed login attempts. This account has been temporarily locked.",
                    lockedUntil: lockoutEnd,
                    remainingTime: Math.ceil((lockoutEnd - new Date()) / 1000) // 15 minutes in seconds
                });
            }

            return res.status(401).json({
                message: "Invalid credentials",
                remainingAttempts
            });
        }

        // Log successful login
        await logLoginAttempt({
            userId: user._id,
            identifier,
            name: user.name,
            department: user.department,
            role: user.role,
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

            await createSecurityAlert(user._id, 'unusual_login_detected', {
                currentIp: ipAddress,
                currentUserAgent: userAgent,
                previousIp: unusualLogin.previousIp,
                previousUserAgent: unusualLogin.previousUserAgent
            });
        }

        // Reset failed attempts counter (if needed)
        await resetFailedAttempts(user._id);
          // Generate JWT Access Token
          const accessToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        // Generate Refresh Token
        const refreshToken = jwt.sign(
            { id: user._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "7d" }
        );

        // Update last login info
        user.lastLogin = new Date();
        user.lastIpAddress = ipAddress
        user.refreshToken = refreshToken;
        await user.save();

        res.cookie('accessToken', accessToken, { httpOnly: true });
        res.cookie('refreshToken', refreshToken, { httpOnly: true });


        return res.status(200).json({
            message: "Login successful",
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                username: user.username,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                permissions: user.permissions
            },
            securityAlert
        });

    } catch (error) {
        console.error("Login error:", error);

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

export const getUser = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Not Authenticated' });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
  
      res.json({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          username: user.username
        }
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(401).json({ message: 'Invalid token' });
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


export const generateOTP = async (req, res) => {
    const { email } = req.body;

    try {
        // Add error handling for the User.findOne call
        let user;
        try {
            user = await User.findOne({ email });
        } catch (dbError) {
            console.error("Database error when finding user:", dbError);
            return res.status(500).json({ message: "Database error when finding user" });
        }

        if (!user || !user.accountLocked) {
            return res.status(400).json({ message: "Account not locked or user not found" });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY);

        // Add error handling for the OTP.create call
        try {
            await OTP.create({ email, otp, expiresAt: otpExpiresAt });
        } catch (dbError) {
            console.error("Database error when creating OTP:", dbError);
            return res.status(500).json({ message: "Database error when creating OTP" });
        }

        // Add error handling for the sendOTPEmail call
        try {
            await sendOTPEmail(email, otp);
        } catch (emailError) {
            console.error("Email sending error:", emailError);
            return res.status(500).json({ message: "Failed to send OTP email" });
        }

        res.status(200).json({ message: "OTP sent to your email" });

    } catch (error) {
        console.error("Unexpected error in generateOTP:", error);
        res.status(500).json({ message: "Error generating OTP" });
    }
}
export const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const validOTP = await OTP.findOne({ email, otp });
        console.log("Found OTP:", validOTP);
        if (!validOTP || new Date(validOTP.expiresAt) < new Date()) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        await User.updateOne({ email }, { accountLocked: false, lockExpiration: null });

        await OTP.deleteOne({ email });

        res.status(200).json({ message: "Account unlocked successfully" });

    } catch (error) {
        res.status(500).json({ message: "Error verifying OTP" });
    }
};

