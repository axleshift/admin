import express from "express";
import { 

    generateAnnouncement,
    chatbox,sendMessage,
    getDepartmentMessages,
    updateMessageStatus, 
    handleStatusUpdate, 
    getallmessage,

    getRequestStatus,
    githubAuth, 
    githubCallback,
    sendToken,
    // getUsersBy ,
   
    
    setBackupDirectory, 
    backupDatabase, 
    restoreDatabase, 
    listBackups, 
    listCollections,
  
} from "../controllers/admin.js";
import { verifyTokenAndDepartment } from "../middleware/verifyTokenAndDepartment.js";
const router = express.Router();

//backup
    router.post('/set-directory', setBackupDirectory);
    router.post('/backup', backupDatabase);
    router.post('/restore', restoreDatabase);
    // New routes for listing backups and collections
    router.get('/list-backups', listBackups);
    router.get('/list-collections/:backupName', listCollections);

router.get('/github', githubAuth);
router.get('/github/callback',githubCallback, sendToken)

//router.get('getuser/:department',verifyTokenAndDepartment, getUsersBy)

//announce.js
router.post('/generate', generateAnnouncement)

//chat.js

router.post('/chat',chatbox)
router.post('/status-update', handleStatusUpdate);
router.get('/request-status/:username', getRequestStatus);
router.get('/getmessage',getallmessage);

router.post('/sendmessage', sendMessage);
router.get('/getmessages/:department', getDepartmentMessages);
router.put('/messages/:id/status', updateMessageStatus);





export default router;