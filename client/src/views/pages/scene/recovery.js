import React, { useState } from 'react';
import { CContainer, CButton, CRow, CCol, CForm, CFormLabel, CFormInput } from '@coreui/react';
import axios from 'axios';

const RecoveryPage = () => {
    const [directory, setDirectory] = useState('');
    const [timestamp, setTimestamp] = useState('');
    const [databaseName, setDatabaseName] = useState('');
    const [filename, setFilename] = useState('');

    console.log('directory:', directory);
    const handleSetDirectory = async () => {
        if (!directory) {
            alert('Please enter a directory.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5053/admin/set-directory', { directory });
            alert(response.data.message);
        } catch (error) {
            console.error('Error setting directory:', error);
            alert(error?.response?.data?.message || 'Error setting directory');
        }
    };

    const handleBackup = async () => {
        try {
            const response = await axios.post('http://localhost:5053/admin/backup');
            alert(response.data.message);
        } catch (error) {
            console.error('Error during backup:', error);
            alert(error?.response?.data?.message || 'Error during backup');
        }
    };

    const handleRestore = async () => {
        if (!timestamp || !filename || !databaseName) {
            alert('Please enter a valid timestamp, BSON filename, and database name.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5053/admin/restore', {
                timestamp,
                filename,
                databaseName,
            });
            alert(response.data.message);
        } catch (error) {
            console.error('Restore failed:', error);
            alert(error?.response?.data?.message || 'Restore failed.');
        }
    };

    return (
        <CContainer>
            <CRow className="mb-4">
                <CCol>
                    <CForm>
                        <CFormLabel>Set Backup Directory</CFormLabel>
                        <CFormInput
                            type="text"
                            placeholder="Enter directory path"
                            value={directory}
                            onChange={(e) => setDirectory(e.target.value)}
                        />
                        <CButton className="mt-2" onClick={handleSetDirectory}>
                            Set Directory
                        </CButton>
                    </CForm>
                </CCol>
            </CRow>
            <CRow>
                <CCol>
                    <CButton color="primary" onClick={handleBackup}>
                        Backup Database
                    </CButton>
                </CCol>
                <CCol>
                    <CForm>
                        <CFormLabel>Restore Database</CFormLabel>
                        <CFormInput
                            type="text"
                            placeholder="Enter Backup Timestamp (e.g., 2025-01-22_08-33-12-PM)"
                            value={timestamp}
                            onChange={(e) => setTimestamp(e.target.value)}
                        />
                        <CFormInput
                            type="text"
                            placeholder="Enter Database Name (e.g., adminis)"
                            value={databaseName}
                            onChange={(e) => setDatabaseName(e.target.value)}
                        />
                        <CFormInput
                            type="text"
                            placeholder="Enter BSON File Name (e.g., users.bson)"
                            value={filename}
                            onChange={(e) => setFilename(e.target.value)}
                        />
                        <CButton className="mt-2" color="warning" onClick={handleRestore}>
                            Restore Specific Collection
                        </CButton>
                    </CForm>
                </CCol>
            </CRow>
        </CContainer>
    );
};

export default RecoveryPage;