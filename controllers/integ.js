import User from '../model/User.js';
import axios from 'axios';
import jwt from 'jsonwebtoken'
import bcryptjs from 'bcryptjs' 
import fs from 'fs';
import path from 'path';

import Agreement from '../model/Agreement.js';


export const getUsersByDepartment = async (req, res) => {
    try {
        const { department } = req.params;
        const validDepartments = ["HR", "Core", "Logistics", "Finance"];

        if (!validDepartments.includes(department)) {
            return res.status(400).json({ message: "Invalid department" });
        }

        // Fetch users from the specified department
        const users = await User.find({ department });

        if (users.length === 0) {
            return res.status(404).json({ message: `No users found in the ${department} department` });
        }

        // Check if WEBHOOK_URL is defined
        const webhookUrl = process.env.WEBHOOK_URL;
        if (!webhookUrl) {
            console.error("WEBHOOK_URL is missing in .env file!");
            return res.status(500).json({ message: "Webhook URL is not configured" });
        }

        // Send a webhook after retrieving the users
        const webhookPayload = {
            eventType: 'user_fetched',
            department,
            data: users,
        };

        console.log("Sending webhook to:", webhookUrl);
        console.log("Webhook Payload:", webhookPayload);

        try {
            await axios.post(webhookUrl, webhookPayload, {
                headers: {
                    'x-event-type': 'user_fetched',
                    'Content-Type': 'application/json',
                }
            });
            console.log("Webhook sent successfully.");
        } catch (webhookError) {
            console.error("Failed to send webhook:", webhookError.response?.data || webhookError.message);
        }

        res.status(200).json(users);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: error.message });
    }
};
// controllers/authController.js


export const externaltest = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { department } = req.params;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Email and password are required" 
      });
    }

    // Validate department
    const validDepartments = ["HR", "Core", "Logistics", "Finance","Administrative"];
    if (!validDepartments.includes(department)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid department" 
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "Incorrect email" 
      });
    }

    // Verify department
    if (user.department !== department) {
      return res.status(404).json({ 
        success: false,
        message: "User not found in this department" 
      });
    }

    // Compare password
    const isPasswordMatch = await bcryptjs.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ 
        success: false,
        message: "Incorrect password" 
      });
    }

    // Generate token
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role, 
        department: user.department 
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    // Send Webhook Notification
    const webhookUrl = process.env.WEBHOOK_URL;
    if (webhookUrl) {
      const webhookPayload = {
        eventType: "user_logged_in",
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          department: user.department,
        },
      };

      try {
        await axios.post(webhookUrl, webhookPayload, {
          headers: {
            "x-event-type": "user_logged_in",
            "Content-Type": "application/json",
          },
        });
        console.log("Webhook sent successfully.");
      } catch (webhookError) {
        console.error("Webhook failed:", webhookError.response?.data || webhookError.message);
      }
    }

    // Successful login response
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal Server Error",
      error: error.message 
    });
  }
};



export const external = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { department } = req.params;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Email and password are required" 
      });
    }

    // Validate department
    const validDepartments = ["HR", "Core", "Logistics", "Finance","Administrative"];
    if (!validDepartments.includes(department)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid department" 
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "Incorrect email" 
      });
    }

    // Verify department
    if (user.department !== department) {
      return res.status(404).json({ 
        success: false,
        message: "User not found in this department" 
      });
    }

    // Compare password
    const isPasswordMatch = await bcryptjs.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ 
        success: false,
        message: "Incorrect password" 
      });
    }

    // Generate token
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role, 
        department: user.department 
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    // Send Webhook Notification
    const webhookUrl = process.env.WEBHOOK_URL;
    if (webhookUrl) {
      const webhookPayload = {
        eventType: "user_logged_in",
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          department: user.department,
        },
      };

      try {
        await axios.post(webhookUrl, webhookPayload, {
          headers: {
            "x-event-type": "user_logged_in",
            "Content-Type": "application/json",
          },
        });
        console.log("Webhook sent successfully.");
      } catch (webhookError) {
        console.error("Webhook failed:", webhookError.response?.data || webhookError.message);
      }
    }

    // Successful login response
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal Server Error",
      error: error.message 
    });
  }
};

export const updateProfileImage = async (req, res) => {
  try {
    const { username } = req.params;
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided"
      });
    }
    
    // Find user by username - using findOne instead of find
    const user = await User.findOne({username: username});
    if (!user) {
      // Remove uploaded file if user not found
      if (req.file.path) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Check if user has previous profile image and delete it
    if (user.profileImage && user.profileImage !== 'default-profile.jpg') {
      const oldImagePath = path.join('uploads/profile-images', path.basename(user.profileImage));
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }
    
    // Update user's profile image path in database
    user.profileImage = req.file.filename;
    await user.save();
    
    // Return success response
    res.status(200).json({
      success: true,
      message: "Profile image updated successfully",
      profileImage: req.file.filename
    });
  } catch (error) {
    console.error("Profile Image Update Error:", error);
    
    // If there was an error and a file was uploaded, remove it
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};
export const getExternalUsersByDepartment = async (req, res) => {
    try {
      const { department } = req.params; // Get department from URL parameter
  
      // Validate department
      const validDepartments = ["HR", "Core", "Logistics", "Finance","Administrative"];
      if (!validDepartments.includes(department)) {
        return res.status(400).json({ message: "Invalid department" });
      }
  
      // Find users in the specified department
      const users = await User.find({ department }, "id name email role department");
  
      if (users.length === 0) {
        return res.status(404).json({ message: `No users found in ${department} department` });
      }
  
      res.status(200).json({ users });
  
    } catch (error) {
      console.error("Error fetching users:", error.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };

  export const changePasswordSimple = async (req, res) => {
    // Trim the email to remove any leading or trailing spaces
    const { email: rawEmail, currentPassword, newPassword } = req.body;
    const email = rawEmail.trim();
  
    try {
      // Find the user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      // Validate the current password
      const isMatch = await bcryptjs.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ 
          success: false, 
          message: "Current password is incorrect" 
        });
      }
  
      // Check if the new password is the same as the current password
      const isSamePassword = await bcryptjs.compare(newPassword, user.password);
      if (isSamePassword) {
        return res.status(400).json({
          success: false,
          message: "New password cannot be the same as the current password"
        });
      }
  
      // Hash the new password
      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(newPassword, salt);
  
      // Update the user's password
      user.password = hashedPassword;
      user.passwordMeta = {
        lastChanged: new Date()
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
};

  export const getHRUsers = async (req, res) => {
    try {
      // Find all users with department "HR"
      const hrUsers = await User.find({ department: "HR" });
      
      // Check if any HR users were found
      if (hrUsers.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: "No HR department users found" 
        });
      }
      
      // Return HR users
      return res.status(200).json({
        success: true,
        count: hrUsers.length,
        data: hrUsers
      });
    } catch (error) {
      console.error("Error fetching HR users:", error);
      return res.status(500).json({
        success: false,
        message: "Server error while fetching HR users",
        error: error.message
      });
    }
  };