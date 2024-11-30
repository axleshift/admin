import Product from "../model/Product.js";
import Customer from "../model/Customer.js";
import User from "../model/User.js";
import UserActivity from "../model/useractivity.js";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateUsername } from "../UTIL/generateCode.js";
import Joi from "joi";
import PasswordComplexity from "joi-password-complexity";
import {generateOAuthToken }from '../UTIL/jwt.js'


  
const passwordComplexityOptions = {
    min: 8,
    max: 30,
    lowerCase: 1,
    upperCase: 1,
    numeric: 1,
    symbol: 1,
    requirementCount: 4,
};





export const getWorker = async (req, res) => {
    try {
      const workers = await User.find({ role: { $in: ["manager", "admin", "employee"] } }).select("-password");
  
      // Ensure consistent data
      const sanitizedWorkers = workers.map((worker) => ({
        ...worker._doc,
        username: worker.username || "", // Ensure username is never undefined
        email: worker.email || "", // Ensure email is never undefined
      }));
  
      res.status(200).json(sanitizedWorkers);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  };
  
export const generateOAuth = async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }

    try {
        // Find the user in the database
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if the user already has a token and if it is still valid
        if (user.token && user.tokenExpiry > new Date()) {
            return res
                .status(200)
                .json({ token: user.token, message: "Token already exists and is valid." });
        }

        // Generate a new token using the imported function
        const token = generateOAuthToken(userId);
        const tokenExpiry = new Date(Date.now() + 3600 * 1000); // 1 hour expiration

        // Update the user record with the new token
        user.token = token;
        user.tokenExpiry = tokenExpiry;
        await user.save();

        // Respond with the new token
        res.status(200).json({ token, message: "New token generated successfully." });
    } catch (err) {
        console.error("Error generating token:", err);
        res.status(500).json({ error: "Failed to generate token" });
    }
};

export const getperform = async (req, res)=>{
    try{
        const users =await User.find({}, 'name performance'); // Get names and performance reviews
        res.json(users);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    }
    
    
// Update a user's role
export const changeUserRole = async (req, res) => {
    const { newRole } = req.body;
    try {
        // Find the user by id
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update the user's role
        user.role = newRole;

        // Regenerate the username based on the new role
        user.username = generateUsername(newRole); // Regenerate the username

        // Save the updated user to the database
        const updatedUser = await user.save();

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Delete a user
export const deleteUser = async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Register User

export const registerUser = async (req, res) => {
    const { name, email, password, phoneNumber, role, adminUsername, department } = req.body;
    console.log("Received registration data:", req.body);

    // Validate input
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
        role: Joi.string().valid("admin", "manager", "employee", "user").required(),
        adminUsername: Joi.string().when("role", { is: Joi.valid("admin", "manager", "employee"), then: Joi.required() }),
        department: Joi.string().required() // New field for department
    });

    const { error } = schema.validate({ name, email, password, phoneNumber, role, adminUsername, department });
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    try {
        // Check for existing user
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already exists" });
        }

        // Check for admin username if applicable
        if (["admin", "manager", "employee"].includes(role)) {
            const existingAdmin = await User.findOne({ username: adminUsername, role: "admin" });
            if (!existingAdmin) {
                return res.status(400).json({ error: "Invalid admin username" });
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            phoneNumber,
            role,
            department, // Save the department
            username: generateUsername(role), // Example username generation
        });

        const savedUser = await newUser.save();
        const userResponse = savedUser.toObject();
        delete userResponse.password; // Don't send password back to client

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

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        req.session.user = { id: user._id, username: user.username, name: user.name, role: user.role };

        // Log login activity
        const loginActivity = new UserActivity({
            userId: user._id,
            route: "User Login",
            timestamp: new Date()
        });
        await loginActivity.save();

        res.status(200).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
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

export const logUserActivity = async (req, res) => {
    try {
      const { userId, action, route } = req.body;
  
      const userActivity = new UserActivity({
        userId,
        action,
        route,
      });
  
      await userActivity.save();
      res.status(200).json({ message: 'User activity logged successfully' });
    } catch (error) {
      console.error(error); // Log the error for debugging
      res.status(500).json({ error: 'Error logging user activity' });
    }
  };