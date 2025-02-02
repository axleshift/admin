import express from "express";
import { getUser, forgotPassword, resetPassword, getDashboardStats } from "../controllers/general.js";

const router = express.Router();

router.get("/user/:id", getUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:id/:token", resetPassword);

router.get("/dashboard", getDashboardStats);


export default router;
