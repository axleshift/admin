import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
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
      enum: ["admin", "manager", "superadmin"], // Restrict roles to these options
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

    // Payroll Details
    payroll: {
      salary: {
        type: Number,
        required: true,
        default: 0,
      },
      payFrequency: {
        type: String,
        enum: ["weekly", "bi-weekly", "monthly"],
        required: true,
        default: 'monthly',
      },
      lastPaymentDate: {
        type: Date,
        required: true,
        default: 0,
      },
    },

    // Compliance tracking
    compliance: [
      {
        certification: {
          type: String,
          required: true,
        },
        issuedBy: {
          type: String,
        },
        issueDate: {
          type: Date,
        },
        expiryDate: {
          type: Date,
        },
        status: {
          type: String,
          enum: ["valid", "expired", "pending"],
          required: true,
        },
      },
    ],

    // Benefits Information
    benefits: {
      healthInsurance: {
        type: Boolean,
        default: false,
      },
      retirementPlan: {
        type: Boolean,
        default: false,
      },
      vacationDays: {
        type: Number,
        default: 0, // Number of vacation days available
      },
      sickLeave: {
        type: Number,
        default: 0, // Number of sick leave days available
      },
    },
    accessToken:{ type:String}, 
    refreshToken: { type: String },
    backupDirectory: { type: String},
    permissions: { type: [String], default: [] }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
