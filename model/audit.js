import mongoose from "mongoose";

// Define a schema for each item
const itemSchema = new mongoose.Schema({
  name: { type: String },
  quantity: { type: Number },
  price: { type: Number },
  total: { type: Number },
});

const invoiceSchema = mongoose.Schema(
  {
    invoiceNumber: { type: String },
    trackingId: { type: String, default: "12" },
    firstName: { type: String },
    customerId: { type: String },
    lastName: { type: String },
    email: { type: String },
    phone: { type: String },
    deliveryDate: { type: Date },
    discounts: { type: Number },
    dueDate: { type: Date },
    address: { type: String },
    products: { type: [itemSchema], required: true },
    selectedCurrency: { type: String },
    status: {
      type: String,
      default: "Pending",
    },
    totalAmount: { type: Number },
    paymentMethod: { type: String },
    qrCode: { type: String },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

const invoiceModel = mongoose.model("Invoice", invoiceSchema);

export default invoiceModel;