import mongoose from 'mongoose';

const financeuserSchema = new mongoose.Schema({
    userNumber: { type: String },
    fullName: { type: String },
    email: { type: String, unique: true },
    password: { type: String },
    role: {
        type: String,
        enum: ['user', 'admin', 'staff', 'superadmin', 'technician'],
    },
    phone: { type: String },
    address: { type: String },
    image: { type: String }
}, { timestamps: true });

const financeuserModel = mongoose.model("financeuser", financeuserSchema);

export default financeuserModel;
