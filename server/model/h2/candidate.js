const mongoose = require('mongoose');

const CandidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  resume: String,
  appliedPosition: { type: mongoose.Schema.Types.ObjectId, ref: 'JobPost' },
  status: { type: String, enum: ['applied', 'interviewing', 'hired', 'rejected'], default: 'applied' },
  applicationDate: { type: Date, default: Date.now }
});

const Candidate = mongoose.model('Candidate', CandidateSchema);
module.exports = Candidate;
