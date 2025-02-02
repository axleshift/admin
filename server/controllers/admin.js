
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';

let backupDir = ''; // The base directory for backups
const mongoURL = process.env.MONGO_URL || 'your-default-mongo-uri-here';

export const setBackupDirectory = (req, res) => {
    const { directory } = req.body;

    if (!directory) {
        return res.status(400).json({ message: 'Directory is required' });
    }

    backupDir = directory;
    console.log(`Backup directory set to: ${backupDir}`);
    res.status(200).json({ message: `Backup directory set to: ${backupDir}` });
};

export const backupDatabase = (req, res) => {
    if (!backupDir) {
        return res.status(400).json({ message: 'Backup directory not set' });
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = String(hours % 12 || 12).padStart(2, '0');

    const timestamp = `${year}-${month}-${day}_${formattedHours}-${minutes}-${seconds}-${ampm}`;
    const filePath = path.join(backupDir, `${timestamp}`);

    const databaseName = 'adminis';
    const command = `mongodump --uri "${mongoURL}" --db ${databaseName} --out ${filePath}`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error('Error executing mongodump:', error);
            return res.status(500).json({ message: 'Backup failed', error: error.message });
        }
        res.status(200).json({ message: 'Backup successful', filePath });
    });
};

export const restoreDatabase = (req, res) => {
    const { timestamp, filename, databaseName } = req.body;

    if (!timestamp || !filename || !databaseName) {
        return res.status(400).json({ message: 'All inputs are required: timestamp, filename, and database name.' });
    }

    const timestampRegex = /^\d{4}-\d{2}-\d{2}_[0-1]?[0-9]-[0-5]?[0-9]-[0-5]?[0-9]-[AP]{1}[M]{1}$/;
    if (!timestamp.match(timestampRegex)) {
        return res.status(400).json({ message: 'Invalid timestamp format. Use YYYY-MM-DD_HH-MM-SS-AM/PM.' });
    }

    const filePath = path.join(backupDir, timestamp, databaseName, filename);

    if (!fs.existsSync(filePath)) {
        return res.status(400).json({ message: `Backup file not found at ${filePath}. Ensure the file exists.` });
    }

    const collectionName = path.basename(filename, '.bson');
    const command = `mongorestore --uri="${mongoURL}" --nsInclude=${databaseName}.${collectionName} "${filePath}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error('Restore failed:', stderr);
            return res.status(500).json({ message: `Restore failed. Error: ${stderr}` });
        }
        res.json({ message: `Collection '${collectionName}' restored successfully into database '${databaseName}' from ${filePath}` });
    });
};
