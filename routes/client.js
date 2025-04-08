import express from "express";
import {  
 
    getCustomers,
    loginUser, 
    registerCustomer, 
    changePassword, 
    generateOTP, 
    verifyOTP,
    saveUser
} from "../controllers/client.js";
import detectAnomaly from "../middleware/detectAnomaly.js";
import detectRapidLogin from "../middleware/detectRapidLogin.js";
import loginActivityLogger from "../middleware/loginActivitytracker.js";
const router = express.Router();
router.post('/save-user', saveUser)

router.get('/customers', getCustomers);


// Login
router.post("/login",detectRapidLogin,detectAnomaly,loginUser,loginActivityLogger);

// Add this to your routes file
router.get("/check-anomalies", async (req, res) => {
    try {
        const anomalies = await Anomaly.find().sort({ timestamp: -1 }).limit(10);
        res.json({ success: true, anomalies });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// Register a customer
router.post("/registercustomer", registerCustomer);
// Check user authentication


// Change password
router.put("/change-password", changePassword);

router.post("/unlock-request", generateOTP);
router.post("/unlock-verify", verifyOTP);

export default router;
