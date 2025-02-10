
import Log from '../model/Log.js';
import { createLog } from '../controllers/try.js';  

import Customer from "../model/Customer.js";

import User from "../model/User.js";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateUsername } from "../UTIL/generateCode.js";
import Joi from "joi";
import PasswordComplexity from "joi-password-complexity";
import {generateOAuthToken }from '../UTIL/jwt.js'
import { io } from "../index.js"; // Import Socket.IO instance

  
const passwordComplexityOptions = {
    min: 8,
    max: 30,
    lowerCase: 1,
    upperCase: 1,
    numeric: 1,
    symbol: 1,
    requirementCount: 4,
};





// Register User


export const registerUser = async (req, res) => {
    const { name, email, password, phoneNumber, role, department } = req.body;
  
    // Validate the request payload
    const schema = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string()
        .min(8)
        .pattern(/[a-z]/, "lowercase")
        .pattern(/[A-Z]/, "uppercase")
        .pattern(/[0-9]/, "numbers")
        .pattern(/[@$!%*?&#]/, "special characters")
        .required(),
      phoneNumber: Joi.string().optional(),
      role: Joi.string().valid("admin", "manager", "superadmin").required(),
      department: Joi.string().valid("HR", "Core", "Logistics", "Finance", "Administrative").required(),
    });
  
    const { error } = schema.validate({ name, email, password, phoneNumber, role, department });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
  
    try {
      // Check if the email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "Email already exists" });
      }
  
      // Generate a hashed password
      const hashedPassword = await bcrypt.hash(password, 10);
      const username = generateUsername(role);
  
      // Create the new user
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        phoneNumber,
        role,
        department,
        username,
      });
  
      // Save the user in the database
      const savedUser = await newUser.save();
      const userResponse = savedUser.toObject();
      delete userResponse.password;
  
      // Emit event via Socket.IO
      io.emit("newUserRegistered", {
        message: "A new user has registered!",
        user: {
          id: savedUser._id,
          name: savedUser.name,
          email: savedUser.email,
          role: savedUser.role,
          department: savedUser.department,
        },
      });
  
      res.status(201).json(userResponse);
    } catch (error) {
      console.error("Registration error:", error.message);
      res.status(500).json({ message: "Server error. Please try again later.", error: error.message });
    }
  };

  
// Login endpoint
export const loginUser = async (req, res) => {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
        return res.status(400).json({ message: "Identifier and password are required" });
    }

    try {
        const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] });

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate JWT Access Token
        const accessToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        // Generate Refresh Token
        const refreshToken = jwt.sign(
            { id: user._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "7d" }
        );

        // Save the refresh token in the database
        user.refreshToken = refreshToken;
        await user.save();

        // ✅ Log User Data Before Setting Session
        console.log("User Object Before Session Set:", user);

        // Set session data
        req.session.user = { 
            id: user._id, 
            username: user.username, 
            name: user.name, 
            role: user.role, 
            department: user.department,
            permissions: user.permissions
        };


        // Log the login action
        await createLog(req.session.user, 'Login', 'User logged into the system');

        // ✅ Return session data along with tokens
        res.status(200).json({
            accessToken,
            refreshToken,
            user: req.session.user, // Return session data
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};



export const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token is required' });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id);

        if (!user || user.refreshToken !== refreshToken) {
            return res.status(400).json({ message: 'Invalid refresh token' });
        }

        const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });

        res.status(200).json({ accessToken });
    } catch (error) {
        console.error("Refresh token error:", error); // Log the error for debugging
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
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

