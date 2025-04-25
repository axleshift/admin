import mongoose from 'mongoose';

const InventorySchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Unique identifier from the external system
  itemName: { type: String, required: true },
  quantity: { type: Number, required: true },
  location: { type: String },
  status: { type: String, default: 'Available' }, // e.g., Available, Out of Stock
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('Inventory', InventorySchema);