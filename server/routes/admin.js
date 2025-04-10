import express from "express";
import { 

    chatbox,sendMessage,
    getDepartmentMessages,
    updateMessageStatus, 
    handleStatusUpdate, 
    getallmessage,

    getRequestStatus,

    // getUsersBy ,
   
    
    backupDatabase, 
    restoreDatabase, 
    listBackups, 
    listCollections,
  
} from "../controllers/admin.js";
import { verifyTokenAndDepartment } from "../middleware/verifyTokenAndDepartment.js";
const router = express.Router();

//backup
router.post('/backup', backupDatabase);
router.post('/restore', restoreDatabase);
// New routes for listing backups and collections
router.get('/list-backups', listBackups);
router.get('/list-collections/:backupName', listCollections);

//router.get('getuser/:department',verifyTokenAndDepartment, getUsersBy)


//chat.js

router.post('/chat',chatbox)
router.post('/status-update', handleStatusUpdate);
router.get('/request-status/:username', getRequestStatus);
router.get('/getmessage',getallmessage);

router.post('/sendmessage', sendMessage);
router.get('/getmessages/:department', getDepartmentMessages);
router.put('/messages/:id/status', updateMessageStatus);





export default router;