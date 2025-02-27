import express from "express";
import { getUser, forgotPassword, resetPassword, getDashboardStats, getAllUsers, updateUser, accessReview } from "../controllers/general.js";

const router = express.Router();
router.get('/users',getAllUsers)
router.put('/users/:id',updateUser)

router.get("/permissions", accessReview);

router.get("/user/:id", getUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:id/:token", resetPassword);

router.get("/dashboard", getDashboardStats);


export default router;
