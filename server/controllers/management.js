import cron from "node-cron";
import { exec } from "child_process";
import path from "path";
import fs from "fs";
import express from "express";
import dotenv from "dotenv";
import Announcement from "../model/Announcement.js";
import { fileURLToPath } from 'url';  // Add this import
import { dirname } from 'path';       // Add this import
import { generateBanner } from "../UTIL/aiImageGenerator.js"
import User from '../model/User.js';
import jwt from 'jsonwebtoken'
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


  

  export const announce = async (req, res) => {
    try {
      const { title, message } = req.body;
      
      // Check if required fields are provided
      if (!title || !message) {
        return res.status(400).json({ 
          success: false, 
          message: "Title and message are required fields" 
        });
      }
      
      // Create new announcement object
      const newAnnouncement = new Announcement({
        title,
        message,
        // Include banner filename if a file was uploaded
        banner: req.file ? req.file.filename : null
      });
      
      // Save to database
      const savedAnnouncement = await newAnnouncement.save();
      
      res.status(201).json({
        success: true,
        message: "Announcement created successfully",
        announcement: savedAnnouncement
      });
    } catch (error) {
      console.error("Error creating announcement:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create announcement",
        error: error.message
      });
    }
  };
  
  // Get announcements with pagination
  export const getannounce = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5;
      const skip = (page - 1) * limit;
      
      // Get total count
      const totalCount = await Announcement.countDocuments();
      const totalPages = Math.ceil(totalCount / limit);
      
      // Get announcements with pagination, sorted by creation date (newest first)
      const announcements = await Announcement.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      res.status(200).json({
        success: true,
        announcements,
        currentPage: page,
        totalPages,
        totalCount
      });
    } catch (error) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch announcements",
        error: error.message
      });
    }
  };
  
  // Delete an announcement
  export const delannounce = async (req, res) => {
    try {
      const { id } = req.params;
      
      // Find the announcement to get the banner filename
      const announcement = await Announcement.findById(id);
      
      if (!announcement) {
        return res.status(404).json({ 
          success: false, 
          message: "Announcement not found" 
        });
      }
      
      // Delete banner file if it exists
      if (announcement.banner) {
        const bannerPath = path.join(__dirname, '..', 'uploads', announcement.banner);
        if (fs.existsSync(bannerPath)) {
          fs.unlinkSync(bannerPath);
        }
      }
      
      // Delete from database
      await Announcement.findByIdAndDelete(id);
      
      res.status(200).json({
        success: true,
        message: "Announcement deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting announcement:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to delete announcement",
        error: error.message
      });
    }
  };
  export const generateAiBanner = async (req, res) => {
    try {
      const { prompt } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required for banner generation' });
      }
      
      console.log(`Generating banner with prompt: "${prompt}"`);
      
      // Ensure the uploads directory exists
      const uploadsDir = path.join(__dirname, '..', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      // Generate the banner
      const bannerFilename = await generateBanner(prompt);
      
      res.status(200).json({ 
        success: true, 
        banner: bannerFilename,
        bannerUrl: `/uploads/${bannerFilename}`
      });
    } catch (error) {
      console.error("Error in AI banner generation:", error);
      res.status(500).json({ 
        error: 'Failed to generate banner', 
        message: error.message 
      });
    }
  };



//   export const getUserDep = async (req, res) => {
//     // This function looks good as is, no changes needed
//     try {
//       const { department } = req.params;
//       const { systemId } = req.system; // From the verified token
    
//       // Validate department
//       const validDepartments = ["HR", "Core", "Logistics", "Finance", "Administrative"];
//       if (!validDepartments.includes(department)) {
//         return res.status(400).json({ 
//           success: false, 
//           message: 'Invalid department. Must be one of: HR, Core, Logistics, Finance, Administrative' 
//         });
//       }
      
//       // Fetch active users from the specified department
//       const users = await User.find({ 
//         department: department,
//         isActive: true 
//       }).select('-password -token -refreshToken -otp -otpExpires -resetPasswordToken -resetPasswordExpires');
      
//       // Log the access for audit purposes
//       console.log(`External system ${systemId} accessed ${department} department data at ${new Date().toISOString()}`);
    
//       // Return the users
//       return res.status(200).json({
//         success: true,
//         count: users.length,
//         data: users
//       });
      
//     } catch (error) {
//       console.error('Error retrieving department users:', error);
//       return res.status(500).json({
//         success: false,
//         message: 'Server error while retrieving department users',
//         error: process.env.NODE_ENV === 'development' ? error.message : undefined
//       });
//     }
//   }
// export const genSysToken = (req, res) => {
//     try {
//       const { systemId, department } = req.body;
      
//       // Validate inputs
//       if (!systemId || !department) {
//         return res.status(400).json({
//           success: false,
//           message: 'SystemId and department are required'
//         });
//       }
      
//       // Call the token generation function with the extracted parameters
//       const token = generateSystemToken(systemId, department);
      
//       return res.status(200).json({
//         success: true,
//         token
//       });
//     } catch (error) {
//       console.error('Error generating system token:', error);
//       return res.status(500).json({
//         success: false,
//         message: 'Server error while generating token',
//         error: process.env.NODE_ENV === 'development' ? error.message : undefined
//       });
//     }
//   };