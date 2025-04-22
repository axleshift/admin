import fs from 'fs-extra';
import path from 'path';
import archiver from 'archiver';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import User from '../model/User.js'

//log1
import axios from 'axios';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';


// Import and register the plugin properly
import archiverZipEncrypted from 'archiver-zip-encrypted';
archiver.registerFormat('zip-encrypted', archiverZipEncrypted);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const downloadzip = async (req, res) => {
    const { name, role, username, downloadType } = req.body;
  
    try {
      // Create the password
      const password = name.substring(0, 2) + role.charAt(0) + username.slice(-6);
      
      // Ensure directories exist
      const tempDir = path.join(__dirname, '../temp');
      await fs.ensureDir(tempDir);
      
      // Create a filename based on download type
      let fileName = 'Employees';
      let query = {};
      
      // Set up query based on downloadType
      switch(downloadType) {
        case 'all': 
          fileName = 'All_Employees'; 
          break;
        case 'hr': 
          fileName = 'HR_Employees'; 
          query = { department: 'HR' };
          break;
        case 'finance': 
          fileName = 'Finance_Employees';
          query = { department: 'Finance' };
          break;
        case 'core': 
          fileName = 'Core_Employees';
          query = { department: 'Core' };
          break;
        case 'logistics': 
          fileName = 'Logistics_Employees';
          query = { department: 'Logistics' };
          break;
        case 'administrative': 
          fileName = 'Administrative_Employees';
          query = { department: 'Administrative' };
          break;
        case 'superadmin': 
          fileName = 'SuperAdmin_Employees';
          query = { role: 'superadmin' };
          break;
        case 'admin': 
          fileName = 'Admin_Employees';
          query = { role: 'admin' };
          break;
        case 'manager': 
          fileName = 'Manager_Employees';
          query = { role: 'manager' };
          break;
        case 'employee': 
          fileName = 'Regular_Employees';
          query = { role: 'employee' };
          break;
        default:
          fileName = 'Employees';
      }
      
      // Fetch employees based on query
      const employees = await User.find(query);
      
      // Create CSV data manually without papaparse
      const columns = ['Username', 'Name', 'Email', 'Phone Number', 'Country', 'Occupation', 'Role', 'Department'];
      let csvContent = columns.join(',') + '\n';
      
      employees.forEach(item => {
        const row = [
          item.username || '',
          item.name || '',
          item.email || '',
          item.phoneNumber || 'N/A',
          item.country || '',
          item.occupation || '',
          item.role || '',
          item.department || ''
        ].map(field => `"${field.toString().replace(/"/g, '""')}"`); // Escape quotes in CSV
        
        csvContent += row.join(',') + '\n';
      });
      
      // Create temp CSV file
      const csvFilePath = path.join(tempDir, `${fileName}.csv`);
      await fs.writeFile(csvFilePath, csvContent);
      
      // Create output path for ZIP
      const outputZipPath = path.join(tempDir, `${fileName}_Protected.zip`);
      
      // Create a writable stream
      const output = fs.createWriteStream(outputZipPath);
      
      // Create the archive with encryption
      const archive = archiver('zip-encrypted', {
        zlib: { level: 9 },
        encryptionMethod: 'aes256',
        password: password
      });
      
      // Pipe the archive to the output file
      archive.pipe(output);
      
      // Add the CSV file to the archive
      archive.file(csvFilePath, { name: `${fileName}.csv` });
      
      // Set up event handlers
      output.on('close', () => {
        console.log('Archive created successfully:', outputZipPath);
        
        res.download(outputZipPath, `${fileName}_Protected.zip`, (err) => {
          if (err) {
            console.error('Download error:', err);
          }
          // Clean up the temp files after download completes
          fs.remove(csvFilePath).catch(err => console.error('Failed to clean up CSV:', err));
          fs.remove(outputZipPath).catch(err => console.error('Failed to clean up ZIP:', err));
        });
      });
      
      archive.on('error', (err) => {
        console.error('Archive error:', err);
        res.status(500).send('ZIP creation failed');
      });
      
      // Finalize the archive
      await archive.finalize();
      
    } catch (err) {
      console.error('ZIP creation error:', err);
      res.status(500).send('ZIP creation failed');
    }
  };

  const LOG1_API = process.env.EXTERNAL_LOG1;
  const LOG1_APIKEY = process.env.LOG1_API_KEY;
  
  export const downloadVehicleZip = async (req, res) => {
    const { name, role, username, downloadType } = req.body;
  
    try {
      // Create the password
      const password = name.substring(0, 2) + role.charAt(0) + username.slice(-6);
      
      // Ensure directories exist
      const tempDir = path.join(__dirname, '../temp');
      await fs.ensureDir(tempDir);
      
      // Create a filename based on download type
      let fileName = 'Vehicles';
      
      // Fetch vehicle data from LOG1 API
      console.log(`Attempting to call API at: ${LOG1_API}/api/v1/vehicle/all`);
      
      const response = await axios.get(`${LOG1_API}/api/v1/vehicle/all`, {
        headers: {
          'x-api-key': LOG1_APIKEY,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('API response status:', response.status);
      
      if (!response.data) {
        throw new Error('No data received from API');
      }
      
      if (!response.data.success) {
        console.error('API error response:', JSON.stringify(response.data));
        throw new Error(`Failed to fetch vehicle data from API: ${response.data.message || 'Unknown error'}`);
      }
      
      // Get vehicles directly from response.data.data
      let vehicles = response.data.data;
      
      // Filter data based on downloadType
      switch(downloadType) {
        case 'all': 
          fileName = 'All_Vehicles'; 
          break;
        case 'available': 
          fileName = 'Available_Vehicles'; 
          vehicles = vehicles.filter(v => v.status === 'available');
          break;
        case 'in_use': 
          fileName = 'InUse_Vehicles';
          vehicles = vehicles.filter(v => v.status === 'in_use');
          break;
        case 'maintenance': 
          fileName = 'Maintenance_Vehicles';
          vehicles = vehicles.filter(v => v.status === 'maintenance');
          break;
        case 'forRegistration': 
          fileName = 'ForRegistration_Vehicles';
          vehicles = vehicles.filter(v => v.status === 'forRegistration');
          break;
        default:
          fileName = 'Vehicles';
      }
      
      // Create CSV data
      const columns = ['Registration Number', 'Brand', 'Model', 'Year', 'Type', 'Capacity', 'Fuel Type', 
                      'Current Mileage', 'Driver', 'Status', 'Registration Expiry'];
      
      let csvContent = columns.join(',') + '\n';
      
      vehicles.forEach(item => {
        if (item.deleted) return; // Skip deleted vehicles
        
        const row = [
          item.regisNumber || '',
          item.brand || '',
          item.model || '',
          item.year || '',
          item.type || '',
          item.capacity || '',
          item.fuelType || '',
          item.currentMileage || '',
          item.assignedDriver ? item.assignedDriver : 'Not Assigned', // Updated to use assignedDriver property
          item.status || '',
          item.regisExprationDate ? new Date(item.regisExprationDate).toLocaleDateString() : 'N/A'
        ].map(field => `"${field.toString().replace(/"/g, '""')}"`); // Escape quotes in CSV
        
        csvContent += row.join(',') + '\n';
      });
      
      // Create temp CSV file
      const csvFilePath = path.join(tempDir, `${fileName}.csv`);
      await fs.writeFile(csvFilePath, csvContent);
      
      // Create output path for ZIP
      const outputZipPath = path.join(tempDir, `${fileName}_Protected.zip`);
      
      // Create a writable stream
      const output = fs.createWriteStream(outputZipPath);
      
      // Create the archive with encryption
      const archive = archiver('zip-encrypted', {
        zlib: { level: 9 },
        encryptionMethod: 'aes256',
        password: password
      });
      
      // Pipe the archive to the output file
      archive.pipe(output);
      
      // Add the CSV file to the archive
      archive.file(csvFilePath, { name: `${fileName}.csv` });
      
      // Set up event handlers
      output.on('close', () => {
        console.log('Archive created successfully:', outputZipPath);
        
        res.download(outputZipPath, `${fileName}_Protected.zip`, (err) => {
          if (err) {
            console.error('Download error:', err);
          }
          // Clean up the temp files after download completes
          fs.remove(csvFilePath).catch(err => console.error('Failed to clean up CSV:', err));
          fs.remove(outputZipPath).catch(err => console.error('Failed to clean up ZIP:', err));
        });
      });
      
      archive.on('error', (err) => {
        console.error('Archive error:', err);
        res.status(500).send('ZIP creation failed');
      });
      
      // Finalize the archive
      await archive.finalize();
      
    } catch (err) {
      console.error('ZIP creation error details:', err.message);
      if (err.response) {
        console.error('API response error:', {
          status: err.response.status,
          data: err.response.data
        });
      }
      res.status(500).send('ZIP creation failed: ' + err.message);
    }
  };

  const HR3 = process.env.EXTERNAL_HR3 

  export const downloadLeaveRequestPdf = async (req, res) => {
    const { name, role, username, downloadType } = req.body;
  
    try {
      // Create the password using same logic as vehicle function
      const password = name.substring(0, 2) + role.charAt(0) + username.slice(-6);
      
      // Ensure directories exist
      const tempDir = path.join(__dirname, '../temp');
      await fs.ensureDir(tempDir);
      
      // Create a filename based on download type
      let fileName = 'LeaveRequests';
      
      // Fetch leave request data from HR3 API
      console.log(`Attempting to call API at: ${HR3}/api/leave-requests`);
      
      const response = await axios.get(`${HR3}/api/leave-requests`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('API response status:', response.status);
      
      if (!response.data) {
        throw new Error('No data received from API');
      }
      
      // Get leave requests from response - FIXED: Access data array instead of leaveRequests
      let leaveRequests = response.data.data || [];
      
      // Log the data to verify content
      console.log(`Retrieved ${leaveRequests.length} leave requests from API`);
      
      // Filter data based on downloadType
      switch(downloadType) {
        case 'all': 
          fileName = 'All_LeaveRequests'; 
          break;
        case 'pending': 
          fileName = 'Pending_LeaveRequests'; 
          leaveRequests = leaveRequests.filter(lr => lr.status && lr.status.toLowerCase() === 'pending');
          break;
        case 'approved': 
          fileName = 'Approved_LeaveRequests';
          leaveRequests = leaveRequests.filter(lr => lr.status && lr.status.toLowerCase() === 'approved');
          break;
        case 'rejected': 
          fileName = 'Rejected_LeaveRequests';
          leaveRequests = leaveRequests.filter(lr => lr.status && lr.status.toLowerCase() === 'rejected');
          break;
        default:
          fileName = 'LeaveRequests';
      }
      
      // Create PDF file
      const pdfFilePath = path.join(tempDir, `${fileName}.pdf`);
      const doc = new PDFDocument();
      const pdfStream = fs.createWriteStream(pdfFilePath);
      
      // Pipe the PDF document to a write stream
      doc.pipe(pdfStream);
      
      // Add content to PDF
      doc.fontSize(20).text('Leave Requests Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
      doc.moveDown();
      doc.fontSize(14).text(`Report Type: ${downloadType.charAt(0).toUpperCase() + downloadType.slice(1)}`, { align: 'center' });
      doc.moveDown(2);
      
      // Check if there are any leave requests to display
      if (leaveRequests.length === 0) {
        doc.fontSize(14).text('No leave requests found for the selected criteria.', { align: 'center' });
      } else {
        // Add table header
        doc.fontSize(12).fillColor('#000000');
        const tableTop = doc.y;
        const tableHeaders = ['ID', 'Employee', 'Leave Type', 'Start Date', 'Days', 'Status'];
        const columnWidth = 500 / tableHeaders.length;
        
        // Draw header row
        doc.rect(50, tableTop, 500, 30).fillAndStroke('#e6e6e6', '#000000');
        let currentXPos = 60;
        
        tableHeaders.forEach(header => {
          doc.text(header, currentXPos, tableTop + 10);
          currentXPos += columnWidth;
        });
        
        // Draw data rows
        let yPos = tableTop + 40;
        
        leaveRequests.forEach((request, index) => {
          const rowHeight = 25;
          const fillColor = index % 2 === 0 ? '#f9f9f9' : '#ffffff';
          
          // Format date
          let startDate = "N/A";
          try {
            if (request.start_date) {
              startDate = new Date(request.start_date).toLocaleDateString();
            }
          } catch (e) {
            startDate = "Invalid Date";
          }
          
          // Draw row background
          doc.rect(50, yPos - 10, 500, rowHeight).fillAndStroke(fillColor, '#cccccc');
          
          // Add row data
          let currentX = 60;
          
          doc.text(request.id || 'N/A', currentX, yPos);
          currentX += columnWidth;
          
          doc.text(request.name || 'Unknown', currentX, yPos);
          currentX += columnWidth;
          
          doc.text(request.leave_type || 'N/A', currentX, yPos);
          currentX += columnWidth;
          
          doc.text(startDate, currentX, yPos);
          currentX += columnWidth;
          
          doc.text(request.days?.toString() || 'N/A', currentX, yPos);
          currentX += columnWidth;
          
          doc.text(request.status || 'Unknown', currentX, yPos);
          
          yPos += rowHeight;
          
          // Add new page if needed
          if (yPos > 700) {
            doc.addPage();
            yPos = 50;
            doc.text(`Leave Requests - Page ${doc.bufferedPageRange().count}`, { align: 'center' });
            doc.moveDown(2);
            yPos = doc.y;
          }
        });
      }
      
      // Add footer
      doc.fontSize(10).text(`Total Records: ${leaveRequests.length}`, 50, doc.page.height - 50, {
        align: 'center',
      });
      
      // Finalize the PDF
      doc.end();
      
      // Wait for the PDF to be fully written
      await new Promise(resolve => pdfStream.on('finish', resolve));
      
      // Create output path for ZIP
      const outputZipPath = path.join(tempDir, `${fileName}_Protected.zip`);
      
      // Create a writable stream
      const output = fs.createWriteStream(outputZipPath);
      
      // Create the archive with encryption
      const archive = archiver('zip-encrypted', {
        zlib: { level: 9 },
        encryptionMethod: 'aes256',
        password: password
      });
      
      // Pipe the archive to the output file
      archive.pipe(output);
      
      // Add the PDF file to the archive
      archive.file(pdfFilePath, { name: `${fileName}.pdf` });
      
      // Set up event handlers
      output.on('close', () => {
        console.log('Archive created successfully:', outputZipPath);
        
        res.download(outputZipPath, `${fileName}_Protected.zip`, (err) => {
          if (err) {
            console.error('Download error:', err);
          }
          // Clean up the temp files after download completes
          fs.remove(pdfFilePath).catch(err => console.error('Failed to clean up PDF:', err));
          fs.remove(outputZipPath).catch(err => console.error('Failed to clean up ZIP:', err));
        });
      });
      
      archive.on('error', (err) => {
        console.error('Archive error:', err);
        res.status(500).send('ZIP creation failed');
      });
      
      // Finalize the archive
      await archive.finalize();
      
    } catch (err) {
      console.error('PDF generation and ZIP creation error:', err.message);
      if (err.response) {
        console.error('API response error:', {
          status: err.response.status,
          data: err.response.data
        });
      }
      res.status(500).send('PDF download failed: ' + err.message);
    }
  };



  import nodemailer from 'nodemailer'


  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false, // Allow self-signed certificates
    },
    connectionTimeout: 10000,
  });

  
 export const testsend = async (req, res) => {
  const { recipient } = req.body;

  if (!recipient) {
    return res.status(400).json({
      success: false,
      message: "Email recipient is required",
    });
  }

  // Validate environment variables
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("Email configuration is missing");
    return res.status(500).json({
      success: false,
      message: "Email configuration is missing. Please check your environment variables.",
    });
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipient,
    subject: "Hello from our application",
    text: "Hello!",
    html: "<h1>Hello!</h1><p>This is a test email from our MERN stack application.</p>",
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);

    res.status(200).json({
      success: true,
      message: "Email sent successfully",
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("Error sending email:", error);

    res.status(500).json({
      success: false,
      message: "Failed to send email",
      error: error.message,
    });
  }
};