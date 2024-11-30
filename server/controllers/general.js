import User from "../model/User.js";
import UserActivity from "../model/useractivity.js";
import transaction from "../model/transaction.js";
import Overall from '../model/overall.js';
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Transaction from "../model/transaction.js";

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

// Controller to get all user activities
export const getUserActivities = async (req, res) => {
    try {
        const activities = await UserActivity.find({})
            .sort({ timestamp: -1 })
            .populate('userId', 'name role'); // Populate with user's name and role for clarity

        res.json(activities);
    } catch (err) {
        res.status(500).send(err);
    }
};
// Controller to log user activity
export const logUserActivity = async (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('Unauthorized');
    }
    try {
        const { url } = req.body;
        const activity = new UserActivity({
            userId: req.session.user.id,
            route: url,
            timestamp: new Date()
        });
        await activity.save();
        res.status(200).send('Activity logged');
    } catch (err) {
        res.status(500).send(err);
    }
};
export const deleteUserActivities = async (req, res) => {
    const { userId } = req.params; // Get user ID from request parameters

    try {
        // Check if activities exist for the given userId
        const activities = await UserActivity.find({ userId });
        if (activities.length === 0) {
            return res.status(404).json({ message: "No activities found for this user." });
        }

        // Delete all activities for the specified userId
        await UserActivity.deleteMany({ userId });
        res.status(200).json({ message: "User activities deleted successfully." });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
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