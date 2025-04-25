import cron from 'node-cron';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import express from 'express';
import dotenv from 'dotenv';
import archiver from 'archiver'; // Make sure to install this: npm install archiver

dotenv.config();
const router = express.Router();

const getDownloadDirectory = () => {
  const homeDir = os.homedir();  // Get the user's home directory

  if (process.platform === 'win32') {
    // Windows: Use the Downloads folder in the user's home directory
    return path.join(homeDir, 'Downloads', 'my-backups');
  } else {
    // Linux/macOS: Use the Downloads folder in the user's home directory
    return path.join(homeDir, 'Downloads', 'my-backups');
  }
};

const backupDir = getDownloadDirectory();

if (!fs.existsSync(backupDir)) {
  try {
    fs.mkdirSync(backupDir, { recursive: true });
    console.log(`Created backup directory at: ${backupDir}`);
  } catch (error) {
    console.error(`Failed to create backup directory: ${error.message}`);
  }
}

let cronSchedule = '0 2 * * *';  // Default: Every day at 2 AM

// Load Config from File (Only for schedule now)
try {
  const config = JSON.parse(fs.readFileSync('backupConfig.json', 'utf-8'));
  cronSchedule = config.cronSchedule || cronSchedule;
} catch (error) {
  console.log("No previous configuration found, using defaults.");
}

// Save Config to File
const saveConfig = () => {
  fs.writeFileSync('backupConfig.json', JSON.stringify({ cronSchedule }, null, 2));
};

const mongoUrl = process.env.MONGO_URL;
const dbName = "adminis";

// Helper function to normalize paths for different OS
const normalizePath = (filepath) => {
  if (!filepath) return '';
  return path.normalize(filepath).replace(/\\/g, '/');
};

// Updated Backup Function
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

// Get current backup configuration 
router.get('/config', (req, res) => {
  try {
    // Return only the schedule, not the directory
    res.json({ 
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
    const collections = process.env.BACKUP_COLLECTIONS?.split(',') || [];
    if (collections.length === 0) {
      return res.status(400).send('No collections specified in BACKUP_COLLECTIONS environment variable.');
    }

    const createBackupForCollections = async () => {
      const now = new Date();
      const timestamp = now.toISOString().replace(/:/g, '-').replace(/\..+/, '').replace('T', '_');
      const backupDirPath = normalizePath(path.join(backupDir, timestamp));
      const archivePath = normalizePath(`${backupDirPath}.zip`);

      try {
        // Ensure backup directory exists
        if (!fs.existsSync(backupDirPath)) {
          fs.mkdirSync(backupDirPath, { recursive: true });
        }

        // Backup each collection
        for (const collection of collections) {
          await new Promise((resolve, reject) => {
            const command = `mongodump --uri "${mongoUrl}" --db ${dbName} --collection ${collection} --out "${backupDirPath}"`;
            exec(command, (error, stdout, stderr) => {
              if (error) {
                console.error(`Error backing up collection ${collection}:`, error);
                return reject(error);
              }
              console.log(`Collection ${collection} backed up successfully.`);
              resolve(stdout);
            });
          });
        }

        // Create a zip archive
        const output = fs.createWriteStream(archivePath);
        const archive = archiver('zip', { zlib: { level: 9 } });

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

        archive.pipe(output);
        archive.directory(backupDirPath, false);
        await archive.finalize();

        return {
          success: true,
          archivePath: archivePath,
        };
      } catch (error) {
        console.error('Backup failed:', error);
        return {
          success: false,
          error: error.message,
        };
      }
    };

    const result = await createBackupForCollections();
    if (result.success) {
      res.send(`Backup triggered successfully. `);
    } else {
      res.status(500).send(`Backup failed: ${result.error}`);
    }
  } catch (error) {
    res.status(500).send(`Backup failed: ${error.message}`);
  }
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