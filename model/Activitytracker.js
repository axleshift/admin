import mongoose from 'mongoose';

const activitytrackerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, required: true },
    department: { type: String, required: true },
    route: { type: String, required: true },
    action: { type: String, required: true },
    description: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
}, { collection: 'activitytracker' }); // <-- Name your collection here

const Activitytracker = mongoose.model('Activitytracker', activitytrackerSchema);
export default Activitytracker;
