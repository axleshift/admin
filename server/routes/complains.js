import express from 'express';
import { 
    getComplaints,
    resolveComplaintWithAI,
    createComplaint,
    createEmployeeComplaint,
    forwardToAI,
    sendNotification,
    generateResolutionDocument,
    createEmployeeExternalComplaint
 } from '../controllers/complains.js';

const router = express.Router();

router.post('/postComplains', createComplaint);
router.post('/employeecomplain', createEmployeeComplaint);
router.post('/employeecomplainexternal', createEmployeeExternalComplaint);
router.get('/get-complains', getComplaints);
router.post('/ai-resolve', resolveComplaintWithAI);
router.post('/send-notification', sendNotification); // Add the missing route
router.get('/resolution-document/:complaintId', generateResolutionDocument); // Add route for downloading resolution document

// HR admin system routes
router.post('/forward-to-ai', forwardToAI);

export default router;