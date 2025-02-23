import React, { useState } from 'react';
import {
    CContainer,
    CButton,
    CRow,
    CCol,
    CForm,
    CFormLabel,
    CFormInput,
    CCard,
    CCardHeader,
    CCardBody,
    CCardTitle,
    CCardText,
    CSpinner,
    CAlert
} from '@coreui/react';
import axios from 'axios';

const RecoveryPage = () => {
    const [directory, setDirectory] = useState('');
    const [timestamp, setTimestamp] = useState('');
    const [databaseName, setDatabaseName] = useState('');
    const [filename, setFilename] = useState('');
    const [loading, setLoading] = useState({
        directory: false,
        backup: false,
        restore: false
    });
    const [status, setStatus] = useState({
        message: '',
        type: '', // 'success' or 'danger'
        visible: false
    });

    const showStatus = (message, type) => {
        setStatus({ message, type, visible: true });
        setTimeout(() => setStatus(prev => ({ ...prev, visible: false })), 5000);
    };

    const handleSetDirectory = async () => {
        if (!directory) {
            showStatus('Please enter a directory.', 'danger');
            return;
        }

        setLoading(prev => ({ ...prev, directory: true }));
        try {
            const response = await axios.post('http://localhost:5053/admin/set-directory', { directory });
            showStatus(response.data.message, 'success');
        } catch (error) {
            showStatus(error?.response?.data?.message || 'Error setting directory', 'danger');
        } finally {
            setLoading(prev => ({ ...prev, directory: false }));
        }
    };

    const handleBackup = async () => {
        setLoading(prev => ({ ...prev, backup: true }));
        try {
            const response = await axios.post('http://localhost:5053/admin/backup');
            showStatus(response.data.message, 'success');
        } catch (error) {
            showStatus(error?.response?.data?.message || 'Error during backup', 'danger');
        } finally {
            setLoading(prev => ({ ...prev, backup: false }));
        }
    };

    const handleRestore = async () => {
        if (!timestamp || !filename || !databaseName) {
            showStatus('Please fill in all restore fields.', 'danger');
            return;
        }

        setLoading(prev => ({ ...prev, restore: true }));
        try {
            const response = await axios.post('http://localhost:5053/admin/restore', {
                timestamp,
                filename,
                databaseName,
            });
            showStatus(response.data.message, 'success');
        } catch (error) {
            showStatus(error?.response?.data?.message || 'Restore failed.', 'danger');
        } finally {
            setLoading(prev => ({ ...prev, restore: false }));
        }
    };

    return (
        <CContainer className="py-4">
            {status.visible && (
                <CAlert color={status.type} dismissible>
                    {status.message}
                </CAlert>
            )}

            <CRow className="mb-4">
                <CCol>
                    <CCard>
                        <CCardHeader>
                            <CCardTitle>Backup Directory Configuration</CCardTitle>
                        </CCardHeader>
                        <CCardBody>
                            <CCardText>Set the directory where database backups will be stored</CCardText>
                            <CForm>
                                <CFormLabel htmlFor="directory">Backup Directory Path</CFormLabel>
                                <div className="d-flex gap-2">
                                    <CFormInput
                                        id="directory"
                                        type="text"
                                        placeholder="/path/to/backup/directory"
                                        value={directory}
                                        onChange={(e) => setDirectory(e.target.value)}
                                    />
                                    <CButton 
                                        color="primary"
                                        onClick={handleSetDirectory}
                                        disabled={loading.directory}
                                        style={{ minWidth: '120px' }}
                                    >
                                        {loading.directory ? (
                                            <CSpinner size="sm" />
                                        ) : (
                                            'Set Directory'
                                        )}
                                    </CButton>
                                </div>
                            </CForm>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>

            <CRow className="g-4">
                <CCol md={6}>
                    <CCard>
                        <CCardHeader>
                            <CCardTitle>Backup Database</CCardTitle>
                        </CCardHeader>
                        <CCardBody>
                            <CCardText>Create a new backup of the current database state</CCardText>
                            <CButton 
                                color="primary"
                                onClick={handleBackup}
                                disabled={loading.backup}
                                className="w-100"
                            >
                                {loading.backup ? (
                                    <CSpinner size="sm" />
                                ) : (
                                    'Create Backup'
                                )}
                            </CButton>
                        </CCardBody>
                    </CCard>
                </CCol>

                <CCol md={6}>
                    <CCard>
                        <CCardHeader>
                            <CCardTitle>Restore Database</CCardTitle>
                        </CCardHeader>
                        <CCardBody>
                            <CCardText>Restore a specific collection from a backup</CCardText>
                            <CForm>
                                <div className="mb-3">
                                    <CFormLabel htmlFor="timestamp">Backup Timestamp</CFormLabel>
                                    <CFormInput
                                        id="timestamp"
                                        type="text"
                                        placeholder="2025-01-22_08-33-12-PM"
                                        value={timestamp}
                                        onChange={(e) => setTimestamp(e.target.value)}
                                    />
                                </div>
                                <div className="mb-3">
                                    <CFormLabel htmlFor="database">Database Name</CFormLabel>
                                    <CFormInput
                                        id="database"
                                        type="text"
                                        placeholder="adminis"
                                        value={databaseName}
                                        onChange={(e) => setDatabaseName(e.target.value)}
                                    />
                                </div>
                                <div className="mb-3">
                                    <CFormLabel htmlFor="filename">BSON Filename</CFormLabel>
                                    <CFormInput
                                        id="filename"
                                        type="text"
                                        placeholder="users.bson"
                                        value={filename}
                                        onChange={(e) => setFilename(e.target.value)}
                                    />
                                </div>
                                <CButton 
                                    color="warning"
                                    onClick={handleRestore}
                                    disabled={loading.restore}
                                    className="w-100"
                                >
                                    {loading.restore ? (
                                        <CSpinner size="sm" />
                                    ) : (
                                        'Restore Collection'
                                    )}
                                </CButton>
                            </CForm>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
        </CContainer>
    );
};

export default RecoveryPage;