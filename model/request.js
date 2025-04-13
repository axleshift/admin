import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
    id: {
      type: String,
      required: true,
      unique: true
    },
    type: String,
    user: String,
    date: String,
    details: String,
    status: {
      type: String,
      default: 'pending',
      enum: ['pending', 'approved', 'rejected']
    },
    priority: String,
    department: String,
    requestedBy: String,
    rejectedAt: Date,
    approvedAt: Date,
    createdAt: {
      type: Date,
      default: Date.now
    },
    senderUrl: String 
  });
  
  const Request = mongoose.model('Request', requestSchema);
  export default Request;
  