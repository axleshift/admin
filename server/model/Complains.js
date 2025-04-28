import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    complaintText: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Resolved'], default: 'Pending' },
    resolutionText: { type: String } // <-- ADD THIS
}, { timestamps: true });

export default mongoose.model('Complaint', complaintSchema);
