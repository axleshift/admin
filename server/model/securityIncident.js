// Create a new model file in your models directory

import mongoose from 'mongoose';

const securityIncidentSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  type: {
    type: String,
    required: true,
    enum: [
      'Failed Login',
      'Brute Force Attempt',
      'Unauthorized Access',
      'Suspicious Activity',
      'Privilege Escalation',
      'Data Breach',
      'API Abuse',
      'Session Hijacking'
    ]
  },
  severity: {
    type: String,
    required: true,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  status: {
    type: String,
    required: true,
    enum: ['New', 'In Progress', 'Resolved', 'Ignored'],
    default: 'New'
  },
  username: {
    type: String
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String
  },
  location: {
    type: String
  },
  details: {
    type: String,
    required: true
  },
  affectedResource: {
    type: String
  },
  resolvedBy: {
    type: String
  },
  resolutionNotes: {
    type: String
  },
  resolvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
securityIncidentSchema.index({ timestamp: -1 });
securityIncidentSchema.index({ severity: 1 });
securityIncidentSchema.index({ status: 1 });
securityIncidentSchema.index({ ipAddress: 1 });
securityIncidentSchema.index({ username: 1 });

export const SecurityIncident = mongoose.model('SecurityIncident', securityIncidentSchema);