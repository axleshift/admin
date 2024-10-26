const mongoose = require('mongoose');

const InterviewSchema = new mongoose.Schema({
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' },
  interviewer: { type: String, required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['scheduled', 'completed', 'rescheduled', 'canceled'], default: 'scheduled' }
});

const Interview = mongoose.model('Interview', InterviewSchema);
module.exports = Interview;
