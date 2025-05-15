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


  const HR3_API_URL = process.env.EXTERNAL_Hr3;
  
  export const downloadLeaveRequestPdf = async (req, res) => {
    const { name, role, username, downloadType } = req.body;
  
    try {
      // Generate a password for the ZIP file
      const password = name.substring(0, 2) + role.charAt(0) + username.slice(-6);
  
      // Ensure the temp directory exists
      const tempDir = path.join(__dirname, '../temp');
      await fs.ensureDir(tempDir);
  
      // Set the filename based on the download type
      let fileName = 'LeaveRequests';
  
      // Fetch leave request data from the external API
      const apiUrl = `${process.env.EXTERNAL_Hr3}/api/leave-requests`;
      console.log(`Calling API: ${apiUrl}`);
  
      const response = await axios.get(apiUrl, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      // Validate the API response
      if (!response.data || !Array.isArray(response.data.leaveRequests)) {
        console.error('Invalid API response:', response.data);
        throw new Error('Failed to retrieve leave request data from the API.');
      }
  
      let leaveRequests = response.data.leaveRequests;
  
      // Filter leave requests based on the download type
      switch (downloadType) {
        case 'pending':
          fileName = 'Pending_LeaveRequests';
          leaveRequests = leaveRequests.filter((req) => req.status?.toLowerCase() === 'pending');
          break;
        case 'approved':
          fileName = 'Approved_LeaveRequests';
          leaveRequests = leaveRequests.filter((req) => req.status?.toLowerCase() === 'approved');
          break;
        case 'rejected':
          fileName = 'Rejected_LeaveRequests';
          leaveRequests = leaveRequests.filter((req) => req.status?.toLowerCase() === 'rejected');
          break;
        default:
          fileName = 'All_LeaveRequests';
      }
  
      // Check if there are any leave requests to process
      if (leaveRequests.length === 0) {
        throw new Error('No leave requests found for the selected criteria.');
      }
  
      // Generate the PDF
      const pdfFilePath = path.join(tempDir, `${fileName}.pdf`);
      const doc = new PDFDocument();
      const pdfStream = fs.createWriteStream(pdfFilePath);
  
      doc.pipe(pdfStream);
  
      // Add content to the PDF
      doc.fontSize(20).text('Leave Requests Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
      doc.moveDown();
      doc.fontSize(14).text(`Report Type: ${downloadType.charAt(0).toUpperCase() + downloadType.slice(1)}`, { align: 'center' });
      doc.moveDown(2);
  
      // Define table headers and column widths
      const headers = ['ID', 'Employee', 'Leave Type', 'Start Date', 'End Date', 'Days', 'Status'];
      const columnWidths = [50, 150, 100, 100, 100, 50, 100]; // Define column widths
      let yPos = doc.y;
  
      // Draw table headers
      headers.forEach((header, index) => {
        doc.fontSize(10).text(header, 50 + columnWidths.slice(0, index).reduce((a, b) => a + b, 0), yPos, {
          width: columnWidths[index],
          align: 'center',
        });
      });
  
      yPos += 20; // Move to the next row
  
      // Add leave request data with proper alignment
      leaveRequests.forEach((request) => {
        const row = [
          request.id || 'N/A',
          request.name || 'N/A',
          request.leave_type || 'N/A',
          new Date(request.start_date).toLocaleDateString() || 'N/A',
          new Date(request.end_date).toLocaleDateString() || 'N/A',
          request.total_days || 'N/A',
          request.status || 'N/A',
        ];
  
        row.forEach((cell, index) => {
          doc.fontSize(10).text(cell, 50 + columnWidths.slice(0, index).reduce((a, b) => a + b, 0), yPos, {
            width: columnWidths[index],
            align: 'center',
          });
        });
  
        yPos += 20; // Move to the next row
  
        // Add a new page if the content exceeds the page height
        if (yPos > 700) {
          doc.addPage();
          yPos = 50;
  
          // Redraw table headers on the new page
          headers.forEach((header, index) => {
            doc.fontSize(10).text(header, 50 + columnWidths.slice(0, index).reduce((a, b) => a + b, 0), yPos, {
              width: columnWidths[index],
              align: 'center',
            });
          });
  
          yPos += 20; // Move to the next row
        }
      });
  
      doc.end();
  
      // Wait for the PDF to be fully written
      await new Promise((resolve, reject) => {
        pdfStream.on('finish', resolve);
        pdfStream.on('error', reject);
      });
  
      // Create a password-protected ZIP file
      const zipFilePath = path.join(tempDir, `${fileName}_Protected.zip`);
      const output = fs.createWriteStream(zipFilePath);
      const archive = archiver('zip-encrypted', {
        zlib: { level: 9 },
        encryptionMethod: 'aes256',
        password: password,
      });
  
      archive.pipe(output);
      archive.file(pdfFilePath, { name: `${fileName}.pdf` });
  
      // Finalize the archive
      await archive.finalize();
  
      // Wait for the ZIP file to be fully written
      await new Promise((resolve, reject) => {
        output.on('close', resolve);
        archive.on('error', reject);
      });
  
      // Send the ZIP file as a response
      res.download(zipFilePath, `${fileName}_Protected.zip`, (err) => {
        if (err) {
          console.error('Error sending ZIP file:', err);
        }
  
        // Clean up temporary files
        fs.remove(pdfFilePath).catch((err) => console.error('Error removing PDF file:', err));
        fs.remove(zipFilePath).catch((err) => console.error('Error removing ZIP file:', err));
      });
    } catch (err) {
      console.error('Error generating leave request PDF:', err.message);
      res.status(500).send({ error: err.message });
    }
  };



export const downloadPayrollZip = async (req, res) => {
  const { name, role, username, department, downloadType } = req.body;

  try {
    // Generate password
    const password = name.substring(0, 2) + role.charAt(0) + username.slice(-6);

    // Fetch payroll data from the external system
    const response = await axios.get(`${HR3_API_URL}/api/payrolls`);

    // Access the payroll data directly from the response
    if (!response.data || !Array.isArray(response.data)) {
      console.error('Failed to fetch payroll data: No payroll entries found');
      return res.status(500).json({ message: 'Failed to fetch payroll data' });
    }

    let payrollData = response.data;

    // Filter data based on downloadType
    switch (downloadType) {
      case 'logistics':
        payrollData = payrollData.filter((entry) => entry.department.toLowerCase() === 'logistics');
        break;
      case 'hr':
      case 'human_resources':
        payrollData = payrollData.filter((entry) => entry.department.toLowerCase() === 'human resources');
        break;
      case 'core':
        payrollData = payrollData.filter((entry) => entry.department.toLowerCase() === 'core');
        break;
      case 'finance':
        payrollData = payrollData.filter((entry) => entry.department.toLowerCase() === 'finance');
        break;
      case 'admin':
        payrollData = payrollData.filter((entry) => entry.department.toLowerCase() === 'admin');
        break;
      default:
        break; // No filtering for 'all'
    }

    // Check if there is no payroll data after filtering
    if (payrollData.length === 0) {
      console.error(`No payroll data found for ${downloadType}`);
      return res.status(404).json({ message: `No payroll data found for ${downloadType}` });
    }

    // Create CSV content
    const columns = ['Employee ID', 'Name', 'Department', 'Gross Salary', 'Net Salary', 'Month', 'Year', 'Status'];
    let csvContent = columns.join(',') + '\n';

    payrollData.forEach((item) => {
      const row = [
        item.employee_id || '',
        item.name || '',
        item.department || '',
        item.gross_salary || '',
        item.net_salary || '',
        item.month || '',
        item.year || '',
        item.status || '',
      ].map((field) => `"${field.toString().replace(/"/g, '""')}"`);
      csvContent += row.join(',') + '\n';
    });

    console.log('CSV content created successfully.');

    // Ensure temp directory exists
    const tempDir = path.join(__dirname, '../temp');
    await fs.ensureDir(tempDir);

    // Create CSV file
    const csvFilePath = path.join(tempDir, 'Payroll.csv');
    await fs.writeFile(csvFilePath, csvContent);

    console.log('CSV file created at:', csvFilePath);

    // Create ZIP file
    const zipFilePath = path.join(tempDir, 'Payroll_Protected.zip');
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver('zip-encrypted', {
      zlib: { level: 9 },
      encryptionMethod: 'aes256',
      password,
    });

    archive.pipe(output);
    archive.file(csvFilePath, { name: 'Payroll.csv' });

    // Finalize the archive
    await archive.finalize();

    console.log('ZIP file created at:', zipFilePath);

    // Send ZIP file as response
    output.on('close', () => {
      res.download(zipFilePath, 'Payroll_Protected.zip', async (err) => {
        if (err) {
          console.error('Error sending ZIP file:', err);
        }
        // Clean up temp files
        await fs.remove(csvFilePath);
        await fs.remove(zipFilePath);
      });
    });

    archive.on('error', (err) => {
      console.error('Error creating ZIP file:', err);
      res.status(500).send('Failed to create ZIP file');
    });
  } catch (err) {
    console.error('Error generating payroll ZIP:', err.message);
    if (err.response) {
      console.error('API response error:', {
        status: err.response.status,
        data: err.response.data,
      });
    }
    res.status(500).send('Failed to generate payroll ZIP');
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