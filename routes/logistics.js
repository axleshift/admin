import express from "express";
import {
    log1vehicle,
    log2procurement,
    log2inventory
} from "../controllers/logistics.js";
const router = express.Router();

router.get('/vehicle', log1vehicle)

router.get('/procurement',log2procurement);
router.get('/inventory',log2inventory);



export default router;
