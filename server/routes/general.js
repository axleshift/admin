import express from "express";
import { getUser, 
    forgotPassword, 
    resetPassword, 
    validateResetToken,
  
    getDashboardStats,
    accessReview,
    receiveREQ,
    sendREQ, 
    getRequests,
    activity,
    getact,
    recertifyUserAccess,
    initiateAccessReview,
  
 } from "../controllers/general.js";

 import { authenticateAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get("/permissions", accessReview);
router.post("/recertify", recertifyUserAccess);
router.post("/initiate-review", initiateAccessReview);


router.get("/user/:id", getUser);
router.post("/forgot-password", authenticateAdmin,forgotPassword);
router.post("/reset-password/:id/:token", resetPassword);

router.get("/validate-reset-token/:id/:token", validateResetToken);

router.get("/dashboard", getDashboardStats);
router.post('/receive-request', receiveREQ)
router.post('/send-request', sendREQ)
router.get('/requests', getRequests);

router.post('/log', activity)
router.get('/log',getact);




export default router;
