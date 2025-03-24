import express from "express";
import { createFreightAudit, createInvoice, getAllFreightAudits, getAllInvoices, getFinancialAnalytics, updateInvoiceStatus } from "../controllers/finance.js";
const router = express.Router();

router.get('/getfreightaudit', getAllFreightAudits);
router.post('/createfreightaudit', createFreightAudit);


router.get("/invoices", getAllInvoices);
router.post('/createinvoice',createInvoice)
router.put('/updateinvoicestatus',updateInvoiceStatus)


router.get('/analytics', getFinancialAnalytics);
export default router;
