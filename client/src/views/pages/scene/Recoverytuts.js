import React, { useState } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CFormInput,
} from '@coreui/react';
import { usePostBackupMutation, usePostRestoreMutation, usePostsetDirectoryMutation } from '../../../state/api';

const RecoveryTutorial = () => {
  const [timestamp, setTimestamp] = useState('');
  const [filename, setFilename] = useState('');
  const [databaseName, setDatabaseName] = useState('');
  const [directoryPath, setDirectoryPath] = useState('');
  
  const [postBackup, { isLoading: isBackupLoading }] = usePostBackupMutation();
  const [postRestore, { isLoading: isRestoreLoading }] = usePostRestoreMutation();
  const [postsetDirectory, { isLoading: isDirectoryLoading }] = usePostsetDirectoryMutation();

  const handleBackup = async () => {
    if (!directoryPath) {
      alert('Please select a backup directory first.');
      return;
    }
    try {
      const response = await fetch('http://localhost:5053/admin/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backupDir: directoryPath }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      alert(data.message);
    } catch (error) {
      console.error('Backup failed:', error);
      alert(`Backup failed: ${error.message}`);
    }
  };
  
  

  const handleRestore = async () => {
    if (!timestamp || !filename || !databaseName || !directoryPath) {
      alert('Please enter all fields and select a directory.');
      return;
    }
    try {
      const response = await postRestore({
        timestamp,
        filename,
        databaseName,
        directoryPath,
      }).unwrap();
      alert(response.message);
    } catch (error) {
      console.error('Restore failed:', error);
      alert(error.data?.message || 'Restore failed. Please check the server logs.');
    }
  };
  const handleSelectDirectory = async () => {
    try {
      const directoryHandle = await window.showDirectoryPicker();
      
      // Log the directory handle to see its details
      console.log('Directory Handle:', directoryHandle);
  
      // Simplified logic for modern browsers
      const path = directoryHandle?.name;
  
      // Log the selected directory name
      console.log('Selected Directory Name:', path);
  
      setDirectoryPath(path);
  
      // Save the directory to the backend
      const result = await postsetDirectory({ directoryPath: path }).unwrap();
  
      // Log the backend response
      console.log('Backend Response:', result);
  
      alert(`Directory selected and saved: ${result.directory}`);
    } catch (error) {
      console.error('Error selecting directory:', error);
      alert('Failed to select and save the directory. ' + error.message);
    }
  };
  
  return (
    <CCard>
      <CCardHeader>
        <h4>System Recovery Tutorial</h4>
      </CCardHeader>
      <CCardBody>
        <CFormInput
          type="text"
          placeholder="Enter Backup Timestamp"
          value={timestamp}
          onChange={(e) => setTimestamp(e.target.value)}
        />
        <CFormInput
          type="text"
          placeholder="Enter BSON File Name"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
        />
        <CFormInput
          type="text"
          placeholder="Enter Database Name"
          value={databaseName}
          onChange={(e) => setDatabaseName(e.target.value)}
        />
        <CButton
          color="warning"
          onClick={handleSelectDirectory}
          style={{ marginTop: '10px' }}
          disabled={isDirectoryLoading}
        >
          {isDirectoryLoading ? 'Saving...' : 'Select Backup Directory'}
        </CButton>
        {directoryPath && (
          <p>
            <strong>Selected Directory:</strong> {directoryPath}
          </p>
        )}
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <CButton color="success" onClick={handleBackup} disabled={isBackupLoading}>
            {isBackupLoading ? 'Backing up...' : 'Backup Now'}
          </CButton>
          <CButton color="danger" onClick={handleRestore} disabled={isRestoreLoading}>
            {isRestoreLoading ? 'Restoring...' : 'Recover Now'}
          </CButton>
        </div>
      </CCardBody>
    </CCard>
  );
};

export default RecoveryTutorial;
