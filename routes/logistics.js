import express from "express";
import {log1vehicle} from "../controllers/logistics.js";
const router = express.Router();

router.get('/vehicle', log1vehicle)
export default router;
