const express = require('express');
const { createJob, getJobs, applyForJob, scheduleInterview, getCandidates } = require('../controllers/hr2');
const router = express.Router();

// Job posting routes
router.post('/jobs', createJob);  // Create a new job posting
router.get('/jobs', getJobs);     // Get all job postings

// Candidate management routes
router.post('/apply', applyForJob);     // Candidate applies for a job
router.get('/candidates', getCandidates); // Get all candidates

// Interview management
router.post('/interview', scheduleInterview);  // Schedule an interview

module.exports = router;
