import express from "express";
import { 
    getLogistics, 
    getLogisticsById, 
    deleteLogistics, 
    getLogisticsByTrackingNum, 
    updateLogistics,
    sendLogisticsEmail
} from "../controllers/logix.js";

const router = express.Router();

// Define your logistics routes
router.get("/logistic", getLogistics); // Fetch all logistics
router.get("/logistic/:id", getLogisticsById); // Fetch specific logistics by ID
router.post("/logistic/track", getLogisticsByTrackingNum); // Fetch logistics by tracking number
router.put("/logistic/:id", updateLogistics); // Update logistics by ID
router.delete("/logistic/:id", deleteLogistics); // Delete logistics by ID
router.post('/send-logistics-email', sendLogisticsEmail);

export default router;
