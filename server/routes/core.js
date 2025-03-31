import express from 'express';
import { 
    fetchCore1Data,
    fetchcore1insightshipment,
    fetchcore1insightcost,
    syncCore1Data,
    fetchcore1insightitem,
    fetchcore1insightweight
 } from '../controllers/core.js';

const router = express.Router();
//core1
router.get('/fetch-core', fetchCore1Data);
router.get("/insight/shipment", fetchcore1insightshipment);
router.get("/insight/cost", fetchcore1insightcost);
router.get("/insight/item", fetchcore1insightitem);
router.get("/insight/weight", fetchcore1insightweight);
router.get('/sync-core', syncCore1Data);
export default router;
