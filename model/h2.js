import mongoose from "mongoose";

const JobPostingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    department: { type: String, required: true },
    location: { type: String, required: true },
    status: { type: String, enum: ["Open", "Closed"], default: "Open" },
    applicationsCount: { type: Number, default: 0 },
    applications: [
      {
        applicantName: { type: String, required: true },
        status: { type: String, enum: ["Under Review", "Interview Scheduled", "Offer Extended", "Rejected"], required: true },
      },
    ],
  },
  { timestamps: true } // Automatically manage createdAt and updatedAt fields
);

const JobPosting = mongoose.model("JobPosting", JobPostingSchema);
export default JobPosting;
