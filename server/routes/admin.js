import express from "express";
import { setBackupDirectory,backupDatabase, restoreDatabase, generateAnnouncement,chatbox,sendMessage,getDepartmentMessages,updateMessageStatus, handleStatusUpdate, getRequestStatus  } from "../controllers/admin.js";
const router = express.Router();

router.post('/set-directory', setBackupDirectory);
router.post('/backup',backupDatabase)
router.post('/restore', restoreDatabase);
router.post('/generate', generateAnnouncement)
router.post('/chat',chatbox)
router.post('/status-update', handleStatusUpdate);
router.get('/request-status/:username', getRequestStatus);

router.post('/sendmessage', sendMessage);
router.get('/getmessages/:department', getDepartmentMessages);
router.put('/messages/:id/status', updateMessageStatus);
export default router;