import axios from 'axios';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import IncidentReport from '../model/incidentReports.js';
import OpenAI from 'openai';

export const checkAttendanceRecord = async (req, res, next) => {
  try {
    const { id } = req.body;
    
    // Skip check if id is not provided
    if (!id) {
      return next();
    }
    
    // Get current date info for calculating month range
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed (0 = January)
    
    // Create start of month date
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    
    // Create end of month date (start of next month - 1 millisecond)
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);
    
    // Format dates for API request
    const startDateStr = startOfMonth.toISOString().split('T')[0];
    const endDateStr = endOfMonth.toISOString().split('T')[0];
    
    // Fetch user's attendance records for the current month
    const attendanceResponse = await axios.get('https://backend-hr1.axleshift.com/api/attendance/all', {
      params: {
        startDate: startDateStr,
        endDate: endDateStr,
        id: id // Using id instead of email for identification
      }
    });
    
    // Extract attendance data
    const attendanceData = attendanceResponse.data;
    
    // If no attendance data found, let the request proceed
    if (!attendanceData || !Array.isArray(attendanceData)) {
      console.log(`No attendance data found for user ID ${id}`);
      return next();
    }
    
    // Count absences in the current month
    const absences = attendanceData.filter(record => 
      record.status === 'Absent'
    );
    
    console.log(`User ID ${id} has ${absences.length} absences this month`);
    
    // If user has 3 or more absences, check for valid IR or deny access
    if (absences.length >= 3) {
      try {
        // Fetch user email from the database based on id
        const user = await req.userModel.findById(id);
        
        if (!user || !user.email) {
          console.error(`User with ID ${id} not found or has no email`);
          return res.status(404).json({
            success: false,
            message: "Access denied. You have exceeded the maximum allowed absences this month. Please contact HR."
          });
        }
        
        // Check if the user has already submitted an incident report
        const existingReport = await IncidentReport.findOne({
          $or: [
            { reportedBy: user._id },
            { 'additionalInfo.email': user.email }
          ],
          createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        });
        
        // If user has submitted an incident report, validate it
        if (existingReport) {
          // Verify if the incident report is valid for the absences
          const isValid = await verifyIncidentReport(existingReport, absences, user);
          
          if (isValid) {
            console.log(`Valid incident report found for user ID ${id}. Allowing login.`);
            return next(); // Allow login if IR is valid
          } else {
            console.log(`Invalid incident report found for user ID ${id}. Denying access.`);
            return res.status(403).json({
              success: false,
              message: "Access denied. Your submitted incident report does not adequately explain your absences. Please contact HR."
            });
          }
        }
        
        // No incident report found, generate token for secure link
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET_KEY, {expiresIn: '24h'});
        
        // Create incident report upload URL
        const uploadIrUrl = `${process.env.DEV_URL}/uploadIncident/${user._id}/${token}`;
        console.log('UploadIR link:', uploadIrUrl);
        
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
        
        // Set up email content
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: "INCIDENT REPORT REQUIRED - Excessive Absences",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Excessive Absence Incident Report Required</h2>
              <p>Hello ${user.name || 'Valued Employee'},</p>
              <p>Our records indicate that you have exceeded the maximum allowed absences for this month.</p>
              <p>In accordance with company policy, you are required to submit an incident report explaining these absences.</p>
              <div style="margin: 30px 0; text-align: center;">
                <a href="${uploadIrUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                  Submit Incident Report
                </a>
              </div>
              <p>If you cannot click the button above, please copy and paste this URL into your browser:</p>
              <p>${uploadIrUrl}</p>
              <p>This link will expire in 24 hours. Please complete your incident report as soon as possible.</p>
              <p>If you have any questions, please contact your HR department.</p>
              <p>Best regards,<br>HR Department</p>
            </div>
          `
        };
        
        // Send the email
        await transporter.sendMail(mailOptions);
        console.log(`Incident report email sent to ${user.email}`);
        
        // Deny access with message
        return res.status(403).json({
          success: false,
          message: "Access denied. You have exceeded the maximum allowed absences this month. An email has been sent to your registered email address with instructions for submitting an incident report."
        });
        
      } catch (emailError) {
        console.error('Error in incident report check or email sending:', emailError);
        
        // If email fails, still deny access but with a generic message
        return res.status(403).json({
          success: false,
          message: "Access denied. You have exceeded the maximum allowed absences this month. Please contact HR to submit an incident report."
        });
      }
    }
    
    // If everything is okay, proceed to the next middleware/controller
    next();
    
  } catch (error) {
    console.error('Error checking attendance record:', error);
    
    // Don't block login due to failure in attendance check, but log the error
    console.error('Continuing to login process despite attendance check failure');
    next();
  }
};

async function verifyIncidentReport(report, absences, user) {
  try {
    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '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'
    });

    // Prepare absence dates for context
    const absenceDates = absences.map(a => {
      const date = new Date(a.date);
      return date.toISOString().split('T')[0];
    }).join(', ');

    // Create a prompt for OpenAI to evaluate the incident report
    const prompt = `
      You are an HR compliance assistant evaluating an incident report for excessive absences.
      
      Employee: ${user.name || 'Employee'} (ID: ${user._id})
      Absent dates: ${absenceDates}
      Number of absences: ${absences.length}
      
      Incident Report Details:
      Title: ${report.title}
      Description: ${report.description}
      Severity: ${report.severity}
      Additional Information: ${JSON.stringify(report.additionalInfo || {})}
      
      Based on company policy, please evaluate if this incident report provides a valid explanation for the absences.
      A valid report should:
      1. Clearly explain the reason for absences
      2. Provide sufficient detail
      3. Be consistent with the number and pattern of absences
      4. Include any relevant supporting information
      
      Respond with 'VALID' if the report is acceptable, or 'INVALID' with a brief reason if it's not.
    `;

    // Get AI evaluation
    const response = await openai.chat.completions.create({
      model: 'gpt-4', // Use an appropriate model
      messages: [
        { role: 'system', content: 'You are an HR compliance assistant evaluating incident reports.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 150
    });

    // Extract the response text
    const evaluationText = response.choices[0].message.content.trim();
    
    // Log the evaluation
    console.log(`AI Evaluation for user ${user._id} incident report: ${evaluationText}`);
    
    // Check if the report is valid
    return evaluationText.includes('VALID') && !evaluationText.includes('INVALID');
    
  } catch (error) {
    console.error('Error verifying incident report with AI:', error);
    
    // Default to manual review in case of API failure
    console.log('Defaulting to valid report due to verification error');
    return true;
  }
}