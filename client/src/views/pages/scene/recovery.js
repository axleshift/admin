import React, { useState, useEffect } from 'react';
import { 
    CContainer, CButton, CRow, CCol, CForm, CFormLabel, CFormInput, 
    CListGroup, CListGroupItem, CCard, CCardBody, CCardHeader, 
    CSpinner, CAlert 
} from '@coreui/react';
import axios from 'axios';

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

    // Restore saved directory on component mount
    useEffect(() => {
        const savedDirectory = localStorage.getItem('backupDirectory');
        if (savedDirectory) {
            setDirectory(savedDirectory);
            setLoading(true);
            axios.post('http://localhost:5053/admin/set-directory', { directory: savedDirectory })
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
    }, [selectedDatabase]);

    const fetchBackups = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get('http://localhost:5053/admin/list-backups');
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
            const response = await axios.get(`http://localhost:5053/admin/list-collections/${backup.name}`);
            
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
            // ✅ Correct API request format
            const response = await axios.get(`http://localhost:5053/admin/list-collections/${backup.name}?databaseName=${database}`);
    
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
            await axios.post('http://localhost:5053/admin/set-directory', { directory });
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
            await axios.post('http://localhost:5053/admin/backup');
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
            await axios.post('http://localhost:5053/admin/restore', {
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

    return (
        <CContainer>
            {error && <CAlert color="danger" className="mt-3">{error}</CAlert>}

            <CRow className="mb-4 mt-3">
                <CCol>
                    <CCard>
                        <CCardHeader>Backup Configuration</CCardHeader>
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
                                <CListGroup>
                                    {collections.map((collection) => (
                                        <CListGroupItem key={collection} active={selectedCollection === collection} onClick={() => setSelectedCollection(collection)} style={{ cursor: 'pointer' }}>
                                            {collection}
                                        </CListGroupItem>
                                    ))}
                                </CListGroup>
                            )}
                        </CCardBody>
                    </CCard>
                    <CButton color="warning" className="mt-3" onClick={handleRestore} disabled={!selectedCollection}>Restore</CButton>
                </CCol>
            </CRow>
        </CContainer>
    );
};

export default RecoveryPage;
