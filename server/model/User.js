import mongoose from "mongoose";
import bcrypt from 'bcrypt';
const userSchema = new mongoose.Schema(
  {
    githubId: String,
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["admin", "manager", "superadmin",'employee'], 
      lowercase: true, 
    },
    username: {
      type: String,
      unique: true,
    },
    department: {
      type: String,
      required: true,
      enum: ["HR", "Core", "Logistics", "Finance", "Administrative"], // Restrict departments to these options
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    // Attendance tracking
    attendance: [
      {
        date: { type: Date, required: true },
        status: { type: String, enum: ["present", "absent", "leave"], required: true },
      },
    ],

    // Performance reviews
    performance: [
      {
        reviewDate: { type: Date, required: true },
        rating: { type: Number, min: 1, max: 5, required: true },
        comments: { type: String },
      },
    ],

    // Offboarding details
    offboarding: {
      exitInterviewDate: { type: Date },
      reasonForLeaving: { type: String },
      feedback: { type: String },
    },

    // Self-service updates
    selfService: {
      profileUpdated: { type: Boolean, default: false },
      lastUpdated: { type: Date },
    },

    // OAuth token management
    token: {
      type: String,
      default: null, // Default value is null if no token is set
    },
    tokenExpiry: {
      type: Date,
      default: null, // Default value is null if no expiration is set
    },



    // Compliance tracking
 

    // Benefits Information
 
    refreshToken: { type: String },
    backupDirectory: { type: String},
    permissions: { type: [String], default: [] }, // Store only permission names
    expiryMap: { type: Map, of: Date, default: {} }, // Map permission name → expiry date
    accountLocked: {
      type: Boolean,
      default: false
      },
      lockExpiration: {
          type: Date,
          default: null
      },
      passwordResetToken: String,
      passwordResetExpires: Date,
      isActive: {
          type: Boolean,
          default: true
      },
      otp:{type:String},
      otpExpires:{type:Date}
  },
  { timestamps: true }
);
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
const User = mongoose.model("User", userSchema);
export default User;
