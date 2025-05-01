import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    complaintText: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'HR Review', 'Needs AI Review', 'Under Review', 'Resolved', 'Dismissed'],
        default: 'Pending'
    },
    requiresAI: {
        type: Boolean,
        default: false
    },
    resolutionText: {
        type: String
    },
    hrNotes: {
        type: String
    }
}, { timestamps: true });

const Complaint = mongoose.model('Complaint', complaintSchema);
export default Complaint;
