import mongoose from 'mongoose';

const ActivityTrackerSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  department: { type: String, required: true },
  actionType: { type: String, required: true },
  actionDescription: { type: String, required: true, trim: true },
  timestamp: { type: Date, default: Date.now }
});

ActivityTrackerSchema.index({ timestamp: -1 });
ActivityTrackerSchema.index({ actionType: 1 });

const ActivityTracker = mongoose.model('ActivityTracker', ActivityTrackerSchema);
export default ActivityTracker;
