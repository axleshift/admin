import User from "../model/User.js";
import Overall from '../model/overall.js';
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import bcryptjs from 'bcryptjs';
import dotenv from "dotenv";
import Transaction from "../model/transaction.js";
import Request from '../model/request.js'
import { analyzeActivityWithAI } from "../services/geminiService.js";
import Activitytracker from '../model/Activitytracker.js';
import mongoose from 'mongoose'
dotenv.config();
import notificationUtil from "../UTIL/notificationUtil.js";
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
        console.log("Generated token:", token);

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Verify transporter configuration
        await new Promise((resolve, reject) => {
            transporter.verify((error, success) => {
                if (error) {
                    console.error("Email server configuration error:", error);
                    reject(error);
                } else {
                    resolve(success);
                }
            });
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Reset your password",
      text: `Reset link: ${baseUrl}resetpass/${user._id}/${token}`,
        };

        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully");
        
        res.status(200).json({ 
            message: "Reset link sent to your email",
            userId: user._id
        });
    } catch (err) {
        console.error("Server error:", err);
        res.status(500).json({ 
            message: "Server error", 
            error: err.message 
        });
    }
};
export const resetPassword = async (req, res) => {
  const { id, token } = req.params;
  const { password, passwordAnalysis } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    
    // Get full user details for notification
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ Status: "User not found" });

    // Enhanced password validation function
    const validatePasswordStrength = (password, analysis) => {
      // Always validate basic requirements regardless of AI analysis
      if (password.length < 8) {
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
      if (analysis) {
        if (analysis.score < 40) {
          return { 
            valid: false, 
            message: "Password does not meet minimum security requirements based on AI analysis" 
          };
        }
      }
      
      return { valid: true, message: "Password meets requirements" };
    };

    // Validate password strength
    const validation = validatePasswordStrength(password, passwordAnalysis);
    if (!validation.valid) {
      return res.status(400).json({ 
        Status: "Error", 
        Message: validation.message
      });
    }

    // Update password if validation passes
    const salt = await bcryptjs.genSalt(10);
    user.password = await bcryptjs.hash(password, salt);
    
    user.passwordMeta = {
      lastChanged: new Date(),
      strength: passwordAnalysis?.strength || 'Unknown',
      score: passwordAnalysis?.score || 0,
      validationPassed: true
    };
    
    await user.save();

    // Create detailed notification using the enhanced utility
    await notificationUtil.createUserActivityNotification({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      },
      action: "has reset their password",
      type: "system",
      includeDetails: true // Include all user details in the message
    });

    res.json({ Status: "Success" });
  } catch (err) {
    // Error handling...
    if (err.name === "JsonWebTokenError") {
      return res.status(400).json({ Status: "Error with token" });
    } else if (err.name === "TokenExpiredError") {
      return res.status(400).json({ Status: "Token has expired" });
    }
    res.status(500).json({ Status: "Internal Server Error", error: err.message });
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
        const plainActivity = activity.toObject ? activity.toObject() : {...activity};
        
        // Process AI analysis to ensure consistent format for the frontend
        if (plainActivity.aiAnalysis) {
          // If it's already a string but not a stringified JSON
          if (typeof plainActivity.aiAnalysis === 'string' && 
              !plainActivity.aiAnalysis.startsWith('{')) {
            // Keep it as is - it's already a text analysis
          }
          // If it's a string that appears to be JSON, parse it
          else if (typeof plainActivity.aiAnalysis === 'string' && 
                  plainActivity.aiAnalysis.startsWith('{')) {
            try {
              const parsed = JSON.parse(plainActivity.aiAnalysis);
              if (parsed.fullAnalysis) {
                plainActivity.aiAnalysis = parsed.fullAnalysis;
              }
            } catch (e) {
              // If parsing fails, keep the original string
            }
          }
          // If it's an object with fullAnalysis property
          else if (typeof plainActivity.aiAnalysis === 'object' && 
                  plainActivity.aiAnalysis.fullAnalysis) {
            // Store the full analysis text for display
            plainActivity.aiAnalysis = plainActivity.aiAnalysis.fullAnalysis;
            
            // Also include the structured data for the UI components
            plainActivity.aiStructuredAnalysis = {
              category: plainActivity.aiAnalysis.category || 'General activity',
              patterns: plainActivity.aiAnalysis.patterns || 'No unusual patterns detected',
              riskLevel: plainActivity.aiAnalysis.riskLevel || 'UNKNOWN'
            };
          }
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
