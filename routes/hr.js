import express from "express";
import {  
    getWorker,
    getperform, 
    changeUserRole, 
    deleteUser, 
    getJobPostings, 
    getHrDashStats, 
    access,
    getUserPermissions,
    revokeAccess,
    leave, 
    updateLeaveRequest,
    getpayroll,
    getAllUsers 
  } from "../controllers/hr.js";

const router = express.Router();
router.get("/worker", getWorker);
router.get('/performance', getperform)
// Route to update the role of a user
router.put("/worker/:id/role", changeUserRole);

// Route to delete a user
router.delete("/worker/:id", deleteUser);





router.get('/hrdash', getHrDashStats)

router.post('/grant-access', access);
router.get('/permissions/:userId', getUserPermissions);
router.post('/revoke-access',revokeAccess);



// Route to save payroll data to MongoDB

//hr1
router.get('/newUsers', getAllUsers);

//hr2
router.get('/job-posting',getJobPostings)

//hr3
router.get('/leaveRequest',leave)
router.put('/leaveRequest/:id', updateLeaveRequest);
router.get('/payroll', getpayroll);
export default router;
