// File: controllers/notification.js

import Notification from "../model/notif.js";
import { io } from "../index.js";

export const getnotif = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.params.userId;
    // Get both user-specific and general notifications
    const notifications = await Notification.find({
      $or: [{ userId: userId }, { userId: { $exists: false } }]
    }).sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const addnotif = async (req, res) => {
    try {
      const { title, message, type, userId } = req.body;
      
      // Log incoming notification data for debugging
      console.log("Creating notification:", { title, message, type, userId });
      
      // Create new notification document
      const newNotification = new Notification({ 
        title, 
        message, 
        type, 
        userId 
      });
      
      // Save to database
      const savedNotification = await newNotification.save();
      console.log("Notification saved successfully:", savedNotification._id);
      
      // Use the imported io instance directly rather than from req
      if (io) {
        io.emit("notification", savedNotification);
        console.log("Notification emitted via socket");
      } else {
        console.error("Socket.io instance not available");
      }
      
      res.status(201).json({ success: true, data: savedNotification });
    } catch (error) {
      console.error("Failed to save notification:", error);
      res.status(500).json({ 
        success: false, 
        message: "Server Error", 
        error: error.message 
      });
    }
  };

export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const updatedNotification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );
    
    if (!updatedNotification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }
    
    res.status(200).json({ success: true, data: updatedNotification });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};