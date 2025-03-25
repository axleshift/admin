import express from 'express';
import { 
    web, 
    fetch, 
    fetchByDepartment 
} from '../controllers/webhook.js'; // Make sure the path is correct

import { verifySignature, verifyAccess } from "../middleware/verifySignature.js";
const router = express.Router();
router.post('/webhook', web); // Webhook URL

router.post('/fetch-user',verifySignature, fetch);
router.post('/fetch-by-department', verifySignature,verifyAccess, fetchByDepartment);
export default router