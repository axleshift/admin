import React, { useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    CContainer, CButton, CRow, CCol, CForm, CFormLabel, CFormInput, 
    CListGroup, CListGroupItem, CCard, CCardBody, CCardHeader, 
    CSpinner, CAlert, CFormSelect, CInputGroup, CInputGroupText
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
    const [directorySet, setDirectorySet] = useState(false);
    const [serverInfo, setServerInfo] = useState({});
    const [directoryType, setDirectoryType] = useState('custom'); // 'custom', 'relative', 'absolute'
    const navigate = useNavigate();
    const userRole = sessionStorage.getItem('role');
    const userDepartment = sessionStorage.getItem('department');
    const userId = sessionStorage.getItem('userId');
    const userName = sessionStorage.getItem('name');
    
    // Predefined paths for CyberPanel environments
    const predefinedPaths = {
        relative: './storage/backups',
        absolute: '/home/backup/mongodb'
    };
    
    const getUserInfo = () => {
        return {
            name: userName || 'Unknown User',
            role: userRole || 'Unknown Role',
            department: userDepartment || 'Unknown Department'
        };
    };

    // Check if server has a default backup directory and fetch backups on component mount
    useEffect(() => {
        setLoading(true);
        axiosInstance.get('/admin/get-directory')
            .then(response => {
                if (response.data && response.data.directory) {
                    setDirectory(response.data.directory);
                    setDirectorySet(true);
                    
                    // Save to localStorage for future visits
                    localStorage.setItem('backupDirectory', response.data.directory);
                    
                    // Save server info if available
                    if (response.data.serverInfo) {
                        setServerInfo(response.data.serverInfo);
                    }
                    
                    // Set directoryType based on path format
                    if (response.data.directory.startsWith('./')) {
                        setDirectoryType('relative');
                    } else if (response.data.directory.startsWith('/')) {
                        setDirectoryType('absolute');
                    } else {
                        setDirectoryType('custom');
                    }
                    
                    const userInfo = getUserInfo();
                    logActivity({
                        ...userInfo,
                        route: '/recovery',
                        action: 'GET_SERVER_DIRECTORY',
                        description: `Retrieved server backup directory: ${response.data.directory}`
                    });
                    
                    // Fetch backups after getting directory
                    fetchBackups();
                } else {
                    // Try to use saved directory from localStorage if server doesn't have one set
                    const savedDirectory = localStorage.getItem('backupDirectory');
                    if (savedDirectory) {
                        setDirectory(savedDirectory);
                        handleSetDirectory(savedDirectory);
                    } else {
                        // Default to relative path for CyberPanel
                        setDirectoryType('relative');
                        setDirectory(predefinedPaths.relative);
                    }
                }
            })
            .catch(err => {
                console.error("Error fetching server directory:", err);
                // Try to use saved directory as fallback
                const savedDirectory = localStorage.getItem('backupDirectory');
                if (savedDirectory) {
                    setDirectory(savedDirectory);
                    handleSetDirectory(savedDirectory);
                } else {
                    // Default to relative path for CyberPanel
                    setDirectoryType('relative');
                    setDirectory(predefinedPaths.relative);
                }
            })
            .finally(() => setLoading(false));
    }, []);

    // Fetch backups when directorySet changes
    useEffect(() => {
        if (directorySet) fetchBackups();
    }, [directorySet]);

    // Fetch databases when selectedBackup changes
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
        }
        else setDatabases([]);
    }, [selectedBackup]);

    // Fetch collections when selectedDatabase changes
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
        }
        else setCollections([]);
    }, [selectedDatabase, selectedBackup]);

    // Update directory when directoryType changes
    useEffect(() => {
        if (directoryType === 'relative') {
            setDirectory(predefinedPaths.relative);
        } else if (directoryType === 'absolute') {
            setDirectory(predefinedPaths.absolute);
        }
    }, [directoryType]);

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
                description: `Retrieved ${response.data.backups?.length || 0} backups from directory: ${directory}`
            });
        } catch (error) {
            setError('Error fetching backups: ' + (error.response?.data?.message || error.message));
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
            setError('Error fetching collections: ' + (error.response?.data?.message || error.message));
            setCollections([]);
        } finally {
            setLoading(false);
        }
    };
    
    const handleSetDirectory = async (dirPath = null) => {
        const directoryToSet = dirPath || directory;
        
        if (!directoryToSet) {
            setError('Please enter a directory.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const response = await axiosInstance.post('/admin/set-directory', { directory: directoryToSet });
            
            // If there's a response with a directory, use that (server might have normalized the path)
            if (response.data && response.data.directory) {
                setDirectory(response.data.directory);
            } else {
                setDirectory(directoryToSet);
            }
            
            localStorage.setItem('backupDirectory', directoryToSet);
            setDirectorySet(true);
            fetchBackups();
            
            const userInfo = getUserInfo();
            logActivity({
                ...userInfo,
                route: '/recovery',
                action: 'SET_DIRECTORY',
                description: `Set backup directory to: ${directoryToSet}`
            });
        } catch (error) {
            setError('Error setting directory: ' + (error.response?.data?.message || error.message));
            setDirectorySet(false);
        } finally {
            setLoading(false);
        }
    };

    const handleBackup = async () => {
        setBackupInProgress(true);
        setError('');
        try {
            const response = await axiosInstance.post('/admin/backup');
            fetchBackups();
            
            const userInfo = getUserInfo();
            logActivity({
                ...userInfo,
                route: '/recovery',
                action: 'CREATE_BACKUP',
                description: `Created new backup in directory: ${directory}`
            });
        } catch (error) {
            setError('Error during backup: ' + (error.response?.data?.message || error.message));
        } finally {
            setBackupInProgress(false);
        }
    };

    const handleRestore = async () => {
        if (!selectedBackup || !selectedDatabase || !selectedCollection) {
            setError('Please select a backup, database, and collection.');
            return;
        }

        // Show confirmation dialog
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
            setError('Restore failed: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };
    
    const handleDeleteBackup = async (backup) => {
        if (!window.confirm(`Are you sure you want to delete backup "${backup.name}"? This action cannot be undone.`)) {
            return;
        }
        
        setLoading(true);
        setError('');
        try {
            await axiosInstance.delete(`/admin/delete-backup/${backup.name}`);
            fetchBackups(); // Refresh the list
            
            if (selectedBackup?.name === backup.name) {
                setSelectedBackup(null);
                setDatabases([]);
                setCollections([]);
                setSelectedDatabase(null);
                setSelectedCollection(null);
            }
            
            const userInfo = getUserInfo();
            logActivity({
                ...userInfo,
                route: '/recovery',
                action: 'DELETE_BACKUP',
                description: `Deleted backup: ${backup.name}`
            });
        } catch (error) {
            setError('Failed to delete backup: ' + (error.response?.data?.message || error.message));
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
                            <CForm>
                                <CRow className="mb-3">
                                    <CCol md="3">
                                        <CFormLabel>Directory Type</CFormLabel>
                                        <CFormSelect 
                                            value={directoryType}
                                            onChange={(e) => setDirectoryType(e.target.value)}
                                            disabled={loading}
                                        >
                                            <option value="relative">Application Relative (Recommended for CyberPanel)</option>
                                            <option value="absolute">Server Absolute Path</option>
                                            <option value="custom">Custom Path</option>
                                        </CFormSelect>
                                    </CCol>
                                    <CCol md="9">
                                        <CFormLabel>Backup Directory</CFormLabel>
                                        <CInputGroup>
                                            {directoryType === 'relative' && (
                                                <CInputGroupText>
                                                    {serverInfo.currentWorkingDir || 'app root'}/
                                                </CInputGroupText>
                                            )}
                                            <CFormInput 
                                                type="text" 
                                                placeholder={directoryType === 'relative' ? './storage/backups' : '/path/to/backups'} 
                                                value={directory} 
                                                onChange={(e) => setDirectory(e.target.value)}
                                                disabled={loading || directoryType !== 'custom'} 
                                            />
                                            <CButton 
                                                onClick={() => handleSetDirectory()} 
                                                disabled={loading}
                                            >
                                                {loading ? <CSpinner size="sm" /> : 'Set Directory'}
                                            </CButton>
                                        </CInputGroup>
                                        {directorySet && (
                                            <small className="text-muted mt-1">
                                                Using directory: {directory}
                                            </small>
                                        )}
                                    </CCol>
                                </CRow>
                                
                                {Object.keys(serverInfo).length > 0 && (
                                    <CAlert color="info" className="mt-3 small">
                                        <strong>Server Information:</strong><br/>
                                        Running as user: {serverInfo.processUser}<br/>
                                        Platform: {serverInfo.serverPlatform}<br/>
                                        Node version: {serverInfo.nodeVersion}<br/>
                                        Working directory: {serverInfo.currentWorkingDir}
                                    </CAlert>
                                )}
                                
                                <CButton 
                                    color="primary" 
                                    className="mt-3" 
                                    onClick={handleBackup} 
                                    disabled={!directorySet || backupInProgress}
                                >
                                    {backupInProgress ? <><CSpinner size="sm" /> Creating Backup...</> : 'Create New Backup'}
                                </CButton>
                            </CForm>
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
                                                    className="d-flex justify-content-between align-items-center"
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <div onClick={() => setSelectedBackup(backup)} className="flex-grow-1">
                                                        {backup.name}
                                                        <small className="d-block text-muted">
                                                            {new Date(backup.created).toLocaleString()} - {Math.round(backup.size/1024/1024)}MB
                                                        </small>
                                                    </div>
                                                    <CButton 
                                                        color="danger" 
                                                        size="sm" 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteBackup(backup);
                                                        }}
                                                        disabled={loading}
                                                    >
                                                        Delete
                                                    </CButton>
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