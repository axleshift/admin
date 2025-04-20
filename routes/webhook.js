import express from 'express';
import { authenticateAdmin } from '../middleware/authMiddleware.js';
import { 
    web, 
} from '../controllers/webhook.js'; // Make sure the path is correct

import { verifySignature, verifyAccess } from "../middleware/verifySignature.js";
const router = express.Router();
router.post('/webhook', web); // Webhook URL





export default router