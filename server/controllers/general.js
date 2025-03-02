import User from "../model/User.js";
import Employee from '../model/employee.js';

import transaction from "../model/transaction.js";
import Overall from '../model/overall.js';
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Transaction from "../model/transaction.js";
import { createCipheriv } from "crypto";
import Request from "../model/request.js";
import axios from 'axios'
dotenv.config();

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find(); // Fetch all users
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
export const updateUser = async (req, res) => {
    const { role, department, password } = req.body;
    
    try {
        let updateFields = { role, department };

        // If password is provided, hash and update it
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateFields.password = await bcrypt.hash(password, salt);
        } else {
            updateFields.$unset = { password: "" }; // Remove password if empty
        }

        // Find and update the user
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            updateFields,
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find and update Employee record
        const employeeData = {
            userId: updatedUser._id,
            role: updatedUser.role,
            department: updatedUser.department
        };

        let employee = await Employee.findOneAndUpdate(
            { userId: updatedUser._id }, 
            employeeData, 
            { upsert: true, new: true }
        );

        // ✅ Correct response
        return res.status(200).json({ updatedUser, employee });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

//access reviews and recertification
export const accessReview = async (req, res) => {
    try {
        const users = await User.find({}, "name role department permissions");
        if (!users || users.length === 0) {
            return res.status(404).json({ message: "No users found" });
        }

        res.json({ users }); // Send all users with their permissions
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

export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        console.log("Received email:", email); // Debug email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });
        console.log("Generated token:", token); // Debug token

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER, // Use env variables
                pass: process.env.EMAIL_PASS,
            },
        });

        // Verify transporter configuration
        transporter.verify((error, success) => {
            if (error) {
                console.error("Email server configuration error:", error);
                return res.status(500).json({ message: "Email server error", error: error.message });
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Reset your password",
            text: `Reset link: http://localhost:3000/resetpass/${user._id}/${token}`,
        };

        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully"); // Debug email sent
        res.status(200).json({ message: "Reset link sent to your email" });
    } catch (err) {
        console.error("Server error:", err); // Log error
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

export const resetPassword = async (req, res) => {
    const { id, token } = req.params;
    const { password } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ Status: "User not found" });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        
        // Normalize role to be case-insensitive
        if (user.role) {
            user.role = user.role.toLowerCase();
        }

        await user.save();
        res.json({ Status: "Success" });

    } catch (err) {
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
  