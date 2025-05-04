import mongoose from 'mongoose';
const messageSchema = new mongoose.Schema({
    content: String,
    department: String,
    targetRole: String,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'cancelled'],
      default: 'pending'
    },
    metadata: {
      requestType: String,
      pageName: String,
      requester: String,
      name: String,
      requestDetails: {
        requestTime: Date
      }
    },
    responseMetadata: {
      respondedBy: String,
      responseTime: Date
    }
  }, {
    timestamps: true
  });
const Message = mongoose.model('Message', messageSchema);
export default Message;
