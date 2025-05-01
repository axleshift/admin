import mongoose from 'mongoose';

const Core1InsightSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Unique identifier from the external system
  type: { type: String, required: true }, // e.g., "shipment", "cost", "items", "weight"
  data: { type: mongoose.Schema.Types.Mixed, required: true }, // Flexible field for storing insight data
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('Core1Insight', Core1InsightSchema);