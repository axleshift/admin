import mongoose from 'mongoose';



const shippingSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  orderVolume: { type: Number, required: true },
  shippingType: { type: String, required: true }, 
  orderDate: { type: Date, default: Date.now },
  status: { type: String, default: "Pending" }, 
  deliveryDate: { type: Date, default: null }
});

const Shipping = mongoose.model('Shipping', shippingSchema);



export default Shipping; 
