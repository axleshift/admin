import mongoose from "mongoose";

const anomalySchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: false 
    },
    ipAddress: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        required: true
    },
    identifier: {
        type: String,
        required: false
    },
    reason: {
        type: String,
        required: true
    },
    details: {
        type: Object,
        required: false
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    mitigationStatus: {
        type: String,
        enum: ['detected', 'blocked', 'monitoring', 'resolved', 'false_positive'],
        default: 'detected'
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    resolvedAt: {
        type: Date,
        default: null
    },
    resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    notes: {
        type: String,
        required: false
    }
});

// Add indexes for performance
anomalySchema.index({ userId: 1, timestamp: -1 });
anomalySchema.index({ ipAddress: 1, timestamp: -1 });
anomalySchema.index({ reason: 1 });
anomalySchema.index({ severity: 1 });
anomalySchema.index({ mitigationStatus: 1 });

const Anomaly = mongoose.model('Anomaly', anomalySchema);

export default Anomaly;