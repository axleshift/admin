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
      enum: ["admin", "manager", "employee"], // Restrict roles to these options
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
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
