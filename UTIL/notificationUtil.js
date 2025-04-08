// File: UTIL/notificationUtil.js

import Notification from "../model/notif.js";
import { io } from "../index.js";

export const createNotification = async (notificationData) => {
  try {
    // Validate required fields
    const { title, message, type } = notificationData;
    if (!title || !message || !type) {
      console.error("Missing required notification fields");
      return null;
    }

    // Create notification document
    const newNotification = new Notification(notificationData);
    
    // Save to database
    const savedNotification = await newNotification.save();
    console.log(`Notification created: ${savedNotification._id} (${type})`);
    
    // Emit to all connected clients via Socket.io
    if (io) {
      io.emit("notification", savedNotification);
    } else {
      console.warn("Socket.io instance not available for notification emission");
    }
    
    return savedNotification;
  } catch (error) {
    console.error("Failed to create notification:", error);
    return null;
  }
};


export const createUserActivityNotification = async ({ 
  user, 
  action, 
  type = "system",
  includeDetails = true 
}) => {
  if (!user || !action) {
    console.error("Missing user or action for user activity notification");
    return null;
  }

  // Extract user details with fallbacks
  const userId = user._id;
  const userName = user.name || "Unknown User";
  const userEmail = user.email || "No Email";
  const userRole = user.role || "Unknown Role";
  const userDepartment = user.department || "Unknown Department";
  
  // Construct message based on whether to include details
  let message;
  if (includeDetails) {
    message = `${userName} (${userEmail}, ${userRole}, ${userDepartment}) ${action}.`;
  } else {
    message = `${userName} ${action}.`;
  }

  // Store additional user details in a metadata field for future reference
  const metadata = {
    userName,
    userEmail,
    userRole,
    userDepartment
  };

  return createNotification({
    title: `User Activity: ${action}`,
    message,
    type,
    userId,
    metadata  // Note: This would require adding a metadata field to your Notification model
  });
};


export const createSystemNotification = async (title, message) => {
  return createNotification({
    title,
    message,
    type: "system"
  });
};

export default {
  createNotification,
  createUserActivityNotification,
  createSystemNotification
};