import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
    username: { type: String, required: true },
    name: { type: String, required: true },
    department: { type: String, required: true },
    role: { type: String, required: true },
    action: { type: String, required: true },
    description: { type: String, required: true },
    route: { type: String, required: false }, // New field for route
    timestamp: { type: Date, default: Date.now },
});

export default mongoose.model('Log', logSchema);
