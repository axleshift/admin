import LoginAttempt from "../model/LoginAttempt.js";
import SecurityAlert from "../model/SecurityAlert.js";
import Anomaly from "../model/Anomaly.js";

import zxcvbn from 'zxcvbn';
import axios from 'axios';
import crypto from 'crypto';

//{* Registere possible with ai*}
import Joi from "joi";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

export const getAllAnomalies = async (req, res) => {
    try {
        const anomalies = await Anomaly.find().populate("userId", "name email").sort({ timestamp: -1 });
        return res.json(anomalies);
    } catch (error) {
        console.error("Error fetching anomalies:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};
export const getAllSecurityAlerts = async (req, res) => {
    try {
        const { userId, alertType, status } = req.query; // Optional filters

        // Build dynamic filter object
        const filter = {};
        if (userId) filter.userId = userId;
        if (alertType) filter.alertType = alertType;
        if (status) filter.status = status;

        // Fetch security alerts with filters, sorted by latest
        const securityAlerts = await SecurityAlert.find(filter)
            .populate("userId", "name email") // Populate user details
            .populate("resolution.resolvedBy", "name email") // Populate resolver details
            .sort({ timestamp: -1 });

        return res.json(securityAlerts);
    } catch (error) {
        console.error("Error fetching security alerts:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};
export const getAllLoginAttempts = async (req, res) => {
    try {
        const { userId, status, ipAddress } = req.query; // Optional filters

        // Create a filter object dynamically
        const filter = {};
        if (userId) filter.userId = userId;
        
        // Case-insensitive status filtering
        if (status) {
            // Use regex for case-insensitive matching
            filter.status = { 
                $regex: new RegExp(`^${status}$`, 'i') 
            };
        }
        
        if (ipAddress) filter.ipAddress = ipAddress;

        // Fetch login attempts with filters, sorted by latest
        const loginAttempts = await LoginAttempt.find(filter).sort({ timestamp: -1 });

        return res.json(loginAttempts);
    } catch (error) {
        console.error("Error fetching login attempts:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};



export const logSecurityEvent = async (req, res) => {
  try {
    const { userId, eventType, details } = req.body;
    
    // Here you would typically log to a database
    console.log(`SECURITY EVENT: ${eventType} for user ${userId}`, details);
    
    // In a real implementation, this would be saved to a security log collection
    
    return res.status(200).json({
      success: true,
      message: "Security event logged successfully"
    });
  } catch (error) {
    console.error("Security logging error:", error);
    return res.status(500).json({
      success: false,
      message: "Error logging security event",
      error: error.message
    });
  }
};


export function checkPasswordStrength(password) {
    const result = zxcvbn(password);
    return {
        score: result.score, // 0 (weak) to 4 (strong)
        message: result.feedback.suggestions.join(' ') || 'Strong password.',
    };
}

// Check if password has been exposed in breaches
export async function checkPasswordBreach(password) {
    const hashedPassword = hashPassword(password);
    const firstFiveChars = hashedPassword.slice(0, 5);
    const restOfHash = hashedPassword.slice(5);

    try {
        const response = await axios.get(`https://api.pwnedpasswords.com/range/${firstFiveChars}`);
        const breachedPasswords = response.data.split('\n');

        const isBreached = breachedPasswords.some((line) => line.startsWith(restOfHash));
        return {
            isBreached,
            message: isBreached ? 'Password found in breaches!' : 'Password is safe.',
        };
    } catch (error) {
        return { isBreached: false, message: 'Error checking breach status.' };
    }
}

// Hash password using SHA-1 (for breach check)
function hashPassword(password) {
    return crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
}