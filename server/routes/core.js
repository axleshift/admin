import express from 'express';
import { ship, shipId } from '../controllers/core.js';

const router = express.Router();
router.get('/shipment', ship);
router.get('/shipment/:id', shipId);
export default router;