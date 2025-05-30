import Customer from "../model/Customer.js";
import User from "../model/User.js";
import Joi from "joi";
import LoginAttempt from '../model/LoginAttempt.js';
import Anomaly from '../model/Anomaly.js';
import axios from 'axios'
import { RecaptchaEnterpriseServiceClient } from '@google-cloud/recaptcha-enterprise';
import dotenv from 'dotenv';

dotenv.config();
import {
    logLoginAttempt,
    checkForUnusualLogin,
    getRecentFailedAttempts,
    createSecurityAlert,
    checkLoginRateLimit,
    createAccountLockoutAlert,
    createLogger
} from '../UTIL/securityUtils.js';
import { sendOTPEmail,sendAccountLockedEmail } from "../services/emailService.js";
import OTP from '../model/OTP.js'; // Ensure the correct path
import {resetFailedAttempts} from '../UTIL/resetFailedattempts.js'
const OTP_EXPIRY = 10 * 60 * 1000; 
import { generateAccessToken, generateRefreshToken } from '../middleware/generateToken.js';
import { resetPassword } from "./general.js";
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

import { generateCode, generateUsername,generatePassword } from "../UTIL/generateCode.js";
import bcryptjs from 'bcryptjs'
import NewUser from "../model/newUser.js";




// Register User
const HR1 = 'https://backend-hr1.axleshift.com';
export const userSchema = Joi.object({
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

// Improved utility function to handle department capitalization
function formatDepartment(department) {
  if (!department) return '';
  
  // Create a mapping of special department names
  const specialDepartments = {
    'hr': 'HR',
    'it': 'IT',
    'r&d': 'R&D'
  };
  
  // Check if the department is a special case (case insensitive)
  const lowerDepartment = department.trim().toLowerCase();
  if (specialDepartments[lowerDepartment]) {
    return specialDepartments[lowerDepartment];
  }
  
  // Otherwise use the original capitalize function
  return capitalizeFirstLetter(department);
}

// Utility function to capitalize first letter
function capitalizeFirstLetter(string) {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

// Process registrations for new hires - NEW FUNCTION
export const processRegistrations = async (req, res) => {
  try {
    // Get new hires from the external HR system
    const newHiresResponse = await axios.get(`${HR1}/api/newhires`);
    const newHires = newHiresResponse.data;
    
    // Filter out already registered users (if your API provides this info)
    const unregisteredHires = newHires.filter(hire => !hire.registered);
    const initialRegisteredHires = newHires.filter(hire => hire.registered);
    
    if (unregisteredHires.length === 0) {
      return res.status(200).json({
        success: true,
        message: initialRegisteredHires.length > 0 ? 
          `All ${initialRegisteredHires.length} hires are already registered` : 
          'No new hires to register',
        registeredUsers: [],
        alreadyRegistered: initialRegisteredHires.map(hire => ({
          firstName: hire.firstName,
          lastName: hire.lastName,
          email: hire.email
        }))
      });
    }
    
    
    // Array to store registered users with their generated passwords
    const registeredUsers = [];
    
    // Process each unregistered hire
    for (const hire of unregisteredHires) {
      // Extract necessary fields from hire data
      const { 
        firstName, 
        lastName, 
        email, 
        position, // This will be used as role and position
        department,
        phoneNumber: phone = '',
        address = '',
      } = hire;
      
      // Skip if missing required fields
      if (!firstName || !lastName || !email || !position || !department) {
        console.warn(`Skipping hire due to missing fields: ${firstName || ''} ${lastName || ''}`);
        continue;
      }
      
      // Check if email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.warn(`Skipping hire with existing email: ${email}`);
        continue;
      }
      
      // Generate password
      const generatedPassword = generatePassword(firstName, lastName, department);
      
      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcryptjs.hash(generatedPassword, saltRounds);
      
      // Normalize fields
      const normalizedDepartment = formatDepartment(department);
      const normalizedRole = position.trim().toLowerCase(); // Using position as role
      
      // Prepare user data
      const userData = {
        name: `${firstName} ${lastName}`.trim(),
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: normalizedRole,
        position: position.trim(), // Set position explicitly
        department: normalizedDepartment,
        phoneNumber: phone || '0000000000',
        username: generateUsername(normalizedRole),
        
        // Default fields
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
      
      // Create new user
      const newUser = new User(userData);
      
      // Validate user
      try {
        const validationError = newUser.validateSync();
        if (validationError) {
          console.error("Validation error for hire:", {
            name: `${firstName} ${lastName}`,
            errors: Object.values(validationError.errors).map(err => err.message)
          });
          continue;
        }
      } catch (validationError) {
        console.error("Validation sync error:", validationError);
        continue;
      }
      
      // Save user
      const savedUser = await newUser.save();
      
      // Add to registered users with generated password
      registeredUsers.push({
        firstName,
        lastName,
        email,
        generatedPassword,
        userId: savedUser._id
      });
      
      // Option: Update the external HR system to mark as registered
      // This depends on whether the external API supports this operation
      try {
        await axios.patch(`${HR1}/api/newhires/${hire._id}`, {
          registered: true,
          generatedPassword // Note: sending password to external system might not be ideal
        });
      } catch (updateErr) {
        console.warn(`Failed to update registration status in HR system for ${email}`, updateErr.message);
      }
    }
    
    // Gather information about already registered users
    // Changed variable name to avoid redeclaration
    const finalRegisteredHires = newHires.filter(hire => hire.registered && 
      !registeredUsers.some(user => user.email === hire.email));
      
    // Return response with registered users and already registered users
    return res.status(200).json({
      success: true,
      message: `Successfully registered ${registeredUsers.length} new hires${
        finalRegisteredHires.length > 0 ? 
        `. ${finalRegisteredHires.length} ${
          finalRegisteredHires.length === 1 ? 'hire was' : 'hires were'
        } already registered.` : ''
      }`,
      registeredUsers,
      alreadyRegistered: finalRegisteredHires.map(hire => ({
        firstName: hire.firstName,
        lastName: hire.lastName,
        email: hire.email
      }))
    });
    
  } catch (error) {
    console.error("Error processing registrations:", {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    
    return res.status(500).json({
      success: false,
      message: 'Failed to process registrations',
      error: error.message
    });
  }
};

// Original saveUser function - kept for reference or direct user creation
export const saveUser = async (req, res) => {
  console.log("Received user data:", req.body);
  
  try {
    const { 
      id, 
      firstName, 
      lastName, 
      email, 
      role, 
      department,
      phone = '',
      address = '',
      image = ''
    } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !role || !department) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        missingFields: [
          !firstName && 'First Name',
          !lastName && 'Last Name',
          !email && 'Email',
          !role && 'Role',
          !department && 'Department'
        ].filter(Boolean)
      });
    }
    
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists in the system'
      });
    }
    
    // Automatically generate a password
    const generatedPassword = generatePassword(firstName, lastName, department);
    
    // Hash the password using bcryptjs
    const saltRounds = 10;
    const hashedPassword = await bcryptjs.hash(generatedPassword, saltRounds);
    
    // Normalize and validate department and role
    const normalizedDepartment = formatDepartment(department);
    const normalizedRole = role.toLowerCase().trim();
    
    // Prepare user data
    const userData = {
      name: `${firstName} ${lastName}`.trim(),
      firstName,
      lastName,
      email,
      password: hashedPassword, // Store hashed password
      role: normalizedRole,
      position: role.trim(), // Add position field with the original role value
      department: normalizedDepartment,
      phoneNumber: phone || '0000000000',
      username: generateUsername(normalizedRole),
      
      // Default additional fields
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
    
    // Create and save new user
    const newUser = new User(userData);
    
    // Additional validation
    try {
      const validationError = newUser.validateSync();
      if (validationError) {
        console.error("Mongoose validation error:", validationError);
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: Object.values(validationError.errors).map(err => err.message)
        });
      }
    } catch (validationError) {
      console.error("Validation sync error:", validationError);
      return res.status(400).json({
        success: false,
        message: 'User validation failed',
        error: validationError.message
      });
    }
    
    // Save user
    const savedUser = await newUser.save();
    
    // Remove sensitive information before sending response
    const userResponse = savedUser.toObject();
    delete userResponse.password;
    
    // IMPORTANT: Return the generated password to be sent to the user
    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: userResponse,
      generatedPassword: generatedPassword
    });
    
  } catch (error) {
    console.error("Comprehensive error in user creation:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
      code: error.code
    });
    
    // Handle specific error types
    if (error.name === 'MongoError' && error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate key error',
        error: 'Email already exists'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Unexpected error occurred during user creation',
      error: error.message
    });
  }
};
  
export const loginUser = async (req, res) => {
    const { identifier, password } = req.body;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const MAX_ATTEMPTS = 5;
    const LOCK_DURATION_MINUTES = 15;
  
    try {
      // Validate input
      if (!identifier || !password) {
        return res.status(400).json({
          message: "Email/username and password are required"
        });
      }
  
      // Step 1: Find user by email or username
      let user = await User.findOne({
        $or: [
          { email: identifier },
          { username: identifier }
        ]
      });
  
      // RAPID LOGIN DETECTION - Direct implementation
      if (user) {
        // IMPORTANT: Fix for missing position field - Directly update before validation happens
        if (!user.position && user.role) {
          try {
            // Use updateOne to bypass schema validation temporarily
            await User.updateOne(
              { _id: user._id },
              { $set: { position: user.role } }
            );
            console.log(`Updated missing position for user: ${user._id}`);
            
            // Refresh user object with updated data
            user = await User.findById(user._id);
          } catch (updateError) {
            console.error("Error fixing user position:", updateError);
            // Continue with login process anyway - we'll handle errors later
          }
        }
        
        const userId = user._id;
        const currentTime = new Date();
        
        // Get recent login attempts in the last 5 minutes
        const timeWindow = 5 * 60 * 1000; // 5 minutes
        const cutoffTime = new Date(currentTime.getTime() - timeWindow);
        
        const recentAttempts = await LoginAttempt.find({
          userId: userId,
          timestamp: { $gte: cutoffTime }
        }).sort({ timestamp: -1 });
        
        console.log(`Found ${recentAttempts.length} recent login attempts in the last 5 minutes for user ${userId}`);
        
        // Define thresholds for rapid login detection
        const MEDIUM_THRESHOLD = 3;  // 3 attempts in 5 minutes = medium risk
        const HIGH_THRESHOLD = 5;    // 5 attempts in 5 minutes = high risk
        const CRITICAL_THRESHOLD = 8; // 8 attempts in 5 minutes = critical risk
        
        let threatLevel = 'normal';
        let reason = '';
        let score = 0;
        
        // Calculate score and determine threat level
        if (recentAttempts.length >= CRITICAL_THRESHOLD) {
          threatLevel = 'critical';
          reason = `${recentAttempts.length} login attempts in 5 minutes - possible brute force attack`;
          score = 0.9;
        } else if (recentAttempts.length >= HIGH_THRESHOLD) {
          threatLevel = 'high';
          reason = `${recentAttempts.length} login attempts in 5 minutes - suspicious activity`;
          score = 0.7;
        } else if (recentAttempts.length >= MEDIUM_THRESHOLD) {
          threatLevel = 'medium';
          reason = `${recentAttempts.length} login attempts in 5 minutes - unusual activity`;
          score = 0.5;
        }
        
        // If we detected rapid login attempts
        if (threatLevel !== 'normal') {
          // Calculate time between attempts to detect scripted attacks
          let minTimeBetweenAttempts = Number.MAX_VALUE;
          for (let i = 1; i < recentAttempts.length; i++) {
            const timeDiff = new Date(recentAttempts[i-1].timestamp) - new Date(recentAttempts[i].timestamp);
            minTimeBetweenAttempts = Math.min(minTimeBetweenAttempts, timeDiff);
          }
          
          // If attempts are too regular or too fast, increase threat level
          if (minTimeBetweenAttempts < 2000 && recentAttempts.length > 3) { // less than 2 seconds between attempts
            threatLevel = 'critical';
            reason += ' - Automated attack suspected (attempts too rapid)';
            score = 0.95;
          }
          
          // Create and store the anomaly record
          try {
            const anomaly = new Anomaly({
              userId: userId,
              ipAddress: ipAddress,
              userAgent: userAgent,
              score: score,
              features: {
                rapidLoginAttempts: score,
                timeOfDayAnomaly: 0,
                locationAnomaly: 0,
                deviceAnomaly: 0,
                behavioralAnomaly: 0,
              },
              threatLevel: threatLevel,
              reason: reason,
              timestamp: currentTime
            });
            
            await anomaly.save();
            console.log("Rapid login anomaly saved successfully:", {
              userId: userId.toString(),
              threatLevel,
              score,
              reason
            });
            
            // Create security alert
            await createSecurityAlert(userId, 'rapid_login_detected', {
              ipAddress,
              userAgent,
              attemptCount: recentAttempts.length,
              timeWindow: '5 minutes',
              minTimeBetweenAttempts: `${minTimeBetweenAttempts}ms`
            });
            
            // If threat is critical, block login immediately
            if (threatLevel === 'critical') {
              await logLoginAttempt({
                identifier,
                userId: user._id,
                name: user.name,
                department: user.department,
                role: user.role,
                ipAddress,
                userAgent,
                status: 'blocked',
                reason: 'Rapid login detection - critical threat'
              });
              
              return res.status(403).json({
                message: "Login blocked due to too many rapid attempts. Please try again later or contact support.",
                cooldown: true,
                cooldownMinutes: 15
              });
            }
          } catch (error) {
            console.error("Error saving rapid login anomaly:", error);
          }
        }
      }
      // END OF RAPID LOGIN DETECTION
  
      // Step 2: Check if the user account is already locked
      if (user && user.accountLocked && user.lockExpiration > new Date()) {
        const remainingTime = Math.ceil((user.lockExpiration - new Date()) / 1000);
        
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
          remainingTime: remainingTime
        });
      }
  
      // If account was locked but lock has expired, unlock it
      if (user && user.accountLocked && user.lockExpiration <= new Date()) {
        user.accountLocked = false;
        user.lockExpiration = null;
        await user.save();
        
        console.log(`Account unlocked for user: ${user._id}`);
      }
  
      // Step 3: If user doesn't exist, log attempt but don't reveal this info
      if (!user) {
        await logLoginAttempt({
          identifier,
          ipAddress,
          userAgent,
          status: 'user_not_found',
          reason: 'User not found'
        });
  
        // Consistent delay to prevent timing attacks
        await delay(200);
        
        // For security, show generic message but don't show attempt counts
        return res.status(401).json({
          message: "Invalid credentials"
        });
      }
  
      // Step 4: Verify password
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
  
        // Get current failed attempt count
        const failedAttemptsCount = await getFailedAttemptsCount(user._id);
        
        // Check if we've reached the maximum attempts
        if (failedAttemptsCount >= MAX_ATTEMPTS) {
          // Lock the account
          const lockoutUntil = new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000);
          user.accountLocked = true;
          user.lockExpiration = lockoutUntil;
          await user.save();
          
          await sendAccountLockedEmail(user.email, "15 minutes");

          // Create security alert for account lockout
          await createAccountLockoutAlert(user._id, ipAddress, userAgent);
          
          console.log(`Account locked for user: ${user._id}, until: ${lockoutUntil}`);
          
          return res.status(429).json({
            message: "Too many failed login attempts. This account has been temporarily locked.",
            lockedUntil: lockoutUntil,
            remainingTime: Math.ceil((lockoutUntil - new Date()) / 1000)
          });
        }
        
        // Add a small delay to prevent timing attacks
        await delay(200);
  
        // Return remaining attempts
        return res.status(401).json({
          message: "Invalid credentials",
          remainingAttempts: MAX_ATTEMPTS - failedAttemptsCount
        });
      }
  
      // Step 5: Check account status (only for active accounts)
      if (!user.isActive) {
        await logLoginAttempt({
          userId: user._id,
          identifier,
          name: user.name,
          department: user.department,
          role: user.role,
          ipAddress,
          userAgent,
          status: 'unauthorized',
          reason: 'Inactive account'
        });
        
        return res.status(403).json({
          message: "Account is inactive. Please contact support."
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
      
      // Log activity
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
      const accessToken = generateAccessToken({ 
        id: user._id, 
        username: user.username,
        role: user.role 
      });
      
      const refreshToken = generateRefreshToken({ 
        id: user._id, 
        username: user.username 
      });
  
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
  }
  
  // Helper function for the delay
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to count failed attempts
const getFailedAttemptsCount = async (userId) => {
  try {
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
      
      const count = await LoginAttempt.countDocuments({
          userId,
          status: 'failed',
          timestamp: { $gte: fifteenMinutesAgo }
      });
      
      return count;
  } catch (error) {
      console.error("Error counting failed attempts:", error);
      return 0;
  }
};

export const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required" });
  }
  
  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const { id, username } = decoded;
    
    // Find user
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Generate new access token
    const accessToken = generateAccessToken({ 
      id: user._id, 
      username: user.username,
      role: user.role 
    });
    
    // Optional: generate new refresh token for enhanced security
    // const newRefreshToken = generateRefreshToken({ id: user._id, username: user.username });
    
    res.status(200).json({
      accessToken,
      // refreshToken: newRefreshToken // Uncomment if you want to rotate refresh tokens
    });
    
  } catch (error) {
    console.error("Refresh token error:", error);
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};
// Helper function to count failed attempts


const client = new RecaptchaEnterpriseServiceClient({
  keyFilename: process.env.RECAPTCHA_SERVICE_ACCOUNT_KEY, // Path to the JSON file
});

export const verifyCaptcha = async (req, res, next) => {
  const { captchaToken } = req.body;

  if (!captchaToken) {
    return res.status(400).json({ message: "CAPTCHA token is required" });
  }

  const projectPath = client.projectPath(process.env.GOOGLE_CLOUD_PROJECT_ID);

  try {
    const [response] = await client.createAssessment({
      parent: projectPath,
      assessment: {
        event: {
          token: captchaToken,
          siteKey: process.env.RECAPTCHA_KEY,
        },
      },
    });

    if (!response.tokenProperties?.valid) {
      return res.status(403).json({ message: "Invalid CAPTCHA token" });
    }

    if (response.riskAnalysis?.score < 0.5) {
      return res.status(403).json({ message: "CAPTCHA verification failed" });
    }

    next();
  } catch (error) {
    console.error("CAPTCHA verification failed:", error);
    return res.status(500).json({ message: "CAPTCHA verification service unavailable" });
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
  const { email, currentPassword, newPassword, passwordAnalysis } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Validate current password
    const isMatch = await bcryptjs.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: "Current password is incorrect" 
      });
    }

    // Enhanced password validation function
    const validatePasswordStrength = (password, analysis) => {
      // Always validate basic requirements regardless of AI analysis
      if (!password || password.length < 8) {
        return { valid: false, message: "Password must be at least 8 characters long" };
      }
      
      // Check if password contains at least one uppercase, lowercase, number, and special character
      const hasUppercase = /[A-Z]/.test(password);
      const hasLowercase = /[a-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
      
      if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
        return { 
          valid: false, 
          message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character" 
        };
      }
      
      // Check AI analysis score if available
      if (analysis && analysis.score !== undefined) {
        if (analysis.score < 40) {
          return { 
            valid: false, 
            message: "Password does not meet minimum security requirements based on analysis" 
          };
        }
      }
      
      return { valid: true, message: "Password meets requirements" };
    };

    // Validate password strength
    const passwordData = passwordAnalysis || { score: 40, strength: 'Moderate' };
    const validation = validatePasswordStrength(newPassword, passwordData);
    
    if (!validation.valid) {
      return res.status(400).json({ 
        success: false, 
        message: validation.message
      });
    }

    // Check if password exists in the user's password history (including current password)
    const passwordsToCheck = [user.password, ...(user.passwordHistory || [])];
    
    // Create an array of promises for password comparison
    const passwordMatchPromises = passwordsToCheck.map(async (hashedPassword) => {
      return await bcryptjs.compare(newPassword, hashedPassword);
    });
    
    // Check if new password matches any stored password
    const passwordMatchResults = await Promise.all(passwordMatchPromises);
    const isPasswordReused = passwordMatchResults.some(result => result === true);
    
    if (isPasswordReused) {
      return res.status(400).json({
        success: false,
        code: "PASSWORD_RECENTLY_USED",
        message: "This password was recently used. Please choose a password you haven't used within the last 6 months."
      });
    }

    // Hash the new password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(newPassword, salt);
    
    // Update password history - add current password to history before updating
    if (!user.passwordHistory) {
      user.passwordHistory = [];
    }
    
    // Add current password to history
    user.passwordHistory.push(user.password);
    
    // Keep only the 6 most recent passwords (6 months history)
    if (user.passwordHistory.length > 6) {
      user.passwordHistory = user.passwordHistory.slice(-6);
    }
    
    // Update the password
    user.password = hashedPassword;
    
    // Update password metadata
    user.passwordMeta = {
      lastChanged: new Date(),
      strength: passwordData.strength || 'Moderate',
      score: passwordData.score || 40,
      validationPassed: true
    };
    
    await user.save();

    return res.json({ 
      success: true, 
      message: "Password changed successfully" 
    });

  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
}


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