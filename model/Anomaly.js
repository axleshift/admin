// models/Anomaly.js
import mongoose from 'mongoose';

const AnomalySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow anonymous anomalies
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: false
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  features: {
    timeOfDayAnomaly: Number,
    locationAnomaly: Number,
    deviceAnomaly: Number,
    behavioralAnomaly: Number,
    rapidLoginAttempts: Number
  },
  threatLevel: {
    type: String,
    enum: ['normal', 'low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  reason: {
    type: String,
    required: true
  },
  resolved: {
    type: Boolean,
    default: false
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolution: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Add indexes for common queries
AnomalySchema.index({ userId: 1 });
AnomalySchema.index({ ipAddress: 1 });
AnomalySchema.index({ timestamp: -1 });
AnomalySchema.index({ score: -1 });
AnomalySchema.index({ threatLevel: 1 });

const Anomaly = mongoose.model('Anomaly', AnomalySchema);

export default Anomaly;