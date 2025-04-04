import mongoose from "mongoose";

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
      enum: [
        "admin", 
        "manager", 
        "superadmin",
        'employee',
        "user",
        "inpector",
        "driver",
        "chief mechanic"
      ], 
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
    otpExpires:{type:Date},
    lastReviewDate: {
      type: Date,
      default: null
    },
    reviewStatus: {
      type: String,
      enum: ['Pending', 'Completed', 'Overdue', null],
      default: null
    },
    reviewInitiatedDate: {
      type: Date,
      default: null
    },
    reviewHistory: [{
      date: Date,
      reviewerId: {
        type: mongoose.Schema.Types.Mixed,
        ref: 'User'
      },
      reviewerName: String,
      notes: String,
      approvedPermissions: [String],
      rejectedPermissions: [String]
    }]
  
  },
  
  { timestamps: true }

);

// Removed pre-save hook for password hashing
// Removed comparePassword method

const User = mongoose.model("User", userSchema);
export default User;