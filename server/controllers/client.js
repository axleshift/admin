import Product from "../model/Product.js";
import Customer from "../model/Customer.js";
import User from "../model/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateUsername } from "../UTIL/generateCode.js";
import Joi from "joi";
import PasswordComplexity from "joi-password-complexity";

const passwordComplexityOptions = {
    min: 8,
    max: 30,
    lowerCase: 1,
    upperCase: 1,
    numeric: 1,
    symbol: 1,
    requirementCount: 4,
};

export const getProducts = async (req, res) => {
    try {
        const products = await Product.find();

        const productsWithStats = await Promise.all(
            products.map(async (product) => {
                const stat = await ProductStat.find({
                    productId: product._id,
                });
                return {
                    ...product._doc,
                    stat,
                };
            })
        );

        res.status(200).json(productsWithStats);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

export const getCustomers = async (req, res) => {
    try {
        const customers = await Customer.find(); 
        res.status(200).json(customers);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

export const getWorker = async (req, res) => {
    try {
        const workers = await User.find({ role: { $in: ["manager", "admin", "employee"] } }).select("-password");
        res.status(200).json(workers);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

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
    const { name, email, password, phoneNumber, role, adminUsername } = req.body;
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
    });

    const { error } = schema.validate({ name, email, password, phoneNumber, role, adminUsername });
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

    console.log("Request body:", req.body);

    try {
        const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] });

        if (!user) {
            console.error("User not found for identifier:", identifier);
            return res.status(400).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        if (!req.session) {
            return res.status(500).json({ message: "Session is not initialized" });
        }

        req.session.user = { id: user._id, username: user.username, name: user.name, email: user.email, phoneNumber: user.phoneNumber, role: user.role };

        res.status(200).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Login error:", error.message);
        console.error("Full error object:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
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
