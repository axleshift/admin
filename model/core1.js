import mongoose from 'mongoose';

const freightSchema = new mongoose.Schema(
  {
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
      value: Number
    },
    expected_delivery_date: Date,
    country: String,
    session_id: String,
    tracking_number: String,  // No unique constraint
    selected_address: String,
    invoice_id: String,
    created_at: Date,
    updated_at: Date
  },
  { timestamps: true }
);

export default mongoose.model('Freight', freightSchema);