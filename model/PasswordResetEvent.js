import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const PasswordResetEventSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  passwordAnalysis: {
    score: {
      type: Number,
      required: true
    },
    strength: {
      type: String,
      enum: ['Weak', 'Moderate', 'Strong', 'Very Strong'],
      required: true
    },
    feedback: [String],
    explanation: String
  },
  validationPassed: {
    type: Boolean,
    required: true
  },
  validationDetails: {
    passed: Boolean,
    message: String,
    checks: {
      hasLength: Boolean,
      hasUppercase: Boolean,
      hasLowercase: Boolean,
      hasNumber: Boolean,
      hasSpecial: Boolean,
      meetsScoreThreshold: Boolean
    }
  },
  ipAddress: String,
  userAgent: String
});

const PasswordResetEvent = mongoose.model('PasswordResetEvent', PasswordResetEventSchema);
export default PasswordResetEvent;