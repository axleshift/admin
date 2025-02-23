import express from "express";
import { 
    setBackupDirectory,
    backupDatabase, 
    restoreDatabase, 
    generateAnnouncement,
    chatbox,sendMessage,
    getDepartmentMessages,
    updateMessageStatus, 
    handleStatusUpdate, 
    getRequestStatus,
    githubAuth, 
    githubCallback,
    sendToken,
    getUsersBy ,
    getLogs, 
    logFrontendActivity, 
    getUserActivity 
} from "../controllers/admin.js";
import { logActivity } from '../middleware/logActivity.js';
import { verifyTokenAndDepartment } from "../middleware/verifyTokenAndDepartment.js";
const router = express.Router();
router.get('/github', githubAuth);
router.get('/github/callback',githubCallback, sendToken)

router.get('getuser/:department',verifyTokenAndDepartment, getUsersBy)

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

router.get('/logs', getLogs);

// Log frontend activity
router.post('/logs/activity', logFrontendActivity); 


router.get("/user-activity", getUserActivity);



export default router;