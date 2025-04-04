// model/LoginAttempt.js
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
        enum: ['attempted', 'success', 'failed', 'unauthorized', 'error'],
        required: true 
    },
    reason: String,
    error: String
});

export default mongoose.model('LoginAttempt', loginAttemptSchema);

