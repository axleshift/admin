const mongoose = require('mongoose');

const JobPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  department: { type: String, required: true },
  description: String,
  qualifications: [String],
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  postedDate: { type: Date, default: Date.now },
  closingDate: Date
});

const JobPost = mongoose.model('JobPost', JobPostSchema);
module.exports = JobPost;
