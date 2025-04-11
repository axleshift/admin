import React, { useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';

import { 
    CContainer, CButton, CRow, CCol, CForm, CFormLabel, CFormInput, 
    CListGroup, CListGroupItem, CCard, CCardBody, CCardHeader, 
    CSpinner, CAlert 
} from '@coreui/react';
import axiosInstance from '../../../utils/axiosInstance';
import logActivity from './../../../utils/activityLogger';

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
    const navigate = useNavigate();
    const userRole = localStorage.getItem('role');
    const userDepartment = localStorage.getItem('department');
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('name'); 

    const getUserInfo = () => {
        return {
            name: userName || 'Unknown User',
            role: userRole || 'Unknown Role',
            department: userDepartment || 'Unknown Department'
        };
    };

    useEffect(() => {
        fetchBackups();
    }, []);

    useEffect(() => {
        if (selectedBackup) {
            fetchDatabases(selectedBackup);

            const userInfo = getUserInfo();
            logActivity({
                ...userInfo,
                route: '/recovery',
                action: 'SELECT_BACKUP',
                description: `Selected backup: ${selectedBackup.name}`
            });
        } else setDatabases([]);
    }, [selectedBackup]);

    useEffect(() => {
        if (selectedDatabase && selectedBackup) {
            fetchCollections(selectedBackup, selectedDatabase);

            const userInfo = getUserInfo();
            logActivity({
                ...userInfo,
                route: '/recovery',
                action: 'SELECT_DATABASE',
                description: `Selected database: ${selectedDatabase} from backup: ${selectedBackup.name}`
            });
        } else setCollections([]);
    }, [selectedDatabase, selectedBackup]);

    const fetchBackups = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axiosInstance.get('/admin/list-backups');
            setBackups(response.data.backups || []);

            const userInfo = getUserInfo();
            logActivity({
                ...userInfo,
                route: '/recovery',
                action: 'FETCH_BACKUPS',
                description: `Retrieved ${response.data.backups?.length || 0} backups`
            });
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

                const userInfo = getUserInfo();
                logActivity({
                    ...userInfo,
                    route: '/recovery',
                    action: 'FETCH_DATABASES',
                    description: `Retrieved ${response.data.databases.length} databases from backup: ${backup.name}`
                });
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

            const userInfo = getUserInfo();
            logActivity({
                ...userInfo,
                route: '/recovery',
                action: 'FETCH_COLLECTIONS',
                description: `Retrieved ${response.data.collections?.length || 0} collections from database: ${database} in backup: ${backup.name}`
            });
        } catch (error) {
            setError('Error fetching collections');
            setCollections([]);
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

            const userInfo = getUserInfo();
            logActivity({
                ...userInfo,
                route: '/recovery',
                action: 'CREATE_BACKUP',
                description: `Created new backup`
            });
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

        if (!window.confirm(`Are you sure you want to restore collection "${selectedCollection}" from database "${selectedDatabase}"? This will replace the current data.`)) {
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

            const userInfo = getUserInfo();
            logActivity({
                ...userInfo,
                route: '/recovery',
                action: 'RESTORE_COLLECTION',
                description: `Restored collection: ${selectedCollection} from database: ${selectedDatabase} in backup: ${selectedBackup.name}`
            });

            alert('Restore successful!');
        } catch (error) {
            setError('Restore failed.');
        } finally {
            setLoading(false);
        }
    };

    const handlesched = async () => {
        const userInfo = getUserInfo();
        logActivity({
            ...userInfo,
            route: '/recovery',
            action: 'NAVIGATE_TO_SCHEDULER',
            description: 'Navigated to backup scheduler page'
        });

        navigate('/cron');
    };

    const handleSelectCollection = (collection) => {
        setSelectedCollection(collection);

        const userInfo = getUserInfo();
        logActivity({
            ...userInfo,
            route: '/recovery',
            action: 'SELECT_COLLECTION',
            description: `Selected collection: ${collection} from database: ${selectedDatabase} in backup: ${selectedBackup.name}`
        });
    };

    const handleChangeCollection = () => {
        const userInfo = getUserInfo();
        logActivity({
            ...userInfo,
            route: '/recovery',
            action: 'CHANGE_COLLECTION',
            description: `Changed selection from collection: ${selectedCollection}`
        });

        setSelectedCollection(null);
    };

    return (
        <CContainer>
            {error && <CAlert color="danger" className="mt-3">{error}</CAlert>}

            <CRow className="mb-4 mt-3">
                <CCol>
                    <CCard>
                        <CCardHeader className="d-flex justify-content-between align-items-center">
                            <div>Backup Configuration</div>
                            <CButton className="ms-auto" color='primary' onClick={handlesched}>Schedule Backup</CButton>
                        </CCardHeader>
                        <CCardBody>
                            <CButton 
                                color="primary" 
                                className="mt-3" 
                                onClick={handleBackup} 
                                disabled={backupInProgress}
                            >
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
                                <>
                                    {backups.length === 0 ? (
                                        <div className="text-center p-3">
                                            No backups available
                                        </div>
                                    ) : (
                                        <CListGroup>
                                            {backups.map((backup) => (
                                                <CListGroupItem 
                                                    key={backup.name} 
                                                    active={selectedBackup?.name === backup.name} 
                                                    onClick={() => setSelectedBackup(backup)} 
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {backup.name}
                                                    <small className="d-block text-muted">
                                                        {new Date(backup.created).toLocaleString()} - {Math.round(backup.size/1024/1024)}MB
                                                    </small>
                                                </CListGroupItem>
                                            ))}
                                        </CListGroup>
                                    )}
                                </>
                            )}
                        </CCardBody>
                    </CCard>
                </CCol>

                <CCol md="4">
                    <CCard>
                        <CCardHeader>Select Database</CCardHeader>
                        <CCardBody>
                            {loading ? <CSpinner /> : (
                                <>
                                    {!selectedBackup ? (
                                        <div className="text-center p-3">
                                            Select a backup first
                                        </div>
                                    ) : databases.length === 0 ? (
                                        <div className="text-center p-3">
                                            No databases found in this backup
                                        </div>
                                    ) : (
                                        <CListGroup>
                                            {databases.map((db) => (
                                                <CListGroupItem 
                                                    key={db} 
                                                    active={selectedDatabase === db}
                                                    onClick={() => setSelectedDatabase(db)} 
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {db}
                                                </CListGroupItem>
                                            ))}
                                        </CListGroup>
                                    )}
                                </>
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
                                    {!selectedDatabase ? (
                                        <div className="text-center p-3">
                                            Select a database first
                                        </div>
                                    ) : collections.length === 0 ? (
                                        <div className="text-center p-3">
                                            No collections found in this database
                                        </div>
                                    ) : selectedCollection ? (
                                        <div className="p-3">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <strong>{selectedCollection}</strong>
                                                <CButton 
                                                    color="link" 
                                                    onClick={handleChangeCollection}
                                                    size="sm"
                                                >
                                                    Change
                                                </CButton>
                                            </div>
                                        </div>
                                    ) : (
                                        <CListGroup>
                                            {collections.map((collection) => (
                                                <CListGroupItem 
                                                    key={collection} 
                                                    onClick={() => handleSelectCollection(collection)} 
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {collection}
                                                </CListGroupItem>
                                            ))}
                                        </CListGroup>
                                    )}
                                </>
                            )}
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>

            <CRow className="mt-4">
                <CCol>
                    <CCard>
                        <CCardHeader>Restore Options</CCardHeader>
                        <CCardBody>
                            <div className="mb-3">
                                {selectedBackup && (
                                    <div><strong>Selected Backup:</strong> {selectedBackup.name}</div>
                                )}
                                {selectedDatabase && (
                                    <div><strong>Selected Database:</strong> {selectedDatabase}</div>
                                )}
                                {selectedCollection && (
                                    <div><strong>Selected Collection:</strong> {selectedCollection}</div>
                                )}
                            </div>

                            {selectedBackup && selectedDatabase && selectedCollection ? (
                                <CButton 
                                    color="warning" 
                                    onClick={handleRestore}
                                    disabled={loading}
                                >
                                    {loading ? <><CSpinner size="sm" /> Restoring...</> : 'Restore Collection'}
                                </CButton>
                            ) : (
                                <div className="text-muted">
                                    Please select a backup, database, and collection to restore
                                </div>
                            )}
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
        </CContainer>
    );
};

export default RecoveryPage;
