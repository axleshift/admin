import mongoose from 'mongoose';

const activityTrackerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  department: { type: String, required: true },
  route: { type: String, required: true },
  action: { type: String, required: true },
  description: { type: String, required: true },
  aiAnalysis: { 
    fullAnalysis: { type: String, default: 'AI analysis unavailable' },
    category: { type: String, default: 'General activity' },
    patterns: { type: String, default: 'No unusual patterns detected' },
    riskLevel: { type: String, default: 'UNKNOWN' }
  },
  timestamp: { type: Date, default: Date.now }
}, { collection: 'activitytracker' });

const ActivityTracker = mongoose.model('ActivityTracker', activityTrackerSchema);

export default ActivityTracker;