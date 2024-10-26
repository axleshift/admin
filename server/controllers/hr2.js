const JobPost = require('../models/JobPost');
const Candidate = require('../models/Candidate');
const Interview = require('../models/Interview');

// Create a job posting
const createJob = async (req, res) => {
  try {
    const job = new JobPost(req.body);
    await job.save();
    res.status(201).json(job);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all job postings
const getJobs = async (req, res) => {
  try {
    const jobs = await JobPost.find();
    res.status(200).json(jobs);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Candidate applies for a job
const applyForJob = async (req, res) => {
  try {
    const candidate = new Candidate(req.body);
    await candidate.save();
    res.status(201).json(candidate);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Schedule an interview
const scheduleInterview = async (req, res) => {
  try {
    const interview = new Interview(req.body);
    await interview.save();
    res.status(201).json(interview);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all candidates
const getCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find().populate('appliedPosition');
    res.status(200).json(candidates);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { createJob, getJobs, applyForJob, scheduleInterview, getCandidates };
