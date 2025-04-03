// models/Activitytracker.js
import mongoose from 'mongoose';

const activitytrackerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  department: { type: String, required: true },
  route: { type: String, required: true },
  action: { type: String, required: true },
  description: { type: String, required: true },
  aiAnalysis: { type: String, default: '{"fullAnalysis":"AI analysis unavailable","category":"General activity","patterns":"No unusual patterns detected","riskLevel":"UNKNOWN"}' },
  timestamp: { type: Date, default: Date.now }
}, { collection: 'activitytracker' });

const Activitytracker = mongoose.model('Activitytracker', activitytrackerSchema);

export default Activitytracker;