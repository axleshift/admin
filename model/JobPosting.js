import mongoose from 'mongoose';

const JobPostingSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Use the ID from the external system
  title: { type: String, required: true },
  description: { type: String },
  department: { type: String },
  location: { type: String },
  employmentType: { type: String }, // e.g., Full-time, Part-time
  salaryRange: { type: String },
  postedDate: { type: Date },
  closingDate: { type: Date },
  status: { type: String, default: 'Open' }, // e.g., Open, Closed
}, { timestamps: true });

export default mongoose.model('JobPosting', JobPostingSchema);