import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import fs from 'fs';
import User from '../model/User.js';



const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  
  const BACKUP_DIR = path.resolve(__dirname, 'C:/Users/ryans/OneDrive/Desktop/capstone/shesh/admin/backup');



export const sendToLogistics = async (req, res) => {
    try {
      const { username, email, department, oauthToken } = req.body;
  
      if (!username || !email || !oauthToken) {
        return res.status(400).json({ message: 'Invalid data provided.' });
      }
  
      if (department !== 'Logistics') {
        return res.status(400).json({ message: 'Invalid department.' });
      }
  
      // Simulate logistics processing
      console.log('Logistics data:', req.body);
  
      res.status(200).json({ message: 'Data sent to Logistics successfully!' });
    } catch (error) {
      console.error('Error sending to Logistics:', error);
      res.status(500).json({ message: 'Failed to send data to Logistics.' });
    }
  };
export const sendToHR = async (req, res) => {
    try {
      const { username, email, department, oauthToken } = req.body;
  
      if (!username || !email || !oauthToken) {
        return res.status(400).json({ message: 'Invalid data provided.' });
      }
  
      if (department !== 'HR') {
        return res.status(400).json({ message: 'Invalid department.' });
      }
  
      // Simulate HR processing
      console.log('hr data:', req.body);
  
      res.status(200).json({ message: 'Data sent to hr successfully!' });
    } catch (error) {
      console.error('Error sending to hr:', error);
      res.status(500).json({ message: 'Failed to send data to hr.' });
    }
  };

  export const sendTocore = async (req, res) => {
    try {
      const { username, email, department, oauthToken } = req.body;
  
      if (!username || !email || !oauthToken) {
        return res.status(400).json({ message: 'Invalid data provided.' });
      }
  
      if (department !== 'CORE') {
        return res.status(400).json({ message: 'Invalid department.' });
      }
  
      // Simulate Core processing
      console.log('core data:', req.body);
  
      res.status(200).json({ message: 'Data sent to core successfully!' });
    } catch (error) {
      console.error('Error sending to core:', error);
      res.status(500).json({ message: 'Failed to send data to core.' });
    }
  };

  export const sendTofinance = async (req, res) => {
    try {
      const { username, email, department, oauthToken } = req.body;
  
      if (!username || !email || !oauthToken) {
        return res.status(400).json({ message: 'Invalid data provided.' });
      }
  
      if (department !== 'FINANCE') {
        return res.status(400).json({ message: 'Invalid department.' });
      }
  
      // Simulate Finance processing
      console.log('finance data:', req.body);
  
      res.status(200).json({ message: 'Data sent to finance successfully!' });
    } catch (error) {
      console.error('Error sending to finance:', error);
      res.status(500).json({ message: 'Failed to send data to finance.' });
    }
  };
  
  


  export const createBackup = (req, res) => {
    // Get the current date and time
    const now = new Date();
  
    // Convert to 12-hour format with AM/PM
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12; // Convert hours to 12-hour format
    hours = hours ? hours : 12; // If hour is 0, set it to 12 (midnight)
  
    // Format date and time as 'yyyy-MM-dd_hh-mm-ss-APM'
    const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${hours.toString().padStart(2, '0')}-${minutes}-${seconds}-${ampm}`;
  
    // Set backup path with the formatted timestamp
    const backupPath = path.join(BACKUP_DIR, timestamp);
  
    // Run mongodump to back up the MongoDB data
    exec(
      `mongodump --uri="${process.env.MONGO_URL}" --out="${backupPath}"`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Backup failed: ${stderr}`);
          return res.status(500).json({ message: 'Backup failed!', error: stderr });
        }
        console.log(`Backup completed: ${stdout}`);
        res.json({ message: `Backup created at ${backupPath}` });
      }
    );
  };


  export const restoreBackup = (req, res) => {
    const { timestamp, filename, databaseName } = req.body;
  
    console.log('Received body:', req.body);
    console.log('Received timestamp:', timestamp);
    console.log('Received filename:', filename);
    console.log('Received databaseName:', databaseName);
  
    // Validate input types
    if (typeof timestamp !== 'string' || typeof filename !== 'string' || typeof databaseName !== 'string') {
      return res.status(400).json({ message: 'Invalid input format. Please provide timestamp, filename, and databaseName as strings.' });
    }
  
    // Validate timestamp format
    const timestampRegex = /^\d{4}-\d{2}-\d{2}_[0-1]?[0-9]-[0-5]?[0-9]-[0-5]?[0-9]-[AP]{1}[M]{1}$/;
    if (!timestamp.match(timestampRegex)) {
      return res.status(400).json({ message: 'Invalid timestamp format. Please use YYYY-MM-DD_HH-MM-SS format.' });
    }
  
    // Build the path to the backup file
    const restorePath = path.join(BACKUP_DIR, timestamp, databaseName);
    const filePath = path.join(restorePath, filename);
  
    // Check if the directory and file exist
    if (!fs.existsSync(restorePath)) {
      return res.status(400).json({ message: `Backup directory not found at ${restorePath}` });
    }
    if (!fs.existsSync(filePath)) {
      return res.status(400).json({ message: `Backup file not found at ${filePath}` });
    }
  
    const mongoUri = process.env.MONGO_URL;
    if (!mongoUri) {
      return res.status(500).json({ message: 'Mongo URI is not set correctly!' });
    }
  
    // Execute the mongorestore command
    exec(
      `mongorestore --uri="${mongoUri}" --db="${databaseName}" --drop "${filePath}"`,  // Correct command
      (error, stdout, stderr) => {
        if (error) {
          console.error('Error during restore:', error);
          console.error('stderr:', stderr);
          return res.status(500).json({ message: `Restore failed! ${stderr}` });
        }
  
        console.log(`Restore completed: ${stdout}`);
        return res.json({ message: `Database ${databaseName} restored from ${filePath}` });
      }
    );
  };