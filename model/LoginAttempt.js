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
    error: String,
    // Add an expiration field for TTL
    expiresAt: { type: Date, default: () => Date.now() + 30 * 24 * 60 * 60 * 1000 } // 30 days from now
});

// Add TTL index on the `expiresAt` field
loginAttemptSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Add other indexes for performance
loginAttemptSchema.index({ ipAddress: 1, timestamp: -1 });
loginAttemptSchema.index({ identifier: 1, timestamp: -1 });
loginAttemptSchema.index({ userId: 1, timestamp: -1 });
loginAttemptSchema.index({ status: 1, timestamp: -1 });

export default mongoose.model('LoginAttempt', loginAttemptSchema);