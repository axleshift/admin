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
let retentionPeriodMonths = 6;   // Default: Keep backups for 6 months

// Load Config from File
try {
  const config = JSON.parse(fs.readFileSync('backupConfig.json', 'utf-8'));
  cronSchedule = config.cronSchedule || cronSchedule;
  retentionPeriodMonths = config.retentionPeriodMonths || retentionPeriodMonths;
} catch (error) {
  console.log("No previous configuration found, using defaults.");
}

// Save Config to File
const saveConfig = () => {
  fs.writeFileSync('backupConfig.json', JSON.stringify({ 
    cronSchedule, 
    retentionPeriodMonths 
  }, null, 2));
};

const mongoUrl = process.env.MONGO_URL;
const dbName = "adminis";

// Helper function to normalize paths for different OS
const normalizePath = (filepath) => {
  if (!filepath) return '';
  return path.normalize(filepath).replace(/\\/g, '/');
};

// Function to clean up old backups
const cleanupOldBackups = async (testMode = false, testMinutes = 1) => {
  try {
    if (testMode) {
      console.log(`TEST MODE: Starting cleanup of backups older than ${testMinutes} minutes...`);
    } else {
      console.log(`Starting cleanup of backups older than ${retentionPeriodMonths} months...`);
    }
    
    // Calculate the cutoff date
    const now = new Date();
    let cutoffDate;
    
    if (testMode) {
      // For test mode: current time minus specified minutes
      cutoffDate = new Date(now.getTime() - (testMinutes * 60 * 1000));
      console.log(`TEST MODE: Cutoff date set to ${testMinutes} minutes ago: ${cutoffDate.toISOString()}`);
    } else {
      // Regular mode: current date minus retention period in months
      cutoffDate = new Date(now.setMonth(now.getMonth() - retentionPeriodMonths));
    }
    
    // Get all zip files in the backup directory
    const files = fs.readdirSync(backupDir)
      .filter(file => file.endsWith('.zip'))
      .map(file => ({
        name: file,
        path: path.join(backupDir, file),
        stats: fs.statSync(path.join(backupDir, file))
      }));
    
    let deletedCount = 0;
    let deletedSize = 0;
    
    // Delete files older than the cutoff date
    for (const file of files) {
      const fileDate = new Date(file.stats.mtime);
      if (fileDate < cutoffDate) {
        const fileSize = file.stats.size;
        fs.unlinkSync(file.path);
        deletedCount++;
        deletedSize += fileSize;
        console.log(`Deleted ${testMode ? 'TEST MODE ' : ''}old backup: ${file.name} (${fileDate.toISOString()})`);
      }
    }
    
    console.log(`${testMode ? 'TEST MODE ' : ''}Cleanup complete. Deleted ${deletedCount} files (${(deletedSize / (1024 * 1024)).toFixed(2)} MB)`);
    
    return {
      success: true,
      testMode: testMode,
      deletedFiles: deletedCount,
      deletedSize: deletedSize
    };
  } catch (error) {
    console.error(`${testMode ? 'TEST MODE ' : ''}Cleanup failed:`, error);
    return {
      success: false,
      testMode: testMode,
      error: error.message
    };
  }
};

// Create test backup with custom date function
const createTestBackup = async (minutesOld) => {
  const now = new Date();
  const oldDate = new Date(now.getTime() - (minutesOld * 60 * 1000));
  const timestamp = oldDate.toISOString().replace(/:/g, '-').replace(/\..+/, '').replace('T', '_');
  const backupDirPath = normalizePath(path.join(backupDir, timestamp));
  const archivePath = normalizePath(`${backupDirPath}.zip`);

  try {
    // Ensure backup directory exists
    if (!fs.existsSync(backupDirPath)) {
      fs.mkdirSync(backupDirPath, { recursive: true });
    }

    // Create a simple text file with test data
    fs.writeFileSync(path.join(backupDirPath, 'test_data.txt'), 'This is a test backup file');

    // Create a zip archive
    const output = fs.createWriteStream(archivePath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    // Handle archive errors
    archive.on('error', (err) => {
      console.error('Archiver Error:', err);
      throw err;
    });

    // Set up promise to handle archive completion
    const archivePromise = new Promise((resolve, reject) => {
      output.on('close', () => {
        console.log(`Test backup archived: ${archivePath} (${archive.pointer()} bytes)`);
        resolve();
      });
      
      archive.on('error', (err) => {
        reject(err);
      });
    });

    // Pipe archive to file
    archive.pipe(output);
    archive.directory(backupDirPath, false);
    await archive.finalize();
    
    // Wait for archive completion
    await archivePromise;
    
    // Cleanup: Remove original backup folder
    fs.rmSync(backupDirPath, { recursive: true, force: true });
    
    // Set the file's modification time to the old date
    fs.utimesSync(archivePath, oldDate, oldDate);
    
    return {
      success: true,
      archivePath: archivePath,
      createdDate: oldDate
    };
  } catch (error) {
    console.error('Test backup creation failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
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
    // Run backup
    const result = await createBackup();
    if (result.success) {
      console.log(`Scheduled backup successful: ${result.archivePath}`);
      
      // After successful backup, clean up old backups
      const cleanupResult = await cleanupOldBackups();
      if (cleanupResult.success) {
        console.log(`Cleaned up ${cleanupResult.deletedFiles} old backup files`);
      } else {
        console.error(`Failed to clean up old backups: ${cleanupResult.error}`);
      }
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
    res.json({ 
      cronSchedule,
      retentionPeriodMonths
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
      res.send(`Backup triggered successfully.`);
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
  
  // Update retention period if provided
  if (req.body.retentionPeriodMonths) {
    retentionPeriodMonths = parseInt(req.body.retentionPeriodMonths, 10);
  }
  
  scheduledTask.stop();
  scheduledTask = cron.schedule(cronSchedule, async () => {
    try {
      // Run backup
      const result = await createBackup();
      if (result.success) {
        console.log(`Scheduled backup successful: ${result.archivePath}`);
        
        // After successful backup, clean up old backups
        const cleanupResult = await cleanupOldBackups();
        if (cleanupResult.success) {
          console.log(`Cleaned up ${cleanupResult.deletedFiles} old backup files`);
        } else {
          console.error(`Failed to clean up old backups: ${cleanupResult.error}`);
        }
      } else {
        console.error(`Scheduled backup failed: ${result.error}`);
      }
    } catch (err) {
      console.error('Error in scheduled backup:', err);
    }
  }, { scheduled: true });
  
  saveConfig();
  res.send(`Backup schedule updated to: ${cronSchedule} (keeping backups for ${retentionPeriodMonths} months)`);
});

// New route to manually trigger cleanup of old backups
router.post('/cleanup', async (req, res) => {
  try {
    // Override retention period if provided in request
    if (req.body.retentionPeriodMonths) {
      retentionPeriodMonths = parseInt(req.body.retentionPeriodMonths, 10);
      saveConfig();
    }
    
    const result = await cleanupOldBackups();
    if (result.success) {
      res.send(`Cleanup successful. Deleted ${result.deletedFiles} backup files older than ${retentionPeriodMonths} months.`);
    } else {
      res.status(500).send(`Cleanup failed: ${result.error}`);
    }
  } catch (error) {
    res.status(500).send(`Cleanup failed: ${error.message}`);
  }
});
router.post('/test-retention', async (req, res) => {
  try {
    console.log('Starting retention test...');
    
    // Step 1: Create a test backup that's older than the test threshold
    const minutes = req.body.minutes || 1;
    const testBackupCount = req.body.testBackupCount || 1;
    
    console.log(`Creating ${testBackupCount} test backups older than ${minutes} minute(s)...`);
    
    // Create multiple test backups that are older than our threshold
    for (let i = 0; i < testBackupCount; i++) {
      const age = minutes + 1 + i; // Each backup is progressively older
      const testResult = await createTestBackup(age);
      
      if (!testResult.success) {
        return res.status(500).send(`Test failed: Unable to create test backup ${i+1}: ${testResult.error}`);
      }
      
      console.log(`Created test backup ${i+1} with date: ${testResult.createdDate.toISOString()} (${age} minutes old)`);
    }
    
    // Step 2: Create a backup that's newer than the test threshold
    const newTestResult = await createTestBackup(minutes / 2);
    
    if (!newTestResult.success) {
      return res.status(500).send(`Test failed: Unable to create new test backup: ${newTestResult.error}`);
    }
    
    console.log(`Created newer test backup with date: ${newTestResult.createdDate.toISOString()} (${minutes/2} minutes old)`);
    
    // Step 3: Run the cleanup with test mode enabled
    const cleanupResult = await cleanupOldBackups(true, minutes);
    
    if (!cleanupResult.success) {
      return res.status(500).send(`Test failed: Cleanup error: ${cleanupResult.error}`);
    }
    
    // Report results
    const expectedDeleted = testBackupCount;
    if (cleanupResult.deletedFiles === expectedDeleted) {
      res.send(`Test successful! Created ${testBackupCount} test backups older than ${minutes} minutes and 1 newer backup. Verified that only the ${expectedDeleted} older one(s) were deleted.`);
    } else if (cleanupResult.deletedFiles === 0) {
      res.send(`Test failed: No files were deleted. Check the server logs for more details.`);
    } else {
      res.send(`Test completed with unexpected results: ${cleanupResult.deletedFiles} files were deleted, expected ${expectedDeleted}.`);
    }
  } catch (error) {
    res.status(500).send(`Test failed: ${error.message}`);
  }
});

// Add a new route to test the minutes-ago retention
router.post('/test-minutes-retention', async (req, res) => {
  try {
    const minutes = parseInt(req.body.minutes || 5, 10);
    
    if (!minutes || minutes < 1) {
      return res.status(400).send('Invalid minutes value. Please provide a positive integer.');
    }
    
    console.log(`Starting minutes-ago retention test with ${minutes} minutes...`);
    
    // Create a test backup that's older than our specified minutes
    const testResult = await createTestBackup(minutes + 1);
    
    if (!testResult.success) {
      return res.status(500).send(`Test failed: Unable to create test backup: ${testResult.error}`);
    }
    
    // Run the cleanup with test mode enabled
    const cleanupResult = await cleanupOldBackups(true, minutes);
    
    if (!cleanupResult.success) {
      return res.status(500).send(`Test failed: Cleanup error: ${cleanupResult.error}`);
    }
    
    // Report results
    if (cleanupResult.deletedFiles >= 1) {
      res.send(`Test successful! Deleted ${cleanupResult.deletedFiles} backup(s) older than ${minutes} minutes.`);
    } else {
      res.send(`Test result: No files were deleted that were older than ${minutes} minutes.`);
    }
  } catch (error) {
    res.status(500).send(`Test failed: ${error.message}`);
  }
});

export default router;