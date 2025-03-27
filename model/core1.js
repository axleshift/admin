import mongoose from "mongoose";

const ShipmentSchema = new mongoose.Schema({
  _id: String,
  user_id: String,
  is_import: Boolean,
  is_residential_address: Boolean,
  contains_danger_goods: Boolean,
  contains_documents: Boolean,
  type: String,
  status: String,
  courier: String,
  total_weight: Number,
  number_of_items: Number,
  amount: {
    currency: String,
    value: Number,
  },
  expected_delivery_date: Number,
  country: String,
  session_id: String,
  tracking_number: String,
  created_at: Number,
  updated_at: Number,
  modified_by: String,
});

export default mongoose.model("Shipment", ShipmentSchema);
