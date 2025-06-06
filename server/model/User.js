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
    position: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    passwordHistory: [
      {
        password: String,
        date: Date
      }
    ],
    phoneNumber: {
      type: String,
      required: true,
    },
    // Removed duplicate position field
    role: {
      type: String,
      required: true,
      lowercase: true,
    },
    username: {
      type: String,
      unique: true,
    },
    department: {
      type: String,
      required: true,
      enum: ["HR", "Core", "Logistics", "Finance", "Administrative"],
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    profileImage: {
      type: String,
      default: '',
    },
    refreshToken: { type: String },
    backupDirectory: { type: String },
    permissions: { type: [String], default: [] },
    expiryMap: { type: Map, of: Date, default: {} },
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
    otp: { type: String },
    otpExpires: { type: Date },
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
    reviewHistory: [
      {
        date: Date,
        reviewerId: {
          type: mongoose.Schema.Types.Mixed,
          ref: 'User'
        },
        reviewerName: String,
        notes: String,
        approvedPermissions: [String],
        rejectedPermissions: [String]
      }
    ],

    // Government ID & Employee Info
    governmentIds: {
      sss: String,
      philhealth: String,
      pagibig: String,
      tin: String
    },
    employeeId: String,
    firstName: String,
    lastName: String,
    middleName: String,

    employmentStatus: String,
    dateHired: Date,
    address: String,
    birthdate: Date,
    gender: String,
    civilStatus: String,
  },
  { timestamps: true }
);

// Updated pre-save hook to handle both position and role updates
userSchema.pre('save', function (next) {
  // If position is modified, update role
  if (this.position && this.isModified('position')) {
    this.role = this.position.toLowerCase();
  }
  // If position is missing but role exists, set position from role
  else if (!this.position && this.role) {
    this.position = this.role;
  }
  next();
});

const User = mongoose.model("User", userSchema);
export default User;