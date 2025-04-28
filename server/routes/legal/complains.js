import express from 'express';
import { 
    getComplaints, 
    resolveComplaintWithAI , 
    createComplaint } from '../../controllers/legal/complains.js';

const router = express.Router();

router.post('/postComplains', createComplaint);
router.get('/get-complains', getComplaints);
router.patch('/ai-resolve', resolveComplaintWithAI);

export default router;
