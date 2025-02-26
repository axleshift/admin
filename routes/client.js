import express from "express";
import {  
 
    getCustomers,
    registerUser, 
    loginUser, 
    registerCustomer, 
    changePassword,
    refreshToken
 } from "../controllers/client.js";

const router = express.Router();

router.get('/customers', getCustomers);
// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);


router.post('/refresh-token', refreshToken);
// Register a customer
router.post("/registercustomer", registerCustomer);

// Check user authentication
router.get("/user", (req, res) => {
    if (req.session.user) {
        res.json({ user: req.session.user });
    } else {
        res.status(401).json("Not Authenticated");
    }
});

// Change password
router.put("/change-password", changePassword);


export default router;
