import express from "express";
import { 
    getAllLoginAttempts,
    getAllSecurityAlerts,
    getAllAnomalies,
    analyzeUserSecurity, 
    logSecurityEvent } from "../controllers/security.js";

const router = express.Router();

// GET /api/login-attempts - Fetch all login attempts (with optional filters)
router.get("/login-attemp", getAllLoginAttempts);
router.get("/security-alert", getAllSecurityAlerts);
router.get("/anomalies", getAllAnomalies); 

router.post('/analyze-security', analyzeUserSecurity);

// Route for logging security events
router.post('/log-security-event', logSecurityEvent);
export default router;
