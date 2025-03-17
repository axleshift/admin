import LoginAttempt from "../model/LoginAttempt.js";
import SecurityAlert from "../model/SecurityAlert.js";
import Anomaly from "../model/Anomaly.js";

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