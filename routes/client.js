import express from "express";
import {  
 
    getCustomers,
    registerUser, 
    loginUser, 
    registerCustomer, 
    changePassword, 
    generateOTP, 
    verifyOTP,
    refreshToken,
    getUser
} from "../controllers/client.js";
const router = express.Router();

router.get('/customers', getCustomers);
// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);
router.post('/refresh-token',refreshToken)
router.get('/user',getUser)
// Register a customer
router.post("/registercustomer", registerCustomer);
// Check user authentication
;

// Change password
router.put("/change-password", changePassword);

router.post("/unlock-request", generateOTP);
router.post("/unlock-verify", verifyOTP);

export default router;
