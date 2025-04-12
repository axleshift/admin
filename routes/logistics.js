import express from "express";
import {
    log1vehicle,
    log2procurement
} from "../controllers/logistics.js";
const router = express.Router();

router.get('/vehicle', log1vehicle)

router.get('/procurement',log2procurement);



export default router;
