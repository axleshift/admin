import express from "express";
import { 

    getFinancialAnalytics, 
    getAllInvoices,
    getYearlySalesRevenue,
    getMonthly
} from "../controllers/finance.js";
const router = express.Router();




router.get('/analytics', getFinancialAnalytics);

router.get('/yearlysalesrevenue', getYearlySalesRevenue);
router.get('/monthlysalesrevenue', getMonthly)
router.get("/invoices", getAllInvoices);
export default router;
