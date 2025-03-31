import express from "express";
import { 
    createFreightAudit, 
    createInvoice, 
    getAllFreightAudits, 
    getAllInvoices, 
    getFinancialAnalytics, 
    updateInvoiceStatus,
    getYearlySalesRevenue,
    getMonthly
} from "../controllers/finance.js";
const router = express.Router();

router.get('/getfreightaudit', getAllFreightAudits);
router.post('/createfreightaudit', createFreightAudit);


router.get("/invoices", getAllInvoices);
router.post('/createinvoice',createInvoice)
router.put('/updateinvoicestatus',updateInvoiceStatus)


router.get('/analytics', getFinancialAnalytics);

router.get('/yearlysalesrevenue', getYearlySalesRevenue);
router.get('/monthlysalesrevenue', getMonthly)
export default router;
