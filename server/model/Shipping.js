import mongoose from 'mongoose';

const ShippingSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
  },
  orderVolume: {
    type: Number,  
    required: true,
  },
  shippingType: {
    type: String,
    enum: ['sea', 'land', 'air'],
    required: true,
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
});


const Shipping = mongoose.model('Shipping', ShippingSchema);
export default Shipping; 
