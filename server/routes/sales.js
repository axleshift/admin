import express from "express";
const router = express.Router();
import { getShipping, createShipping, updateShipping,getSales } from "../controllers/sales.js";

router.get("/shipping", getShipping);
router.post("/shipping", createShipping);
router.patch("/shipping/:id", updateShipping);

router.get('/sales',getSales)

export default router;

