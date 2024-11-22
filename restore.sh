#!/bin/bash

# Configuration
MONGO_URI="mongodb+srv://shiroshinomiya3013:maricar3013@cluster0.lzfzy.mongodb.net/adminis?retryWrites=true&w=majority&appName=Cluster0"
BACKUP_DIR="C:/Users/ryans/OneDrive/Desktop/capstone/New folder/backup"

# Prompt User for Timestamp
echo "Available Backups:"
ls "$BACKUP_DIR"
read -p "Enter the backup timestamp to restore (e.g., 2024-11-22_02-00-00): " TIMESTAMP

# Validate Backup Directory
RESTORE_PATH="$BACKUP_DIR/$TIMESTAMP"
if [ ! -d "$RESTORE_PATH" ]; then
  echo "Backup not found at $RESTORE_PATH"
  exit 1
fi

# Check required files
MISSING_FILES=()
for file in "dumpfile.bson" "metadata.json"; do
  if [ ! -f "$RESTORE_PATH/$file" ]; then
    MISSING_FILES+=("$file")
  fi
done

if [ ${#MISSING_FILES[@]} -ne 0 ]; then
  echo "Backup incomplete. Missing files: ${MISSING_FILES[@]}"
  exit 1
fi

# Run Restoration
mongorestore --uri="$MONGO_URI" --dir="$RESTORE_PATH" --drop

# Log Status
if [ $? -eq 0 ]; then
  echo "Database restored successfully from $RESTORE_PATH"
else
  echo "Restore failed!"
  exit 1
fi
