// utils/notificationService.js

import axios from 'axios';
import socket from './socket';


const notificationService = {
 
  async notify({ title, message, type, userId }) {
    try {
      console.log("Sending notification:", { title, message, type, userId });
      
      // Make sure type is valid according to the schema
      const validType = this.validateNotificationType(type);
      
      // Save notification to MongoDB via API
      const response = await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}/notifications/postnotif`,
        {
          title,
          message,
          type: validType,
          userId
        },
        { withCredentials: true }
      );

      // Check if saved successfully
      if (response.data.success) {
        console.log("Notification saved to MongoDB:", response.data);
        
        // Emit through socket for real-time updates
        socket.emit('notification', {
          title,
          message,
          type: validType,
          userId,
          createdAt: new Date()
        });
        
        return response.data.data;
      }
      
      return null;
    } catch (error) {
      console.error("Failed to save notification via API:", error);
      
      // Try socket as fallback with validated type
      const validType = this.validateNotificationType(type);
      socket.emit('notification', {
        title,
        message,
        type: validType,
        userId,
        createdAt: new Date()
      });
      
      throw error;
    }
  },
  

  validateNotificationType(type) {
    // List of valid types according to schema
    const validTypes = [
      'registration', 
      'permission_update', 
      'permission_revoke', 
      'request_status', 
      'button_click',
      'system'
    ];
    
    // If type is valid, return it
    if (validTypes.includes(type)) {
      return type;
    }
    
    // Otherwise map to a default type
    console.warn(`Invalid notification type: ${type}. Using 'system' instead.`);
    return 'system';
  }
};

export default notificationService;