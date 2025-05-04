import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
      },
      message: {
        type: String,
        required: true
      },
    banner: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
});

export default mongoose.model('Announcement', announcementSchema);
