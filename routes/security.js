import express from 'express';
import { getSecurityIncidents } from '../controllers/security.js'
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

// Update the route to match the frontend call
router.get('/security-incidents', authenticate, authorize(['admin', 'superadmin']), getSecurityIncidents);

export default router;