import express from "express";
import { getUser, forgotPassword, resetPassword, getUserActivities, logUserActivity,deleteUserActivities,getDashboardStats } from "../controllers/general.js";

const router = express.Router();

router.get("/user/:id", getUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:id/:token", resetPassword);
router.get('/activity', getUserActivities);
router.post('/log-activity', logUserActivity); // New route to log user activity
router.delete('/activity/:userId', deleteUserActivities);
router.get("/dashboard", getDashboardStats);


export default router;
