import express from 'express';
import { getnotif, addnotif } from '../controllers/notification.js';

const router = express.Router();

router.get('/getnotif', getnotif);
router.post('/postnotif', addnotif);

export default router;
