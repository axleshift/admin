import mongoose from 'mongoose';

const agreementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['accepted', 'rejected'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Fix: Check if 'Agreement' model already exists
const Agreement = mongoose.models.Agreement || mongoose.model('Agreement', agreementSchema);

export default Agreement;
