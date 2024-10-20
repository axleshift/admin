import express from "express";
import { getLogistics, getLogisticsById, deleteLogistics } from "../controllers/logix.js ";

const router = express.Router();

// Define your logistics routes
router.get("/logistic", getLogistics); // Fetch all logistics
router.get("/logistic/:id", getLogisticsById); // Fetch specific logistics by ID
router.delete("/logistic/:id", deleteLogistics); // Delete logistics by ID

export default router;
