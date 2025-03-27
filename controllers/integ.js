import User from "../model/User.js";
import axios from 'axios';
import jwt from 'jsonwebtoken'
import bcryptjs from 'bcryptjs'
import dotenv from 'dotenv'


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

export const external = async (req, res) => {
    try {
      const { email, password } = req.body;
      const { department } = req.params; // Get department from URL parameter
  
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
  
      // Validate department (assuming these are the only valid ones)
      const validDepartments = ["HR", "Core", "Logistics", "Finance"];
      if (!validDepartments.includes(department)) {
        return res.status(400).json({ message: "Invalid department" });
      }
  
      // Find user by email and department
      const user = await User.findOne({ email, department });
      if (!user) {
        return res.status(404).json({ message: "User not found or not in this department" });
      }
  
      // Verify password
      const isMatch = await bcryptjs.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, role: user.role, department: user.department },
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
  
      // Respond with token and user info
      res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
        },
      });
  
    } catch (error) {
      console.error("Error:", error.message);
      res.status(500).json({ message: "Internal Server Error" });
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