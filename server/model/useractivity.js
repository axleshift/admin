import mongoose from 'mongoose';

// Define the user activity schema
const userActivitySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    route: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

// Create the UserActivity model
const UserActivity = mongoose.model('UserActivity', userActivitySchema);
export default UserActivity;
