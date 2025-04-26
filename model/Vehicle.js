import mongoose from 'mongoose';

const VehicleSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Use the ID from the external system
  make: { type: String, required: true }, // e.g., Toyota, Ford
  model: { type: String, required: true }, // e.g., Corolla, F-150
  year: { type: Number },
  vin: { type: String, unique: true }, // Vehicle Identification Number
  licensePlate: { type: String },
  status: { type: String, default: 'Active' }, // e.g., Active, Inactive
  mileage: { type: Number },
  lastServiceDate: { type: Date },
  assignedDriver: { type: String }, // Driver's name or ID
}, { timestamps: true });

export default mongoose.model('Vehicle', VehicleSchema);