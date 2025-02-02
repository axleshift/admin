import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://shiroshinomiya3013:maricar3013@cluster0.lzfzy.mongodb.net/adminis';
const desktopDir = path.join(os.homedir(), 'Desktop', 'backup');
const BACKUP_DIR = process.env.BACKUP_DIR || desktopDir;

const now = new Date();
let hours = now.getHours();
const minutes = now.getMinutes().toString().padStart(2, '0');
const seconds = now.getSeconds().toString().padStart(2, '0');
const ampm = hours >= 12 ? 'PM' : 'AM';
hours = hours % 12;
hours = hours ? hours : 12;

const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${hours.toString().padStart(2, '0')}-${minutes}-${seconds}-${ampm}`;
const backupPath = path.join(BACKUP_DIR, timestamp);

mkdirSync(backupPath, { recursive: true });

exec(
  `mongodump --uri="${MONGO_URI}" --out="${backupPath}"`,
  (error, stdout, stderr) => {
    if (error) {
      console.error(`Backup failed: ${stderr}`);
      process.exit(1);
    }
    console.log(`Backup completed: ${stdout}`);
    console.log(`Backup created at ${backupPath}`);
  }
);