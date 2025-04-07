import cron from 'node-cron';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import express from 'express';
import dotenv from 'dotenv';
import archiver from 'archiver'; // Make sure to install this: npm install archiver

dotenv.config();
const router = express.Router();

let backupDir = path.join(process.cwd(), "backups");
let cronSchedule = '0 2 * * *';  // Default: Every day at 2 AM

// Create backups folder if it doesn't exist
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
}

// Load Config from File (Optional)
try {
  const config = JSON.parse(fs.readFileSync('backupConfig.json', 'utf-8'));
  backupDir = config.backupDir || backupDir;
  cronSchedule = config.cronSchedule || cronSchedule;
} catch (error) {
  console.log("No previous configuration found, using defaults.");
}

// Save Config to File
const saveConfig = () => {
  fs.writeFileSync('backupConfig.json', JSON.stringify({ backupDir, cronSchedule }, null, 2));
};

const mongoUrl = process.env.MONGO_URL;
const dbName = "adminis";

// Helper function to normalize paths for different OS
const normalizePath = (p) => path.normalize(p);

// Updated Backup Function to match backupDatabase
const createBackup = async () => {
  const now = new Date();
  const timestamp = now.toISOString().replace(/:/g, '-').replace(/\..+/, '').replace('T', '_');
  const backupDirPath = normalizePath(path.join(backupDir, timestamp));
  const archivePath = normalizePath(`${backupDirPath}.zip`);

  try {
    // Ensure backup directory exists
    if (!fs.existsSync(backupDirPath)) {
      fs.mkdirSync(backupDirPath, { recursive: true });
    }

    // Run `mongodump` and wait for completion
    await new Promise((resolve, reject) => {
      const command = `mongodump --uri "${mongoUrl}" --db ${dbName} --out "${backupDirPath}"`;
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error('Error executing mongodump:', error);
          return reject(error);
        }
        resolve(stdout);
      });
    });

    // Create a zip archive
    const output = fs.createWriteStream(archivePath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    // Handle archive errors
    archive.on('error', (err) => {
      console.error('Archiver Error:', err);
      throw err;
    });

    output.on('close', () => {
      console.log(`Backup archived: ${archivePath} (${archive.pointer()} bytes)`);
      
      // Cleanup: Remove original backup folder asynchronously
      fs.rm(backupDirPath, { recursive: true, force: true }, (err) => {
        if (err) {
          console.error('Failed to remove backup folder:', err);
        }
      });
    });

    // Pipe archive to file
    archive.pipe(output);
    archive.directory(backupDirPath, false);
    await archive.finalize();

    return {
      success: true,
      archivePath: archivePath
    };
  } catch (error) {
    console.error('Backup failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Schedule the backup with the new function
let scheduledTask = cron.schedule(cronSchedule, async () => {
  try {
    const result = await createBackup();
    if (result.success) {
      console.log(`Scheduled backup successful: ${result.archivePath}`);
    } else {
      console.error(`Scheduled backup failed: ${result.error}`);
    }
  } catch (err) {
    console.error('Error in scheduled backup:', err);
  }
}, { scheduled: true });

// NEW ROUTE: Get current backup configuration 
router.get('/config', (req, res) => {
  try {
    // Return the current configuration
    res.json({ 
      backupDir, 
      cronSchedule 
    });
  } catch (error) {
    res.status(500).send(`Failed to get configuration: ${error.message}`);
  }
});

// Route to Trigger Backup Manually
router.post('/backup', async (req, res) => {
  console.log('Backup endpoint hit!');
  try {
    const result = await createBackup();
    if (result.success) {
      res.send(`Backup triggered successfully. Archive at: ${result.archivePath}`);
    } else {
      res.status(500).send(`Backup failed: ${result.error}`);
    }
  } catch (error) {
    res.status(500).send(`Backup failed: ${error.message}`);
  }
});

// Route to Update Backup Directory
router.post('/update-directory', (req, res) => {
  backupDir = req.body.backupDir;
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }
  saveConfig();
  res.send(`Backup directory updated to: ${backupDir}`);
});

// Route to Update Cron Schedule
router.post('/update-schedule', (req, res) => {
  cronSchedule = req.body.cronSchedule;
  scheduledTask.stop();
  scheduledTask = cron.schedule(cronSchedule, async () => {
    try {
      const result = await createBackup();
      if (result.success) {
        console.log(`Scheduled backup successful: ${result.archivePath}`);
      } else {
        console.error(`Scheduled backup failed: ${result.error}`);
      }
    } catch (err) {
      console.error('Error in scheduled backup:', err);
    }
  }, { scheduled: true });
  saveConfig();
  res.send(`Backup schedule updated to: ${cronSchedule}`);
});

export default router;