// model/notif.js
import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['registration', 'permission_update', 'permission_revoke', 'request_status', 'button_click', 'system'], 
    required: true 
  },
  userId: { type: String }, // For user-specific notifications
  read: { type: Boolean, default: false },
  metadata: { type: mongoose.Schema.Types.Mixed }, // For storing additional structured data
  createdAt: { type: Date, default: Date.now, expires: 518400 } // 6 days in seconds
});

const Notification = mongoose.model("Notification", NotificationSchema);
export default Notification;