import express from "express";
import { getUser, 
    forgotPassword, 
    resetPassword, 
  
    getDashboardStats,
    accessReview,
    receiveREQ,
    sendREQ, 
    getRequests,
    activityLogger, 
    getUserActivity
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

router.post('/log', activityLogger); 
router.get('/getUserActivity', getUserActivity); 
export default router;
