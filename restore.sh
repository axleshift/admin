import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://shiroshinomiya3013:maricar3013@cluster0.lzfzy.mongodb.net/adminis?retryWrites=true&w=majority&appName=Cluster0';
const BACKUP_DIR = process.env.BACKUP_DIR || path.resolve(__dirname, 'backup');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("Available Backups:");
exec(`ls "${BACKUP_DIR}"`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error listing backups: ${stderr}`);
    process.exit(1);
  }
  console.log(stdout);

  rl.question('Enter the backup timestamp to restore (e.g., 2024-11-22_02-00-00): ', (timestamp) => {
    rl.question('Enter the BSON file name to restore (e.g., activitylogs.bson): ', (filename) => {
      const restorePath = path.join(BACKUP_DIR, timestamp);
      const filePath = path.join(restorePath, filename);

      if (!existsSync(restorePath)) {
        console.error(`Backup not found at ${restorePath}`);
        process.exit(1);
      }

      if (!existsSync(filePath)) {
        console.error(`Backup file ${filename} not found at ${filePath}`);
        process.exit(1);
      }

      exec(
        `mongorestore --uri="${MONGO_URI}" --file="${filePath}" --drop`,
        (error, stdout, stderr) => {
          if (error) {
            console.error(`Restore failed: ${stderr}`);
            process.exit(1);
          }
          console.log(`Restore completed: ${stdout}`);
          console.log(`Database restored from ${filePath}`);
          rl.close();
        }
      );
    });
  });
});