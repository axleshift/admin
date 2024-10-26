import express from "express";
import { getAllEmployees ,getPerformanceReport, getAttendanceReport  } from "../controllers/hr1.js";

const router = express.Router();

router.get("/employee", getAllEmployees);
router.get("/report/performance", getPerformanceReport); // New route for performance report
router.get("/report/attendance", getAttendanceReport); // New route for attendance report
export default router;
