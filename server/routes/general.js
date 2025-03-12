import express from "express";
import { getUser, 
    forgotPassword, 
    resetPassword, 
  
    getDashboardStats,
    accessReview,
    receiveREQ,
    sendREQ, 
    getRequests,
    logActivity,
    getActivities
 } from "../controllers/general.js";

const router = express.Router();

router.get("/permissions", accessReview);

router.get("/user/:id", getUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:id/:token", resetPassword);


router.get("/dashboard", getDashboardStats);
router.post('/receive-request', receiveREQ)
router.post('/send-request', sendREQ)
router.get('/requests', getRequests);
 
router.post('/logact', logActivity);

// Get activity logs with filtering
router.get('/getact', getActivities);
export default router;
