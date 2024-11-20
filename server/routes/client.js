import express from "express";
import {  
    getWorker,
    generateoath,
    getCustomers,
    getperform, 
    changeUserRole, 
    deleteUser, 
    registerUser, 
    loginUser, 
    registerCustomer, 
    changePassword,
    logUserActivity } from "../controllers/client.js";

const router = express.Router();

router.get("/worker", getWorker);

router.post('/generate/:userId', generateoath);

router.get('/performance', getperform)
// Route to update the role of a user
router.put("/worker/:id/role", changeUserRole);

// Route to delete a user
router.delete("/worker/:id", deleteUser);



router.get('/customers', getCustomers);

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

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

router.post('/logUserActivity', logUserActivity);

export default router;
