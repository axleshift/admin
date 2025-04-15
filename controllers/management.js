import fs from 'fs-extra';
import path from 'path';
import archiver from 'archiver';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import User from '../model/User.js'

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