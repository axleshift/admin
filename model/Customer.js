import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String },
    country: { type: String },
    occupation: { type: String },
    password: { type: String, required: true },
});

const Customer = mongoose.model("Customer", customerSchema);
export default Customer;
