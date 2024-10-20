import express from "express";
import { getUser, forgotPassword, resetPassword } from "../controllers/general.js";

const router = express.Router();

router.get("/user/:id", getUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:id/:token", resetPassword);

export default router;
