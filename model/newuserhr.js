import mongoose from 'mongoose';
import Joi from 'joi';

const newUserSchema = new mongoose.Schema({
  name: String,
  firstName: String,
  lastName: String,
  email: { type: String, required: true, unique: true },
  externalId: { type: String, unique: true },
  password: String,
  role: { type: String, required: true },
  department: { type: String, required: true },
  phone: String,
  address: String,
  image: String,
}, { timestamps: true });

export default mongoose.model('NewUser', newUserSchema);
