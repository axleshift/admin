// finance.js (Model File)
import mongoose from 'mongoose';

const freightAuditSchema = new mongoose.Schema({
    shipmentId: { type: String, required: true },
    auditDate: { type: Date, required: true },
    carrierName: { type: String, required: true },
    auditStatus: { type: String, required: true },
    amountCharged: { type: Number, required: true },
    amountPaid: { type: Number, required: true },
    auditComments: { type: String },
});

const financialAnalyticsSchema = new mongoose.Schema({
    month: { type: String, required: true },
    totalRevenue: { type: Number, required: true },
    totalCost: { type: Number, required: true },
    netProfit: { type: Number, required: true },
    carrierCost: { type: Number, required: true },
    overheadCost: { type: Number, required: true },
});

const invoicingSchema = new mongoose.Schema(
    {
      invoiceNumber: { type: String },
      firstName: { type: String },
      lastName: { type: String },
      address: { type: String },
      products: [
        {
          name: { type: String },
          quantity: { type: Number },
          price: { type: Number },
          total: { type: Number },
        },
      ],
      selectedCurrency: { type: String },
      status: { type: String, enum: ["Paid", "UnPaid"], default: "UnPaid" },
      email: { type: String },
      phone: { type: String },
      totalAmount: { type: Number },
      paymentMethod: { type: String },
    },
    {
      timestamps: true,
    }
  );

const FreightAudit = mongoose.model('FreightAudit', freightAuditSchema);
const FinancialAnalytics = mongoose.model('FinancialAnalytics', financialAnalyticsSchema);
const Invoice = mongoose.model('Invoice', invoicingSchema);

export default { FreightAudit, FinancialAnalytics, Invoice };
