import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
    {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        role: { type: String, required: true },
        jobDescription: { type: String },
        dateOfJoining: { type: Date, required: true },
        attendance: [
            {
                date: { type: Date, required: true },
                status: { type: String, enum: ["present", "absent", "leave"], required: true },
            },
        ],
        performance: [
            {
                reviewDate: { type: Date, required: true },
                rating: { type: Number, min: 1, max: 5, required: true },
                comments: { type: String },
            },
        ],
        offboarding: {
            exitInterviewDate: { type: Date },
            reasonForLeaving: { type: String },
            feedback: { type: String },
        },
        selfService: {
            profileUpdated: { type: Boolean, default: false },
            lastUpdated: { type: Date },
        },
    },
    { timestamps: true }
);

const Employee = mongoose.model("Employee", employeeSchema);

// Make sure this is the line you are using
export default Employee;
