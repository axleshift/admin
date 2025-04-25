import mongoose from 'mongoose';

const LeaveRequestSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Use the ID from the external system
  employeeName: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, required: true },
  comments: { type: String },
}, { timestamps: true });

export default mongoose.model('LeaveRequest', LeaveRequestSchema);