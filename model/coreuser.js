import mongoose from 'mongoose';

const coreuserSchema = new mongoose.Schema({
    userNumber: { type: String },
    firstname: { type: String },
    lastname: { type: String },
    email: { type: String, unique: true },
    password: { type: String },
    role: {
        type: String,
        enum: ['user', 'admin', 'staff', 'superadmin'],
    },
    phone: { type: String },
    address: { type: String },
    image: { type: String }
}, { timestamps: true });

const coreuserModel = mongoose.model("coreuser", coreuserSchema);

export default coreuserModel;
