import express from 'express';
import { logActivity } from '../middleware/logActivity.js';
import { getLogs, logFrontendActivity, getUserActivity  } from '../controllers/try.js'; // Import the controller function

const router = express.Router();

// Apply the logActivity middleware to all routes
router.use(logActivity);

// Fetch all logs
router.get('/logs', getLogs);

// Log frontend activity
router.post('/logs/activity', logFrontendActivity); 


router.get("/user-activity", getUserActivity);




export default router;