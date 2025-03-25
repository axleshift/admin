import express from 'express';
import { 
    ship, 
    shipId ,
    syncFreightData
} from '../controllers/core.js';

const router = express.Router();
router.get('/shipment', ship);
router.get('/shipment/:id', shipId);
router.post('/syncFreightData', syncFreightData);

export default router;