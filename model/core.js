import mongoose from 'mongoose'

const shipmentSchema = new mongoose.Schema({
  shipmentId: { type: String, required: true },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  carrier: { type: String, required: true },
  transportationMethod: { type: String, required: true },
  status: { type: String, required: true },
  legs: [{
    legId: { type: String, required: true },
    departure: { type: Date, required: true },
    arrival: { type: Date, required: true },
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    carrier: { type: String, required: true },
    status: { type: String, required: true }
  }],
  inventory: [{
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitWeight: { type: Number, required: true },
    totalWeight: { type: Number, required: true }
  }],
  costDetails: {
    transportationCost: { type: Number, required: true },
    insuranceCost: { type: Number, required: true },
    handlingCost: { type: Number, required: true },
    totalCost: { type: Number, required: true }
  },
  estimatedArrival: { type: Date, required: true },
  exception: {
    type: { type: String, required: false },
    reason: { type: String, required: false },
    expectedDelay: { type: Date, required: false },
    newEstimatedArrival: { type: Date, required: false }
  },
  createdAt: { type: Date, default: Date.now }
});

const Shipment = mongoose.model('Shipment', shipmentSchema);

export default Shipment;
