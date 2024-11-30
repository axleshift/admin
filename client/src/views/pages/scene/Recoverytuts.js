import React, { useState } from 'react'; 
import { CCard, CCardBody, CCardHeader, CButton, CFormInput } from '@coreui/react';
import { usePostBackupMutation, usePostRestoreMutation } from '../../../state/api';

const RecoveryTutorial = () => {
  const [timestamp, setTimestamp] = useState('');
  const [filename, setFilename] = useState(''); // State for filename
  const [databaseName, setDatabaseName] = useState(''); // New state for database name
  const [postBackup, { isLoading: backupLoading }] = usePostBackupMutation();
  const [postRestore, { isLoading: restoreLoading }] = usePostRestoreMutation();

  const handleBackup = async () => {
    try {
      await postBackup().unwrap();
      alert('Backup completed successfully');
    } catch (error) {
      alert('Backup failed: ' + (error?.message || error));
    }
  };

  const handleRestore = async () => {
    if (!timestamp || !filename || !databaseName) {
      alert('Please enter valid timestamp, filename, and database name!');
      return;
    }
  
    try {
      const response = await postRestore({ timestamp, filename, databaseName }).unwrap();
      alert(response.message);
    } catch (error) {
      console.error('Restore failed:', error);
      alert(error?.data?.message || 'Restore failed.');
    }
  };
  
  return (
    <CCard>
      <CCardHeader>
        <h4>System Recovery Tutorial</h4>
      </CCardHeader>
      <CCardBody>
        <ol>
          <li>Click "Backup Now" to create a database backup.</li>
          <li>Enter a backup timestamp, filename, and database name below, then click "Recover Now" to restore a backup.</li>
        </ol>
        <CFormInput
          type="text"
          placeholder="Enter Backup Timestamp (e.g., 2024-11-22_02-00-00)"
          value={timestamp}
          onChange={(e) => setTimestamp(e.target.value)}
        />
        <CFormInput
          type="text"
          placeholder="Enter BSON File Name (e.g., activitylogs.bson)"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}  // Update filename state
        />
        <CFormInput
          type="text"
          placeholder="Enter Database Name (e.g., adminis)"
          value={databaseName}
          onChange={(e) => setDatabaseName(e.target.value)}  // Update databaseName state
        />
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <CButton
            color="success"
            onClick={handleBackup}
            disabled={backupLoading}
          >
            {backupLoading ? 'Backing Up...' : 'Backup Now'}
          </CButton>
          <CButton
            color="danger"
            onClick={handleRestore}
            disabled={restoreLoading}
          >
            {restoreLoading ? 'Restoring...' : 'Recover Now'}
          </CButton>
        </div>
      </CCardBody>
    </CCard>
  );
};

export default RecoveryTutorial;
