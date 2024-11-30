#!/bin/bash

# Configuration
MONGO_URI="mongodb+srv://shiroshinomiya3013:maricar3013@cluster0.lzfzy.mongodb.net/adminis?retryWrites=true&w=majority&appName=Cluster0"
BACKUP_DIR="C:/Users/ryans/OneDrive/Desktop/capstone/New folder/backup"

# Prompt User for Timestamp and File Name
echo "Available Backups:"
ls "$BACKUP_DIR"
read -p "Enter the backup timestamp to restore (e.g., 2024-11-22_02-00-00): " TIMESTAMP
read -p "Enter the BSON file name to restore (e.g., activitylogs.bson): " FILENAME

# Validate Backup Directory
RESTORE_PATH="$BACKUP_DIR/$TIMESTAMP"
if [ ! -d "$RESTORE_PATH" ]; then
  echo "Backup not found at $RESTORE_PATH"
  exit 1
fi

# Check if the specified BSON file exists
if [ ! -f "$RESTORE_PATH/$FILENAME" ]; then
  echo "Backup file $FILENAME not found at $RESTORE_PATH"
  exit 1
fi

# Run mongorestore for the specific file
mongorestore --uri="$MONGO_URI" --file="$RESTORE_PATH/$FILENAME" --drop

# Log Status
if [ $? -eq 0 ]; then
  echo "Database restored successfully from $RESTORE_PATH/$FILENAME"
else
  echo "Restore failed!"
  exit 1
fi
