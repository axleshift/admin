import express from "express";
import { getUser, forgotPassword, resetPassword, getUserActivities, logUserActivity } from "../controllers/general.js";

const router = express.Router();

router.get("/user/:id", getUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:id/:token", resetPassword);
router.get('/activity', getUserActivities);
router.post('/log-activity', logUserActivity); // New route to log user activity

export default router;
