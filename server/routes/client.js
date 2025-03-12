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
import { loginActivityMiddleware } from "../middleware/activityTrackerMiddleware.js";
const router = express.Router();
router.post('/save-user', saveUser)

router.get('/customers', getCustomers);


// Login
router.post("/login",detectAnomaly,loginActivityMiddleware,loginUser);

// Register a customer
router.post("/registercustomer", registerCustomer);
// Check user authentication
;

// Change password
router.put("/change-password", changePassword);

router.post("/unlock-request", generateOTP);
router.post("/unlock-verify", verifyOTP);

export default router;
