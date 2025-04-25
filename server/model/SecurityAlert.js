import mongoose from "mongoose";

const securityAlertSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    alertType: String,
    status: String,
    details: String,
    timestamp: { type: Date, default: Date.now },
    resolution: {
        resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        notes: String
    },
    // Add an expiration field for TTL
    expiresAt: { type: Date, default: () => Date.now() + 30 * 24 * 60 * 60 * 1000 } // 30 days from now
});

// Add TTL index on the `expiresAt` field
securityAlertSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('SecurityAlert', securityAlertSchema);