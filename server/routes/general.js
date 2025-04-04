import express from "express";
import { getUser, 
    forgotPassword, 
    resetPassword, 
  
    getDashboardStats,
    accessReview,
    receiveREQ,
    sendREQ, 
    getRequests,
    activity,
    getact,
    recertifyUserAccess,
    initiateAccessReview,
    createNotification, 
    getAllNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
 } from "../controllers/general.js";

const router = express.Router();

router.get("/permissions", accessReview);
router.post("/recertify", recertifyUserAccess);
router.post("/initiate-review", initiateAccessReview);


router.get("/user/:id", getUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:id/:token", resetPassword);


router.get("/dashboard", getDashboardStats);
router.post('/receive-request', receiveREQ)
router.post('/send-request', sendREQ)
router.get('/requests', getRequests);

router.post('/log', activity)
router.get('/log',getact);


router.post('/notif', createNotification);
router.get('/notif', getAllNotifications);
router.patch('/notif/:id/read', markAsRead);
router.patch('/notif/read-all', markAllAsRead);
router.delete('/notif/:id', deleteNotification);

export default router;
