// models/storeModel.js
import mongoose from 'mongoose';

const StoreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  contactName: {
    type: String,
    trim: true
  },
  contactEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  phone: String,
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Pending'],
    default: 'Pending'
  },
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

const Store = mongoose.model('Store', StoreSchema);
export default Store;