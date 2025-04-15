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