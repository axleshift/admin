// models/IncidentReport.js
import mongoose from 'mongoose';

const IncidentReportSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    reportDate: {
      type: Date,
      default: Date.now,
    },
    location: String,
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium'
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
      default: 'Open'
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    fileUrl: String,
    fileName: String,
    fileSize: Number,
    fileType: String,
    additionalInfo: Object,
  },
  { timestamps: true }
);

// Create the model
const IncidentReport = mongoose.model('IncidentReport', IncidentReportSchema);

export default IncidentReport;