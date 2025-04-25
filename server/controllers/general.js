import User from "../model/User.js";
import Overall from '../model/overall.js';
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import bcryptjs from 'bcryptjs';
import dotenv from "dotenv";
import Transaction from "../model/transaction.js";
import Request from '../model/request.js'
import crypto from 'crypto';
import { analyzeActivityWithAI } from "../services/geminiService.js";
import Activitytracker from '../model/Activitytracker.js';
import PasswordResetEvent from '../model/PasswordResetEvent.js';
import mongoose from 'mongoose'
dotenv.config();

//openai



// Backend: Enhanced accessReview controller
export const accessReview = async (req, res) => {
  try {
      const users = await User.find({}, "name role department permissions lastReviewDate reviewStatus reviewHistory");
      if (!users || users.length === 0) {
          return res.status(404).json({ message: "No users found" });
      }

      res.json({ users }); // Send all users with their permissions and review information
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
  }
};

// New endpoint to handle recertification actions
export const recertifyUserAccess = async (req, res) => {
  try {
      const { userId, approved, rejected, notes } = req.body;
      
      // Handle cases where user auth data isn't available
      const reviewerId = req.user?.id || 'system'; 
      const reviewerName = req.user?.name || 'System User';
      
      if (!userId) {
          return res.status(400).json({ message: "User ID is required" });
      }
      
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }
      
      // Create review history entry
      const reviewEntry = {
          date: new Date(),
          reviewerId,
          reviewerName,
          notes,
          approvedPermissions: approved || [],
          rejectedPermissions: rejected || []
      };
      
      // Update permissions based on review
      if (rejected && rejected.length > 0) {
          user.permissions = user.permissions.filter(perm => !rejected.includes(perm));
      }
      
      // Update user review information
      user.lastReviewDate = new Date();
      user.reviewStatus = "Completed";
      
      // Add to review history (create if doesn't exist)
      if (!user.reviewHistory) {
          user.reviewHistory = [];
      }
      user.reviewHistory.push(reviewEntry);
      
      await user.save();
      
      res.json({ message: "Access recertification completed successfully", user });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
  }
};

// Initiate access review
export const initiateAccessReview = async (req, res) => {
  try {
      const { department, role } = req.query;
      let filter = {};
      
      if (department) filter.department = department;
      if (role) filter.role = role;
      
      // Mark users for review
      const result = await User.updateMany(
          filter,
          { 
              $set: { 
                  reviewStatus: "Pending",
                  reviewInitiatedDate: new Date()
              } 
          }
      );
      
      // Log the initiation
   
      
      res.json({ 
          message: `Access review initiated for ${result.nModified} users`,
          usersAffected: result.nModified
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
  }
};


export const getUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json(user);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const baseUrl = process.env.NODE_ENV === "development" ? process.env.DEV_URL : process.env.CLIENT_URL;

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    console.log("Received email:", email);
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });

    // Use CLIENT_URL for production and DEV_URL for development
    const clientUrl = process.env.NODE_ENV === "development"
      ? process.env.DEV_URL
      : process.env.CLIENT_URL;

    if (!clientUrl) {
      console.error("CLIENT_URL environment variable is not set");
      return res.status(500).json({ message: "Server configuration error" });
    }

    const resetLink = `${clientUrl}/resetpass/${user._id}/${token}`;
    console.log("Generated reset link:", resetLink);

    // Configure Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com", // Use environment variable or default to Gmail
      port: process.env.SMTP_PORT || 587, // Default to port 587 for TLS
      secure: false, // Use TLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates
      },
      connectionTimeout: 10000, // Increase timeout to 10 seconds
    });

    // Verify transporter configuration
    await transporter.verify();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Reset your password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hello,</p>
          <p>You requested to reset your password. Please click the link below to set a new password:</p>
          <p style="margin: 20px 0;">
            <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
          </p>
          <p>If you didn't request this, please ignore this email or contact support if you have concerns.</p>
          <p>This link will expire in 24 hours.</p>
          <p>If the button above doesn't work, copy and paste this URL into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetLink}</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");

    res.status(200).json({
      message: "Reset link sent to your email",
      userId: user._id,
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};
export const resetPassword = async (req, res) => {
  const { id, token } = req.params;
  const { password, passwordAnalysis } = req.body;

  try {
    // Verify the JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (tokenErr) {
      if (tokenErr.name === "TokenExpiredError") {
        return res.status(400).json({ Status: "Error", Message: "Token has expired" });
      }
      return res.status(400).json({ Status: "Error", Message: "Invalid token" });
    }

    // Ensure the token's user ID matches the provided ID
    if (decoded.id !== id) {
      return res.status(400).json({ Status: "Error", Message: "Invalid token or user ID mismatch" });
    }

    // Find the user by ID
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ Status: "Error", Message: "User not found" });
    }

    console.log("Processing password reset for user:", user.email);

    // Check if the password was recently used
    if (user.passwordHistory && user.passwordHistory.length > 0) {
      const isPasswordReused = await Promise.all(
        user.passwordHistory.map(async (hashedPassword) => bcryptjs.compare(password, hashedPassword))
      ).then((results) => results.some((match) => match));

      if (isPasswordReused) {
        return res.status(400).json({
          Status: "Error",
          Code: "PASSWORD_RECENTLY_USED",
          Message: "This password was recently used. Please choose a new password.",
        });
      }
    }

    // Validate password strength
    const validatePasswordStrength = (password, analysis) => {
      if (!password || password.length < 8) {
        return { valid: false, message: "Password must be at least 8 characters long" };
      }
      const hasUppercase = /[A-Z]/.test(password);
      const hasLowercase = /[a-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

      if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
        return {
          valid: false,
          message: "Password must contain uppercase, lowercase, number, and special character",
        };
      }

      if (analysis && analysis.score < 40) {
        return { valid: false, message: "Password does not meet security requirements" };
      }

      return { valid: true, message: "Password is valid" };
    };

    const validation = validatePasswordStrength(password, passwordAnalysis || { score: 40 });
    if (!validation.valid) {
      return res.status(400).json({ Status: "Error", Message: validation.message });
    }

    // Hash the new password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Update password history
    if (!user.passwordHistory) user.passwordHistory = [];
    if (user.password) user.passwordHistory.push(user.password);

    // Keep only the passwords from the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    user.passwordHistory = user.passwordHistory.filter((passwordEntry) => {
      const passwordDate = new Date(passwordEntry.timestamp || 0); // Assuming timestamps are stored
      return passwordDate >= sixMonthsAgo;
    });

    // Update the user's password
    user.password = hashedPassword;
    user.passwordMeta = {
      lastChanged: new Date(),
      strength: passwordAnalysis?.strength || "Moderate",
      score: passwordAnalysis?.score || 40,
    };

    await user.save();

    res.json({ Status: "Success", Message: "Password reset successful" });
  } catch (err) {
    console.error("Password reset error:", err);
    res.status(500).json({ Status: "Error", Message: "Internal Server Error", error: err.message });
  }
};

// Helper function to store password reset events
const storePasswordResetEvent = async (userId, passwordData, validationPassed, validation, req) => {
  try {
    const password = req.body.password; // Get the password from the request body
    
    await PasswordResetEvent.create({
      userId: userId,
      timestamp: new Date(),
      passwordAnalysis: {
        score: passwordData.score || 0,
        strength: passwordData.strength || 'Weak',
        feedback: passwordData.feedback || [],
        explanation: passwordData.explanation || ''
      },
      validationPassed: validationPassed,
      validationDetails: {
        passed: validation.valid,
        message: validation.message,
        checks: {
          hasLength: password?.length >= 8 || false,
          hasUppercase: /[A-Z]/.test(password) || false,
          hasLowercase: /[a-z]/.test(password) || false,
          hasNumber: /[0-9]/.test(password) || false,
          hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) || false,
          meetsScoreThreshold: (passwordData.score || 0) >= 40
        }
      },
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent']
    });
    
    console.log("Password reset event stored successfully");
  } catch (err) {
    console.error("Failed to store password reset event:", err.message);
    // Don't throw error, just log it - this shouldn't affect the main reset process
  }
};

export const validateResetToken = async (req, res) => {
  const { id, token } = req.params;

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Ensure the token's user ID matches the provided ID
    if (decoded.id !== id) {
      return res.status(400).json({ Status: "Error", Message: "Invalid token or user ID mismatch" });
    }

    // Check if the user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ Status: "Error", Message: "User not found" });
    }

    res.status(200).json({ Status: "Success", Message: "Token is valid" });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(400).json({ Status: "Error", Message: "Token has expired" });
    }
    res.status(400).json({ Status: "Error", Message: "Invalid token" });
  }
};

export const getDashboardStats = async (req, res) => {
    try {
      // hardcoded values
      const currentMonth = "November";
      const currentYear = 2024;
      const currentDay = "2024-01-15";
  
      /* Recent Transactions */
      const transactions = await Transaction.find()
        .limit(50)
        .sort({ createdOn: -1 });
  
      /* Overall Stats */
      const overall = await Overall.find({ year: currentYear });
  
      const {
        totalCustomers,
        yearlyTotalSoldUnits,
        yearlySalesTotal,
        monthlyData, 
        salesByCategory,
      } = overall[0];
  
      const thisMonthStats = overall[0].monthlyData.find(({ month }) => {
        return month === currentMonth;
      });
  
      const todayStats = overall[0].dailyData.find(({ date }) => {
        return date === currentDay;
      });
  
      res.status(200).json({
        totalCustomers,
        yearlyTotalSoldUnits,
        yearlySalesTotal,
        monthlyData,
        salesByCategory,
        thisMonthStats,
        todayStats,
        transactions,
      });
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  };

  export const receiveREQ = async (req, res) => {
    try {
      const requestData = req.body;
      console.log('Received Request:', requestData);
      
      if (!requestData.id) {
        requestData.id = `req-${Date.now()}`;
      }
      
      requestData.senderUrl = req.headers.referer || req.headers.origin || req.headers.host || "";
      console.log("Stored sender URL:", requestData.senderUrl);
      
      const newRequest = new Request(requestData);
      await newRequest.save();
      
      res.status(200).json({
        message: 'Request received successfully',
        data: newRequest
      });
    } catch (error) {
      console.error('Error saving request:', error.message);
      res.status(500).json({
        message: 'Error processing request',
        error: error.message
      });
    }
  };
  
  export const sendREQ = async (req, res) => {
    const requestData = req.body;
    
    try {
      const request = await Request.findOne({ id: requestData.id });
      if (!request) {
        return res.status(404).json({ message: 'Request not found' });
      }
      
      // Update request status regardless of callback success
      const updatedRequest = await Request.findOneAndUpdate(
        { id: requestData.id },
        { 
          status: "approved",
          approvedAt: new Date()
        },
        { new: true }
      );
      
      // Try to send callback if senderUrl exists
      if (request.senderUrl) {
        try {
          // Parse the URL to get the origin
          const urlObj = new URL(request.senderUrl);
          // Construct proper API endpoint - this is a common pattern
          const callbackUrl = `${urlObj.origin}/api/request-callback`;
          
          console.log("Attempting to send request status to:", callbackUrl);
          
          // Try to send notification but don't fail if it doesn't work
          try {
            await axios.post(callbackUrl, {
              id: request.id,
              status: "approved",
              approvedAt: new Date()
            });
            console.log("Successfully sent status update to sender");
          } catch (callbackError) {
            console.warn("Failed to send status update to sender:", callbackError.message);
            // Continue processing - don't throw error
          }
        } catch (urlError) {
          console.warn("Invalid sender URL format, skipping callback:", urlError.message);
          // Continue processing - don't throw error
        }
      }
      
      // Return success regardless of callback result
      res.status(200).json({
        message: 'Request approved successfully',
        data: updatedRequest
      });
    } catch (error) {
      console.error('Error in sendREQ:', error);
      res.status(500).json({
        message: 'Error processing request approval',
        error: error.message || error.toString()
      });
    }
  };
  
  export const getRequests = async (req, res) => {
    try {
      const requests = await Request.find().sort({ createdAt: -1 });
      res.status(200).json(requests);
    } catch (error) {
      console.error('Error fetching requests:', error.message);
      res.status(500).json({
        message: 'Error fetching requests',
        error: error.message
      });
    }
  };

  export const activity = async (req, res) => {
    try {
      const { name, role, department, route, action, description } = req.body;
      
      // Validate input data
      if (!name || !role || !department || !route || !action || !description) {
        return res.status(400).json({ error: 'All fields are required.' });
      }
      
      // Get AI analysis for this activity
      const aiAnalysisResult = await analyzeActivityWithAI({
        name, role, department, route, action, description
      });
  
      // Create and save activity with AI analysis
      const newActivity = new Activitytracker({
        name,
        role,
        department,
        route,
        action,
        description,
        aiAnalysis: aiAnalysisResult // Store the complete object
      });
      
      await newActivity.save();
      console.log('Activity with AI analysis saved successfully.');
      
      res.status(201).json({ 
        message: 'Activity logged successfully.',
        aiAnalysis: aiAnalysisResult
      });
      
    } catch (error) {
      console.error('Error saving activity:', error.message);
      res.status(500).json({ error: error.message });
    }
  };
  
  export const getact = async (req, res) => {
    try {
      // Check database connection
      if (mongoose.connection.readyState !== 1) {
        console.error('Database connection not established');
        return res.status(500).json({ message: 'Database connection error' });
      }
  
      // Get activities from database
      const activities = await Activitytracker.find().sort({ timestamp: -1 });
  
      // Transform activities to ensure proper data structure
      const formattedActivities = activities.map(activity => {
        // Convert Mongoose document to plain object
        const plainActivity = activity.toObject ? activity.toObject() : { ...activity };
  
        // Process AI analysis to ensure consistent format for the frontend
        if (plainActivity.aiAnalysis) {
          // If `aiAnalysis` is an object, ensure all fields are properly included
          if (typeof plainActivity.aiAnalysis === 'object') {
            plainActivity.aiStructuredAnalysis = {
              category: plainActivity.aiAnalysis.category || 'General activity',
              patterns: plainActivity.aiAnalysis.patterns || 'No unusual patterns detected',
              riskLevel: plainActivity.aiAnalysis.riskLevel || 'UNKNOWN',
            };
            plainActivity.aiAnalysis = plainActivity.aiAnalysis.fullAnalysis || 'AI analysis unavailable';
          }
          // If `aiAnalysis` is a string that appears to be JSON, parse it
          else if (typeof plainActivity.aiAnalysis === 'string' && plainActivity.aiAnalysis.startsWith('{')) {
            try {
              const parsed = JSON.parse(plainActivity.aiAnalysis);
              plainActivity.aiStructuredAnalysis = {
                category: parsed.category || 'General activity',
                patterns: parsed.patterns || 'No unusual patterns detected',
                riskLevel: parsed.riskLevel || 'UNKNOWN',
              };
              plainActivity.aiAnalysis = parsed.fullAnalysis || 'AI analysis unavailable';
            } catch (e) {
              console.error('Error parsing AI analysis:', e);
              plainActivity.aiAnalysis = 'AI analysis unavailable';
            }
          }
          // If `aiAnalysis` is a plain string, treat it as the full analysis
          else {
            plainActivity.aiAnalysis = plainActivity.aiAnalysis || 'AI analysis unavailable';
            plainActivity.aiStructuredAnalysis = {
              category: 'General activity',
              patterns: 'No unusual patterns detected',
              riskLevel: 'UNKNOWN',
            };
          }
        } else {
          // Default values if `aiAnalysis` is missing
          plainActivity.aiAnalysis = 'AI analysis unavailable';
          plainActivity.aiStructuredAnalysis = {
            category: 'General activity',
            patterns: 'No unusual patterns detected',
            riskLevel: 'UNKNOWN',
          };
        }
  
        return plainActivity;
      });
  
      res.status(200).json(formattedActivities);
    } catch (error) {
      console.error('Error retrieving activity logs:', error);
      res.status(500).json({ message: error.message });
    }
  };

//notification
