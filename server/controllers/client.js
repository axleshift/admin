import Customer from "../model/Customer.js";
import User from "../model/User.js";
import Joi from "joi";
import LoginAttempt from '../model/LoginAttempt.js';
import Anomaly from '../model/Anomaly.js';
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
import { generateAccessToken, generateRefreshToken } from '../middleware/generateToken.js';
const passwordComplexityOptions = {
    min: 8,
    max: 30,
    lowerCase: 1,
    upperCase: 1,
    numeric: 1,
    symbol: 1,
    requirementCount: 4,
};
import Activitytracker from "../model/Activitytracker.js";
//integrate model
import coreuser from '../model/coreuser.js'
import financeuser from '../model/financeuser.js'
import hruser from '../model/hruser.js';
import logisticuser from '../model/logisticuser.js'
import { generateCode, generateUsername } from "../UTIL/generateCode.js";
import bcryptjs from 'bcryptjs'





// Register User
const userSchema = Joi.object({
    id: Joi.string().optional(), 
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string()
      .min(8)
      .pattern(/[a-z]/, "lowercase")
      .pattern(/[A-Z]/, "uppercase")
      .pattern(/[0-9]/, "numbers")
      .pattern(/[@$!%*?&#]/, "special characters")
      .required(),
    role: Joi.string().required(),
    department: Joi.string().required(),
    phone: Joi.string().optional().allow(''),
    address: Joi.string().optional().allow(''),
    image: Joi.string().optional().allow('')
  });
  
  export const saveUser = async (req, res) => {
    console.log("Received user data:", req.body);
    
    try {
      const { 
        id, 
        firstName, 
        lastName, 
        email, 
        password, 
        role, 
        department,
        phone = '',
        address = '',
        image = '',
        fullName = '',
        name = ''
      } = req.body;
      
      // Handle name fields with fallbacks
      let userFirstName = firstName || '';
      let userLastName = lastName || '';
      
      // Create full name if not provided, using firstName and lastName
      let userFullName = fullName || '';
      if (!userFullName && (userFirstName || userLastName)) {
        userFullName = `${userFirstName} ${userLastName}`.trim();
      }
      
      // Create name if not provided, using fullName or firstName and lastName
      let userName = name || '';
      if (!userName) {
        userName = userFullName || `${userFirstName} ${userLastName}`.trim();
      }
      
      // If we still don't have names, derive them from each other
      if (!userFullName && userName) {
        userFullName = userName;
      }
      
      // If we have a fullName but no first/last name, try to split it
      if (userFullName && !userFirstName && !userLastName) {
        const nameParts = userFullName.split(' ');
        if (nameParts.length >= 2) {
          userFirstName = nameParts[0];
          userLastName = nameParts.slice(1).join(' ');
        } else {
          userFirstName = userFullName;
          userLastName = '';
        }
      }
      
      // After all the logic, ensure we have at least some value for the name
      if (!userName && !userFullName && !userFirstName && !userLastName) {
        return res.status(400).json({
          success: false,
          error: "At least one name field (firstName, lastName, fullName, or name) must be provided"
        });
      }
      
      // Validate input
      const { error } = userSchema.validate({ 
        id, 
        firstName: userFirstName, 
        lastName: userLastName, 
        email, 
        password, 
        role, 
        department, 
        phone, 
        address, 
        image
      });
      
      if (error) {
        return res.status(400).json({ 
          success: false,
          error: error.details[0].message 
        });
      }
      
      // Check if email already exists in any system
      const emailExists = await Promise.all([
        coreuser.findOne({ email }),
        financeuser.findOne({ email }),
        hruser.findOne({ email }),
        logisticuser.findOne({ email }),
        User.findOne({ email })
      ]);
      
      if (emailExists.some(user => user !== null)) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists in the system'
        });
      }
      
      // Hash the password using bcryptjs instead of bcrypt
      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(password, salt);
      
      // Generate user number
      const userNumber = generateCode();
      
      // Determine which model to use based on department
      let userModel;
      let userData = {};
      
      // Normalize department and role strings
      const userDepartment = department?.trim() || 'core';
      const userRole = role?.trim()?.toLowerCase() || 'employee';
      
      // Specific formatting for each department's model
      switch (userDepartment.toLowerCase()) {
        case 'finance':
          userModel = financeuser;
          userData = {
            userNumber,
            fullName: userFullName,
            email,
            password: hashedPassword,
            role: userRole,
            phoneNumber: phone || '0000000000',
            address,
            image
          };
          console.log("User will be stored in finance system");
          break;
          
        case 'hr':
          userModel = hruser;
          userData = {
            userNumber,
            firstname: userFirstName,
            lastname: userLastName,
            email,
            password: hashedPassword,
            phoneNumber: phone || '0000000000',
            role: userRole,
            department: capitalizeFirstLetter(userDepartment),
            address,
            image,
          };
          console.log("User will be stored in HR system");
          break;
          
        case 'logistics':
          userModel = logisticuser;
          userData = {
            userNumber,
            firstname: userFirstName,
            lastname: userLastName,
            email,
            password: hashedPassword,
            phoneNumber: phone || '0000000000',
            role: userRole,
            department: capitalizeFirstLetter(userDepartment),
            address,
            image,
          };
          console.log("User will be stored in logistic system");
          break;
          
        case 'administrative':
          // For Administrative, store in the centralized User model only
          userModel = User;
          userData = {
            name: userName,
            email,
            password: hashedPassword,
            phoneNumber: phone || '0000000000',
            role: userRole,
            department: capitalizeFirstLetter(userDepartment),
            username: generateUsername(userRole),
            // Additional required fields from User model
            attendance: [],
            performance: [],
            benefits: {
              healthInsurance: false,
              retirementPlan: false,
              vacationDays: 0,
              sickLeave: 0
            },
            payroll: {
              salary: 0,
              payFrequency: 'monthly',
              lastPaymentDate: new Date()
            }
          };
          console.log("User will be stored in admin system (centralized User model)");
          break;
          
        case 'core':
        default:
          userModel = coreuser;
          userData = {
            userNumber,
            firstname: userFirstName,
            lastname: userLastName,
            email,
            password: hashedPassword,
            phoneNumber: phone || '0000000000',
            role: userRole,
            department: capitalizeFirstLetter(userDepartment),
            address,
            image,
          };
          console.log("User will be stored in core system");
          break;
      }
      
      // Save user to the appropriate model (department-specific database)
      let savedUser = null;
      
      // Only save to department-specific database if it's not already administrative
      if (userDepartment.toLowerCase() !== 'administrative') {
        const newUser = new userModel(userData);
        savedUser = await newUser.save();
      }
      
      // ALWAYS create a centralized user record in the administrative system (User model)
      const centralizedUserData = {
        name: userName,
        email,
        password: hashedPassword,
        username: generateUsername(userRole),
        phoneNumber: phone || '0000000000',
        role: userRole,
        department: capitalizeFirstLetter(userDepartment),
        // Additional required fields from User model
        attendance: [],
        performance: [],
        benefits: {
          healthInsurance: false,
          retirementPlan: false,
          vacationDays: 0,
          sickLeave: 0
        },
        payroll: {
          salary: 0,
          payFrequency: 'monthly',
          lastPaymentDate: new Date()
        }
      };
      
      // If the user is already being saved to the administrative system, use that record
      let centralizedUser;
      if (userDepartment.toLowerCase() === 'administrative') {
        centralizedUser = new User(userData);
        savedUser = await centralizedUser.save();
      } else {
        centralizedUser = new User(centralizedUserData);
        
        // Validate before saving
        const centralizedUserValidation = centralizedUser.validateSync();
        if (centralizedUserValidation) {
          console.error("Validation error:", centralizedUserValidation);
          throw new Error(`Validation failed: ${JSON.stringify(centralizedUserValidation.errors)}`);
        }
        
        await centralizedUser.save();
      }
      
      // Remove password from response
      const userResponse = savedUser && savedUser.toObject ? savedUser.toObject() : (savedUser || {});
      delete userResponse.password;
      
      // Return success response
      return res.status(201).json({
        success: true,
        message: `User successfully saved to ${userDepartment} system and central administrative system`,
        user: {
          ...userResponse,
          department: capitalizeFirstLetter(userDepartment)
        }
      });
      
    } catch (error) {
      console.error("User registration error:", error.message);
      
      // Handle specific errors
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'Email already exists in the system',
          error: error.message
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Error saving user',
        error: error.message
      });
    }
  };
  
  // Helper function to capitalize the first letter of a string
  function capitalizeFirstLetter(string) {
    if (!string) return '';
    // First convert to lowercase, then capitalize first letter
    const lowerCaseString = string.toLowerCase();
    return lowerCaseString.charAt(0).toUpperCase() + lowerCaseString.slice(1);
  }
  // Additional user-related controller methods
 

  export const loginUser = async (req, res) => {
    const { identifier, password } = req.body;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const MAX_ATTEMPTS = 5;
  
    try {
        // Step 1: Check if we're already rate-limited based on IP
        // For IP-based rate limiting only, don't use identifier here
        const initialRateCheck = await checkLoginRateLimit(null, null, ipAddress);
        
        if (initialRateCheck.isLocked) {
            return res.status(429).json({
                message: "Too many failed login attempts. Please try again later.",
                lockedUntil: initialRateCheck.lockedUntil,
                remainingTime: initialRateCheck.remainingTime
            });
        }
  
        // Step 2: Find user by email or username
        const user = await User.findOne({
            $or: [
                { email: identifier },
                { username: identifier }
            ]
        });
  
        // Step 3: Check if the user account is already locked
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
  
        // Step 4: If user doesn't exist, log attempt but don't reveal this info
        if (!user) {
            await logLoginAttempt({
                identifier,
                ipAddress,
                userAgent,
                status: 'user_not_found',  // Changed from 'failed' to 'user_not_found'
                reason: 'User not found'
            });
  
            // For security, still show generic message but don't show attempt counts
            return res.status(401).json({
                message: "Invalid credentials"
                // Removed remainingAttempts here
            });
        }
  
        // Step 5: Verify password

        const isPasswordValid = await bcryptjs.compare(password, user.password);
  
        if (!isPasswordValid) {
            // Log failed attempt first
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
  
            // Check rate limiting after logging the failed attempt
            const rateCheckResult = await checkLoginRateLimit(user._id, identifier, ipAddress);
            
            if (rateCheckResult.isLocked) {
                return res.status(429).json({
                    message: "Too many failed login attempts. This account has been temporarily locked.",
                    lockedUntil: rateCheckResult.lockedUntil,
                    remainingTime: rateCheckResult.remainingTime
                });
            }
  
            return res.status(401).json({
                message: "Invalid credentials",
                remainingAttempts: rateCheckResult.remainingAttempts
            });
        }
  
        // Step 6: Successful login - log it
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
        const logData = {
          name: user.name,
          role: user.role,
          department: user.department,
          route: req.originalUrl,
          action: 'Login Successful',
          description: `Login successful from IP: ${ipAddress}, User-Agent: ${userAgent}`
      };
  
      const newActivity = new Activitytracker(logData);
      await newActivity.save();
      console.log('Login activity logged successfully:', logData);
  
        // Step 7: Check for unusual login patterns
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
  
        // Step 8: Reset failed attempts counter on successful login
        await resetFailedAttempts(user._id, identifier);
  
        // Step 9: Update last login info
        user.lastLogin = new Date();
        user.lastIpAddress = ipAddress;
        await user.save();
  
        // Step 10: Generate tokens and return response
        const accessToken = generateAccessToken({ id: user._id, username: user.username });
        const refreshToken = generateRefreshToken({ id: user._id, username: user.username });
  
        res.status(200).json({
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

const detectAnomaly = async (userId, ipAddress, userAgent) => {
    const recentAttempts = await LoginAttempt.find({ userId, ipAddress }).sort({ timestamp: -1 }).limit(5);

    if (recentAttempts.length >= 5) {
        const lastAttempt = recentAttempts[0];
        const timeDiff = new Date() - new Date(lastAttempt.timestamp);

        if (timeDiff < 60000) { // If there are 5 attempts within a minute
            const anomaly = new Anomaly({
                userId,
                ipAddress,
                userAgent,
                reason: 'Multiple login attempts in a short period'
            });
            await anomaly.save();
        }
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
      const isMatch = await bcryptjs.compare(currentPassword, user.password);
      if (!isMatch) {
          return res.status(400).json({ success: false, message: "Current password is incorrect" });
      }

      // Hash the new password
      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(newPassword, salt);

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
      // Find user
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

      // Store OTP in database
      try {
          await OTP.create({ email, otp, expiresAt: otpExpiresAt });
      } catch (dbError) {
          console.error("Database error when creating OTP:", dbError);
          return res.status(500).json({ message: "Database error when creating OTP" });
      }

      // Send OTP via email
      try {
          await sendOTPEmail(email, otp);
      } catch (emailError) {
          console.error("Email sending error:", emailError);
          // Don't return success if email fails!
          return res.status(500).json({ message: "Failed to send OTP email" });
      }

      // Only return success if everything worked
      res.status(200).json({ message: "OTP sent to your email" });

  } catch (error) {
      console.error("Unexpected error in generateOTP:", error);
      res.status(500).json({ message: "Error generating OTP" });
  }
};

export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  try {
      // Log debugging information
      console.log(`Verifying OTP for email: ${email}, IP: ${ipAddress}`);
      
      const validOTP = await OTP.findOne({ email, otp });
      console.log("Found OTP:", validOTP);
      
      if (!validOTP || new Date(validOTP.expiresAt) < new Date()) {
          return res.status(400).json({ message: "Invalid or expired OTP" });
      }

      // Check if user exists and is locked before attempting to unlock
      const user = await User.findOne({ email });
      console.log("User account status before unlock:", 
          user ? { accountLocked: user.accountLocked, lockExpiration: user.lockExpiration } : "User not found");
      
      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }

      // More thorough reset of failed attempts
      try {
          // Update using direct MongoDB calls to ensure all records are updated
          await LoginAttempt.updateMany(
              { 
                  $or: [
                      { identifier: email },
                      { ipAddress: ipAddress }
                  ],
                  status: 'failed'
              },
              { $set: { status: 'reset' } }
          );
          
          console.log("Reset failed login attempts");
      } catch (resetError) {
          console.error("Error resetting failed attempts:", resetError);
          // Continue execution even if this fails
      }
      
      // Explicitly update the user account to ensure it's unlocked
      const updateResult = await User.updateOne(
          { email }, 
          { 
              $set: {
                  accountLocked: false, 
                  lockExpiration: null
              },
              // Also reset any login attempt counters if your schema has them
              $unset: { failedLoginAttempts: "" }
          }
      );
      
      console.log("Account unlock result:", updateResult);
      
      // Delete the used OTP
      await OTP.deleteOne({ email });
      
      // Verify the account was actually unlocked
      const updatedUser = await User.findOne({ email });
      console.log("User account status after unlock:", 
          updatedUser ? { accountLocked: updatedUser.accountLocked, lockExpiration: updatedUser.lockExpiration } : "User not found after update");

      res.status(200).json({ message: "Account unlocked successfully" });

  } catch (error) {
      console.error("Error verifying OTP:", error);
      res.status(500).json({ message: "Error verifying OTP" });
  }
};