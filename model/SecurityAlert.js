// model/SecurityAlert.js
import mongoose from "mongoose";

const securityAlertSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    alertType: { 
        type: String, 
        enum: ['multiple_failed_attempts', 'unusual_login_detected', 'account_locked','rapid_login_detected',],
        required: true 
    },
    details: Object,
    timestamp: { type: Date, default: Date.now },
    status: { 
        type: String,
        enum: ['active', 'resolved', 'false_positive'],
        default: 'active'
    },
    resolution: {
        resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        resolvedAt: Date,
        notes: String
    }
});

export default mongoose.model('SecurityAlert', securityAlertSchema);