import React, { useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';

import { 
    CContainer, CButton, CRow, CCol, CForm, CFormLabel, CFormInput, 
    CListGroup, CListGroupItem, CCard, CCardBody, CCardHeader, 
    CSpinner, CAlert 
} from '@coreui/react';
import axiosInstance from '../../../utils/axiosInstance';

const RecoveryPage = () => {
    const [directory, setDirectory] = useState('');
    const [backups, setBackups] = useState([]);
    const [selectedBackup, setSelectedBackup] = useState(null);
    const [databases, setDatabases] = useState([]);
    const [selectedDatabase, setSelectedDatabase] = useState(null);
    const [collections, setCollections] = useState([]);
    const [selectedCollection, setSelectedCollection] = useState(null);
    const [loading, setLoading] = useState(false);
    const [backupInProgress, setBackupInProgress] = useState(false);
    const [error, setError] = useState('');
    const [directorySet, setDirectorySet] = useState(false);
    const navigate = useNavigate()
    // Restore saved directory on component mount
    useEffect(() => {
        const savedDirectory = localStorage.getItem('backupDirectory');
        if (savedDirectory) {
            setDirectory(savedDirectory);
            setLoading(true);
            axiosInstance.post('/admin/set-directory', { directory: savedDirectory })
                .then(() => {
                    setDirectorySet(true);
                    fetchBackups();
                })
                .catch(() => setError('Could not restore saved directory. Please set it manually.'))
                .finally(() => setLoading(false));
        }
    }, []);

    // Fetch backups when directory is set
    useEffect(() => {
        if (directorySet) fetchBackups();
    }, [directorySet]);

    // Fetch databases when a backup is selected
    useEffect(() => {
        if (selectedBackup) fetchDatabases(selectedBackup);
        else setDatabases([]);
    }, [selectedBackup]);

    // Fetch collections when a database is selected
    useEffect(() => {
        if (selectedDatabase) fetchCollections(selectedBackup, selectedDatabase);
        else setCollections([]);
    }, [selectedDatabase, selectedBackup]);

    const fetchBackups = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axiosInstance.get('/admin/list-backups');
            setBackups(response.data.backups || []);
        } catch (error) {
            setError('Error fetching backups');
            setBackups([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchDatabases = async (backup) => {
        if (!backup) return;
    
        setLoading(true);
        setError('');
        try {
            const response = await axiosInstance.get(`/admin/list-collections/${backup.name}`);
            
            if (response.data.databases) {
                setDatabases(response.data.databases);
            } else {
                setDatabases([]);
                setError('No databases found in this backup.');
            }
        } catch (error) {
            console.error('Error fetching databases:', error);
            setError(error?.response?.data?.message || 'Error fetching databases');
            setDatabases([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchCollections = async (backup, database) => {
        if (!backup || !database) {
            setCollections([]);
            return;
        }
    
        setLoading(true);
        setError('');
        try {
            const response = await axiosInstance.get(`/admin/list-collections/${backup.name}?databaseName=${database}`);
    
            setCollections(response.data.collections || []);
        } catch (error) {
            setError('Error fetching collections');
            setCollections([]);
        } finally {
            setLoading(false);
        }
    };
    
    const handleSetDirectory = async () => {
        if (!directory) {
            setError('Please enter a directory.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await axiosInstance.post('/admin/set-directory', { directory });
            localStorage.setItem('backupDirectory', directory);
            setDirectorySet(true);
            fetchBackups();
        } catch (error) {
            setError('Error setting directory');
            setDirectorySet(false);
        } finally {
            setLoading(false);
        }
    };

    const handleBackup = async () => {
        setBackupInProgress(true);
        setError('');
        try {
            await axiosInstance.post('/admin/backup');
            fetchBackups();
        } catch (error) {
            setError('Error during backup');
        } finally {
            setBackupInProgress(false);
        }
    };

    const handleRestore = async () => {
        if (!selectedBackup || !selectedDatabase || !selectedCollection) {
            setError('Please select a backup, database, and collection.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await axiosInstance.post('/admin/restore', {
                timestamp: selectedBackup.name,
                filename: selectedCollection,
                databaseName: selectedDatabase,
            });
            alert('Restore successful!');
        } catch (error) {
            setError('Restore failed.');
        } finally {
            setLoading(false);
        }
    };
    const handlesched = async () => {
        navigate('/cron');  // Replace '/cron' with the correct route you want to navigate to
    };
    
    return (
        <CContainer>
            {error && <CAlert color="danger" className="mt-3">{error}</CAlert>}

            <CRow className="mb-4 mt-3">
                <CCol>
                    <CCard>
                    <CCardHeader className="d-flex justify-content-between align-items-center">
                        <div>Backup Configuration</div>
                        <CButton className="ms-auto"color='primary' onClick={handlesched}>Schedule Backup</CButton>
                    </CCardHeader>
                        <CCardBody>
                            <CForm>
                                <CFormLabel>Set Backup Directory</CFormLabel>
                                <div className="d-flex">
                                    <CFormInput type="text" placeholder="Enter directory path" value={directory} onChange={(e) => setDirectory(e.target.value)} />
                                    <CButton className="ms-2" onClick={handleSetDirectory} disabled={loading}>
                                        {loading ? <CSpinner size="sm" /> : 'Set Directory'}
                                    </CButton>
                                </div>
                            </CForm>
                            <CButton color="primary" className="mt-3" onClick={handleBackup} disabled={!directorySet || backupInProgress}>
                                {backupInProgress ? <><CSpinner size="sm" /> Creating Backup...</> : 'Create New Backup'}
                            </CButton>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>

            <CRow>
                <CCol md="4">
                    <CCard>
                        <CCardHeader>Available Backups</CCardHeader>
                        <CCardBody>
                            {loading ? <CSpinner /> : (
                                <CListGroup>
                                    {backups.map((backup) => (
                                        <CListGroupItem key={backup.name} active={selectedBackup?.name === backup.name} onClick={() => setSelectedBackup(backup)} style={{ cursor: 'pointer' }}>
                                            {backup.name}
                                        </CListGroupItem>
                                    ))}
                                </CListGroup>
                            )}
                        </CCardBody>
                    </CCard>
                </CCol>

                <CCol md="4">
                    <CCard>
                        <CCardHeader>Select Database</CCardHeader>
                        <CCardBody>
                            {loading ? <CSpinner /> : (
                                <CListGroup>
                                    {databases.map((db) => (
                                        <CListGroupItem key={db} active={selectedDatabase === db} onClick={() => setSelectedDatabase(db)} style={{ cursor: 'pointer' }}>
                                            {db}
                                        </CListGroupItem>
                                    ))}
                                </CListGroup>
                            )}
                        </CCardBody>
                    </CCard>
                </CCol>

                <CCol md="4">
                    <CCard>
                 <CCardHeader>Select Collection</CCardHeader>
<CCardBody>
    {loading ? <CSpinner /> : (
        <>
            {!selectedCollection ? (
                <CListGroup>
                    {collections.map((collection) => (
                        <CListGroupItem 
                            key={collection} 
                            onClick={() => setSelectedCollection(collection)} 
                            style={{ cursor: 'pointer' }}
                        >
                            {collection}
                        </CListGroupItem>
                    ))}
                </CListGroup>
            ) : (
                <div className="mb-3">
                    <h5>Selected Collection:</h5>
                    <div className="p-3 bg-light border rounded">
                        {selectedCollection}
                    </div>
                    <div className="d-flex mt-3">
                        <CButton 
                            color="warning" 
                            className="me-2" 
                            onClick={handleRestore}
                        >
                            Restore
                        </CButton>
                        <CButton 
                            color="secondary" 
                            onClick={() => setSelectedCollection(null)}
                        >
                            Change Collection
                        </CButton>
                    </div>
                </div>
            )}
        </>
    )}
</CCardBody>
                    </CCard>
                   
                </CCol>
            </CRow>
        </CContainer>
    );
};

export default RecoveryPage;