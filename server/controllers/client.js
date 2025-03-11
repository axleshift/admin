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
//integrate model
import coreuser from '../model/coreuser.js'
import financeuser from '../model/financeuser.js'
import hruser from '../model/hruser.js';
import logisticuser from '../model/logisticuser.js'
import { generateCode, generateUsername } from "../UTIL/generateCode.js";
import bcrypt from 'bcrypt';





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
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
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
 
// export const registerUser = async (req, res) => {
//     const { name, email, password, phoneNumber, role, adminUsername, department } = req.body;
//     console.log("Received registration data:", req.body);

//     // Validate input
//     const schema = Joi.object({
//         name: Joi.string().required(),
//         email: Joi.string().email().required(),
//         password: Joi.string()
//             .min(8)
//             .pattern(/[a-z]/, "lowercase")
//             .pattern(/[A-Z]/, "uppercase")
//             .pattern(/[0-9]/, "numbers")
//             .pattern(/[@$!%*?&#]/, "special characters")
//             .required(),
//         phoneNumber: Joi.string().optional(),
//         role: Joi.string().valid("admin", "manager", "employee", "user").required(),
//         adminUsername: Joi.string().when("role", { is: Joi.valid("admin", "manager", "employee"), then: Joi.required() }),
//         department: Joi.string().required() // New field for department
//     });

//     const { error } = schema.validate({ name, email, password, phoneNumber, role, adminUsername, department });
//     if (error) {
//         return res.status(400).json({ error: error.details[0].message });
//     }

//     try {
//         // Check for existing user
//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             return res.status(400).json({ error: "Email already exists" });
//         }

//         // Check for admin username if applicable
//         if (["admin", "manager", "employee"].includes(role)) {
//             const existingAdmin = await User.findOne({ username: adminUsername, role: "admin" });
//             if (!existingAdmin) {
//                 return res.status(400).json({ error: "Invalid admin username" });
//             }
//         }

//         // Hash password
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // Save user
//         const newUser = new User({
//             name,
//             email,
//             password: hashedPassword,
//             phoneNumber,
//             role,
//             department, // Save the department
//             username: generateUsername(role), // Example username generation
//         });

//         const savedUser = await newUser.save();
//         const userResponse = savedUser.toObject();
//         delete userResponse.password; // Don't send password back to client

//         res.status(201).json(userResponse);
//     } catch (error) {
//         console.error("Registration error:", error.message);
//         res.status(500).json({ message: "Server error. Please try again later.", error: error.message });
//     }
// };

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

        if (user.accountLocked && user.lockExpiration > Date.now()) {
            return res.status(429).json({ message: "Account is locked. Use OTP to login" });
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

            // Detect anomaly
            await detectAnomaly(user._id, ipAddress, userAgent);

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

        // Update last login info
        user.lastLogin = new Date();
        user.lastIpAddress = ipAddress;
        await user.save();

        // Generate tokens
        const accessToken = generateAccessToken({ id: user._id, username: user.username });
        const refreshToken = generateRefreshToken({ id: user._id, username: user.username });

        // Send tokens in response
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

