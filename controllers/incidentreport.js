// controllers/incidentreport.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import IncidentReport from '../model/incidentReports.js';

// Create __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Upload a new incident report file
export const uploadIncidentReport = async (req, res) => {
  try {
    // Check for uploaded file
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Get user ID from route parameters (passed in URL) or from authenticated user
    const userId = req.params.userId || req.user?._id;
    
    // If no userId found, return error
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required. Please use the link provided in your email.' 
      });
    }
    
    // Find user in database to get email and other user information
    const user = await req.userModel.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Create a new incident report record in the database
    const incidentReport = new IncidentReport({
      title: req.body.title || 'Untitled Report',
      description: req.body.description || '',
      location: req.body.location || '',
      severity: req.body.severity || 'Medium',
      reportedBy: userId,
      userEmail: user.email,
      userName: user.name,
      department: user.department,
      reportType: 'Absence Explanation',
      status: 'Pending Review',
      fileUrl: `/uploads/incident-reports/${req.file.filename}`,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
    });

    // Save the report to the database
    await incidentReport.save();
    
    // Send notification to HR about the new incident report
    try {
      // Set up email transporter
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_PORT === "465",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });
      
      // HR email address (could be stored in environment variables)
      const hrEmail = process.env.HR_EMAIL || "hr@company.com";
      
      // Set up email content for HR notification
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: hrEmail,
        subject: `New Incident Report: ${incidentReport.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>New Incident Report Submitted</h2>
            <p>A new incident report has been submitted by an employee with excessive absences.</p>
            <h3>Report Details:</h3>
            <ul>
              <li><strong>Title:</strong> ${incidentReport.title}</li>
              <li><strong>Submitted by:</strong> ${user.name} (${user.email})</li>
              <li><strong>Department:</strong> ${user.department || 'Not specified'}</li>
              <li><strong>Severity:</strong> ${incidentReport.severity}</li>
              <li><strong>Location:</strong> ${incidentReport.location || 'Not specified'}</li>
              <li><strong>Description:</strong> ${incidentReport.description || 'No description provided'}</li>
              <li><strong>File:</strong> ${incidentReport.fileName} (${Math.round(incidentReport.fileSize / 1024)} KB)</li>
            </ul>
            <p>Please log in to the HR portal to review this incident report.</p>
          </div>
        `
      };
      
      // Send the email
      await transporter.sendMail(mailOptions);
      console.log(`HR notification email sent about incident report ID: ${incidentReport._id}`);
    } catch (emailError) {
      // Just log the error but don't fail the upload if email fails
      console.error('Error sending HR notification email:', emailError);
    }
    
    // Also update user's record to reflect incident report submission
    try {
      // Update user to mark incident report as submitted
      user.incidentReportSubmitted = true;
      user.lastIncidentReportDate = new Date();
      await user.save();
    } catch (userUpdateError) {
      console.error('Error updating user record:', userUpdateError);
    }

    // Return success response with the report data
    res.status(201).json({
      success: true,
      message: 'Incident report uploaded successfully',
      data: incidentReport
    });
  } catch (error) {
    console.error('Error uploading incident report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload incident report',
      error: error.message
    });
  }
};

// Get all incident reports
export const getAllIncidentReports = async (req, res) => {
  try {
    const reports = await IncidentReport.find()
      .sort({ createdAt: -1 })
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email');

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    console.error('Error fetching incident reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch incident reports',
      error: error.message
    });
  }
};

// Get a single incident report by ID
export const getIncidentReportById = async (req, res) => {
  try {
    const report = await IncidentReport.findById(req.params.id)
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Incident report not found'
      });
    }

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error fetching incident report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch incident report',
      error: error.message
    });
  }
};

// Update an incident report
export const updateIncidentReport = async (req, res) => {
  try {
    const report = await IncidentReport.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Incident report not found'
      });
    }

    res.status(200).json({
      success: true,
      data: report,
      message: 'Incident report updated successfully'
    });
  } catch (error) {
    console.error('Error updating incident report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update incident report',
      error: error.message
    });
  }
};

// Delete an incident report
export const deleteIncidentReport = async (req, res) => {
  try {
    const report = await IncidentReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Incident report not found'
      });
    }

    // If there's a file associated with this report, delete it
    if (report.fileUrl) {
      const filePath = path.join(__dirname, '..', report.fileUrl);
      
      // Check if file exists before attempting to delete
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Delete the report from the database
    await IncidentReport.deleteOne({ _id: report._id });

    res.status(200).json({
      success: true,
      message: 'Incident report deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting incident report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete incident report',
      error: error.message
    });
  }
};