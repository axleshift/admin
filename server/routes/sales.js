import express from 'express';
const router = express.Router();
import { getshipping, createShipping, updateShipping } from '../controllers/sales.js';

router.get('/shipping', getshipping);
router.post('/shipping', createShipping);

router.patch('/shipping/:id', updateShipping); 

export default router;
