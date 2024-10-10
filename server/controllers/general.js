import User from "../model/User.js";
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs'; 
import dotenv from 'dotenv';

dotenv.config();

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
        console.log(`Received email for password reset: ${email}`); // Add logging
        const user = await User.findOne({ email });
        if (!user) {
            console.log(`User not found: ${email}`); // Log if user not found
            return res.status(404).json({ message: "User not found" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1d' });
        console.log(`Generated token for user: ${user._id}`); // Log token generation

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user:"ryansangasina1@gmail.com", 
                pass: "dytd rorh jqdv wynb",
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Reset your password',
            text: `Reset link: http://localhost:3000/resetpass/${user._id}/${token}`, // Fix string template
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent to: ${user.email}`); // Log successful email sending
        res.status(200).json({ message: 'Reset link sent to your email' });
    } catch (err) {
        console.error("Error in forgotPassword:", err); // Log the error
        res.status(500).json({ message: "Server error", error: err.message });
    }
};
export const resetPassword = async (req, res) => {
    const { id, token } = req.params;
    const { password } = req.body;

    console.log(`Resetting password for ID: ${id}, Token: ${token}`);

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        console.log("Token verified, decoded data:", decoded);

        // Find the user by ID
        const user = await User.findById(id);
        if (!user) {
            console.log(`User not found with ID: ${id}`);
            return res.status(404).json({ Status: "User not found" });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update the user's password
        user.password = hashedPassword;
        await user.save();

        res.json({ Status: "Success" });
    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            console.error("Invalid token:", err);
            return res.status(400).json({ Status: "Error with token" });
        } else if (err.name === 'TokenExpiredError') {
            console.error("Token expired:", err);
            return res.status(400).json({ Status: "Token has expired" });
        }

        console.error("Error in resetPassword:", err);
        res.status(500).json({ Status: "Internal Server Error", error: err.message });
    }
};