import express from "express";
import {  
    getWorker,
    getperform, 
    changeUserRole, 
    deleteUser, 
    getJobPostings, 
    getJobPostingById,
    getHrDashStats, 
    access,
    getUserPermissions,
    revokeAccess,
    ExternalHR,
    handleWebhook,
    leave, 
    updateLeaveRequest,
    getpayroll,
    getUserById
  } from "../controllers/hr.js";

const router = express.Router();
router.post('/webhook', handleWebhook);
router.get('/newUser', ExternalHR);
router.get("/worker", getWorker);
router.get('/performance', getperform)
// Route to update the role of a user
router.put("/worker/:id/role", changeUserRole);

// Route to delete a user
router.delete("/worker/:id", deleteUser);



router.get("/job-postings/:id", getJobPostingById);



router.get('/hrdash', getHrDashStats)

router.post('/grant-access', access);
router.get('/permissions/:userId', getUserPermissions);
router.post('/revoke-access',revokeAccess);

router.get('/leaveRequest',leave)
router.put('/leaveRequest/:id', updateLeaveRequest);
router.get('/payroll', getpayroll);
router.get('/payroll/:id', getUserById);

// Route to save payroll data to MongoDB

//hr2
router.get('/job-posting',getJobPostings)
export default router;
