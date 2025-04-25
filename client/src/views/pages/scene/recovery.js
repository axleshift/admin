import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    CContainer, CButton, CRow, CCol, CListGroup, CListGroupItem, 
    CCard, CCardBody, CCardHeader, CSpinner, CAlert 
} from '@coreui/react';
import axiosInstance from '../../../utils/axiosInstance';
import logActivity from './../../../utils/activityLogger';

const RecoveryPage = () => {
    const [backups, setBackups] = useState([]);
    const [selectedBackup, setSelectedBackup] = useState(null);
    const [collections, setCollections] = useState([]);
    const [selectedCollection, setSelectedCollection] = useState(null);
    const [loading, setLoading] = useState(false);
    const [backupInProgress, setBackupInProgress] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const userName = localStorage.getItem('name'); 

    const getUserInfo = () => ({
        name: userName || 'Unknown User',
    });

    useEffect(() => {
        fetchBackups();
    }, []);

    useEffect(() => {
        if (selectedBackup) {
            fetchCollections(selectedBackup);

            const userInfo = getUserInfo();
            logActivity({
                ...userInfo,
                route: '/recovery',
                action: 'SELECT_BACKUP',
                description: `Selected backup: ${selectedBackup.name}`
            });
        } else {
            setCollections([]);
        }
    }, [selectedBackup]);

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

    const fetchCollections = async (backup) => {
        if (!backup) return;

        setLoading(true);
        setError('');
        try {
            const response = await axiosInstance.get(`/admin/list-collections/${backup.name}`);
            setCollections(response.data.collections || []);
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
        if (!selectedBackup || !selectedCollection) {
          setError('Please select a backup and collection.');
          return;
        }
      
        if (!window.confirm(`Are you sure you want to restore collection "${selectedCollection}"? This will replace the current data.`)) {
          return;
        }
      
        setLoading(true);
        setError('');
        try {
          // Hardcoded database name
          const databaseName = 'adminis';
      
          await axiosInstance.post('/admin/restore', {
            timestamp: selectedBackup.name,
            filename: selectedCollection,
            databaseName, // Pass the hardcoded database name
          });
      
          const userInfo = getUserInfo();
          logActivity({
            ...userInfo,
            route: '/recovery',
            action: 'RESTORE_COLLECTION',
            description: `Restored collection: ${selectedCollection} from backup: ${selectedBackup.name}`
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
                <CCol md="6">
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

                <CCol md="6">
                    <CCard>
                        <CCardHeader>Select Collection</CCardHeader>
                        <CCardBody>
                            {loading ? <CSpinner /> : (
                                <>
                                    {!selectedBackup ? (
                                        <div className="text-center p-3">
                                            Select a backup first
                                        </div>
                                    ) : collections.length === 0 ? (
                                        <div className="text-center p-3">
                                            No collections found in this backup
                                        </div>
                                    ) : (
                                        <CListGroup>
                                            {collections.map((collection) => (
                                                <CListGroupItem 
                                                    key={collection} 
                                                    onClick={() => setSelectedCollection(collection)} 
                                                    active={selectedCollection === collection}
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
                                {selectedCollection && (
                                    <div><strong>Selected Collection:</strong> {selectedCollection}</div>
                                )}
                            </div>

                            {selectedBackup && selectedCollection ? (
                                <CButton 
                                    color="warning" 
                                    onClick={handleRestore}
                                    disabled={loading}
                                >
                                    {loading ? <><CSpinner size="sm" /> Restoring...</> : 'Restore Collection'}
                                </CButton>
                            ) : (
                                <div className="text-muted">
                                    Please select a backup and collection to restore
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