import express from 'express';
import { 
    ship, 
    shipId ,
    syncFreightData,
    getFreights
} from '../controllers/core.js';

const router = express.Router();
router.get('/shipment', ship);
router.get('/shipment/:id', shipId);
router.get('/freight', getFreights);
router.post('/syncFreightData', syncFreightData);

export default router;