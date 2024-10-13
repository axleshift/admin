import mongoose from 'mongoose';

const shippingSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  orderVolume: { type: Number, required: true },
  orderDate: { type: Date, required: true },
  deliveryDate: { type: Date, required: false }, // Adjust according to your needs
  shippingType: { type: String, required: true, enum: ['land', 'sea', 'air'] },
  dropOffLocation: { type: String, required: true },
  status: { type: String, default: 'pending' },
});

const Shipping = mongoose.model('Shipping', shippingSchema);
export default Shipping;
