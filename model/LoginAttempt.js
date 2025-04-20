import mongoose from "mongoose";

const loginAttemptSchema = new mongoose.Schema({
    identifier: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    name: String,
    department: String,
    role: String,
    ipAddress: String,
    userAgent: String,
    timestamp: { type: Date, default: Date.now },
    status: { 
        type: String, 
        enum: ['attempted', 'success', 'failed', 'user_not_found', 'unauthorized', 'error', 'reset'],
        required: true 
    },
    reason: String,
    error: String
});

// Add indexes for better performance with anomaly detection queries
loginAttemptSchema.index({ ipAddress: 1, timestamp: -1 });
loginAttemptSchema.index({ identifier: 1, timestamp: -1 });
loginAttemptSchema.index({ userId: 1, timestamp: -1 });
loginAttemptSchema.index({ status: 1, timestamp: -1 });

export default mongoose.model('LoginAttempt', loginAttemptSchema);