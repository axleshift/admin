import express from "express";
import { sendToLogistics,sendTocore,sendTofinance,sendToHR,createBackup,restoreBackup } from "../controllers/management.js";
const router = express.Router();

router.post("/logistics", sendToLogistics);
router.post("/hr", sendToHR);
router.post("/core", sendTocore);
router.post("/finance", sendTofinance);

router.post('/backup',createBackup)
router.post('/restore', restoreBackup);
export default router;
