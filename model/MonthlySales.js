import mongoose from 'mongoose';

const MonthlySalesSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Unique identifier from the external system
  month: { type: String, required: true }, // e.g., "April 2025"
  totalRevenue: { type: Number, required: true },
  totalSales: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('MonthlySales', MonthlySalesSchema);