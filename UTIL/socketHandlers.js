// Add this to your server file (or create a separate socket.js file and import it)

import Notification from "../model/notif.js";

export const setupSocketEvents = (io) => {
    io.on("connection", (socket) => {
      console.log(`✅ A user connected: ${socket.id}`);
  
      // Add this new handler for direct notifications
      socket.on("notification", async (data) => {
        try {
          console.log("Received notification event:", data);
          
          // Create the notification document
          const newNotification = new Notification({
            title: data.title,
            message: data.message,
            type: data.type,
            userId: data.userId
          });
          
          // Save to database
          const savedNotification = await newNotification.save();
          console.log("Notification saved from socket event:", savedNotification._id);
          
          // Broadcast to all clients
          io.emit("notificationReceived", savedNotification);
        } catch (error) {
          console.error("Error saving notification from socket event:", error);
        }
      });
  
      // Other handlers remain the same...
      socket.on("disconnect", () => {
        console.log(`❌ User disconnected: ${socket.id}`);
      });
    });
  };