import express from "express";
import { getLogistics, getLogisticsById, deleteLogistics, getLogisticsByTrackingNum,updateLogistics  } from "../controllers/logix.js";

const router = express.Router();

// Define your logistics routes
router.get("/logistic", getLogistics); // Fetch all logistics
router.get("/logistic/:id", getLogisticsById); // Fetch specific logistics by ID
router.put('/:id', updateLogistics);
router.post("/logistic/track", getLogisticsByTrackingNum); // Fetch logistics by tracking number
router.delete("/logistic/:id", deleteLogistics); // Delete logistics by ID

export default router;
