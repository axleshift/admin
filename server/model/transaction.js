// models/Transaction.js
import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    orderVolume: { type: Number, required: true },
    shipmentType: { type: String, enum: ["sea", "land", "air"], required: true },
    orderDate: { type: Date, default: Date.now },
    status: { type: String, enum: ["pending", "in-progress", "completed", "cancelled"], required: true },
    deliveryDate: { type: Date },
    updateStatus: { type: String }, // Optional
});

const Transaction = mongoose.model("Transaction", TransactionSchema);
export default Transaction;
