import express from "express";
import { getAllLoginAttempts,getAllSecurityAlerts,getAllAnomalies } from "../controllers/security.js";

const router = express.Router();

// GET /api/login-attempts - Fetch all login attempts (with optional filters)
router.get("/login-attemp", getAllLoginAttempts);
router.get("/security-alert", getAllSecurityAlerts);
router.get("/anomalies", getAllAnomalies); 
export default router;
