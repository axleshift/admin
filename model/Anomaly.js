import mongoose from 'mongoose';

const AnomalySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ipAddress: { type: String, required: true },
    userAgent: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    reason: { type: String, required: true }
});

const Anomaly = mongoose.model('Anomaly', AnomalySchema);
export default Anomaly;