import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../utils/axiosInstance';
import { useSelector } from 'react-redux';
import { useColorModes } from '@coreui/react';
import { 
  CCard, 
  CCardBody, 
  CCardHeader, 
  CTable, 
  CTableHead, 
  CTableRow, 
  CTableHeaderCell, 
  CTableBody, 
  CTableDataCell,
  CSpinner,
  CBadge,
  CTooltip,
  CCardTitle,
  CCardFooter,
  CContainer,
  CRow,
  CCol,
  CButton
} from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faExclamationCircle, 
  faHistory, 
  faSync, 
  faUser, 
  faUserTag, 
  faBuilding, 
  faRoute, 
  faRunning, 
  faInfoCircle, 
  faClock,
  faFileDownload
} from '@fortawesome/free-solid-svg-icons';

const ActivityTracker = () => {
    const [activities, setActivities] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    // Get current theme from Redux store
    const currentTheme = useSelector((state) => state.changeState.theme);
    
    // Use the useColorModes hook 
    const { colorMode } = useColorModes("coreui-free-react-admin-template-theme");
    
    // Determine dark mode from both sources
    const isDarkMode = currentTheme === 'dark' || colorMode === 'dark';

    const fetchActivities = () => {
        setLoading(true);
        setError(null);
        axiosInstance.get('/general/log')
            .then(response => {
                setActivities(response.data);
                setLoading(false);
            })
            .catch(error => {
                setError(error.message);
                setLoading(false);
            });
    };

    const handleRefresh = () => {
        setRefreshing(true);
        axiosInstance.get('/general/log')
            .then(response => {
                setActivities(response.data);
                setRefreshing(false);
            })
            .catch(error => {
                setError(error.message);
                setRefreshing(false);
            });
    };

    useEffect(() => {
        fetchActivities();
    }, []);

    // Style for the title in dark mode
    const titleStyle = isDarkMode ? { color: '#FFFFFF' } : {}; // Bright purple in dark mode

    // Helper function to get badge color based on action type
    const getBadgeColor = (action) => {
        const actionMap = {
            'CREATE': 'success',
            'UPDATE': 'primary',
            'DELETE': 'danger',
            'RESTORE': 'warning',
            'SELECT': 'info',
            'FETCH': isDarkMode ? 'light' : 'secondary', // Improved for dark mode
            'NAVIGATE': isDarkMode ? 'light' : 'secondary', // Improved for dark mode
            'AUTO': isDarkMode ? 'light' : 'dark',
            'SET': 'info'
        };

        // Look for partial matches in the action string
        for (const [key, value] of Object.entries(actionMap)) {
            if (action && action.includes(key)) {
                return value;
            }
        }
        return isDarkMode ? 'light' : 'secondary'; // Better default for dark mode
    };

    // Format relative time
    const getRelativeTime = (timestamp) => {
        const now = new Date();
        const past = new Date(timestamp);
        const diffInSeconds = Math.floor((now - past) / 1000);
        
        if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        return `${Math.floor(diffInSeconds / 86400)} days ago`;
    };

    if (error) {
        return (
            <CContainer className="mt-4">
                <CCard className={`text-center border-danger ${isDarkMode ? 'bg-dark text-white' : ''}`}>
                    <CCardHeader className="bg-danger text-white">
                        <FontAwesomeIcon icon={faExclamationCircle} className="me-2" /> Error
                    </CCardHeader>
                    <CCardBody>
                        <p className="mb-0">{error}</p>
                        <CButton 
                            color="primary" 
                            className="mt-3"
                            onClick={fetchActivities}
                        >
                            <FontAwesomeIcon icon={faSync} className="me-2" /> Try Again
                        </CButton>
                    </CCardBody>
                </CCard>
            </CContainer>
        );
    }

    return (
        <CContainer fluid className="p-4">
            <CCard className={`shadow-sm ${isDarkMode ? 'bg-dark text-white' : ''}`}>
                <CCardHeader className={`d-flex justify-content-between align-items-center ${isDarkMode ? 'bg-dark text-white border-secondary' : 'bg-light'}`}>
                    <div>
                        <FontAwesomeIcon icon={faHistory} className="me-2 text-primary" />
                        <CCardTitle 
                            className="d-inline mb-0"
                            style={titleStyle} // Apply purple color in dark mode
                        >
                            Activity Tracker
                        </CCardTitle>
                    </div>
                    <div>
                        <CButton 
                            color={isDarkMode ? "light" : "light"} 
                            size="sm" 
                            className={`me-2 ${isDarkMode ? 'text-dark' : ''}`}
                            onClick={handleRefresh}
                            disabled={refreshing}
                        >
                            <FontAwesomeIcon icon={faSync} spin={refreshing} className="me-1" />
                            {refreshing ? 'Refreshing...' : 'Refresh'}
                        </CButton>
                        <CButton 
                            color={isDarkMode ? "light" : "secondary"} 
                            size="sm"
                            className={isDarkMode ? 'text-dark' : ''}
                        >
                            <FontAwesomeIcon icon={faFileDownload} className="me-1" />
                            Export
                        </CButton>
                    </div>
                </CCardHeader>
                <CCardBody>
                    {loading ? (
                        <div className="text-center p-5">
                            <CSpinner color="primary" />
                            <p className={`mt-2 ${isDarkMode ? 'text-light' : 'text-muted'}`}>Loading activity data...</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <CTable hover striped responsive className={`border ${isDarkMode ? 'table-dark' : ''}`}>
                                <CTableHead className={isDarkMode ? "bg-dark text-white border-secondary" : "bg-light"}>
                                    <CTableRow>
                                        <CTableHeaderCell className="text-nowrap">
                                            <FontAwesomeIcon icon={faUser} className={`me-2 ${isDarkMode ? 'text-white' : 'text-muted'}`} />
                                            User
                                        </CTableHeaderCell>
                                        <CTableHeaderCell className="text-nowrap">
                                            <FontAwesomeIcon icon={faUserTag} className={`me-2 ${isDarkMode ? 'text-white' : 'text-muted'}`} />
                                            Role
                                        </CTableHeaderCell>
                                        <CTableHeaderCell className="text-nowrap">
                                            <FontAwesomeIcon icon={faBuilding} className={`me-2 ${isDarkMode ? 'text-white' : 'text-muted'}`} />
                                            Department
                                        </CTableHeaderCell>
                                        <CTableHeaderCell className="text-nowrap">
                                            <FontAwesomeIcon icon={faRoute} className={`me-2 ${isDarkMode ? 'text-white' : 'text-muted'}`} />
                                            Route
                                        </CTableHeaderCell>
                                        <CTableHeaderCell className="text-nowrap">
                                            <FontAwesomeIcon icon={faRunning} className={`me-2 ${isDarkMode ? 'text-white' : 'text-muted'}`} />
                                            Action
                                        </CTableHeaderCell>
                                        <CTableHeaderCell className="text-nowrap">
                                            <FontAwesomeIcon icon={faInfoCircle} className={`me-2 ${isDarkMode ? 'text-white' : 'text-muted'}`} />
                                            Description
                                        </CTableHeaderCell>
                                        <CTableHeaderCell className="text-nowrap">
                                            <FontAwesomeIcon icon={faClock} className={`me-2 ${isDarkMode ? 'text-white' : 'text-muted'}`} />
                                            Time
                                        </CTableHeaderCell>
                                    </CTableRow>
                                </CTableHead>
                                <CTableBody>
                                    {activities.length === 0 ? (
                                        <CTableRow>
                                            <CTableDataCell colSpan={7} className={`text-center p-5 ${isDarkMode ? 'text-white' : 'text-muted'}`}>
                                                No activity records found
                                            </CTableDataCell>
                                        </CTableRow>
                                    ) : (
                                        activities.map(activity => (
                                            <CTableRow key={activity._id} className="align-middle">
                                                <CTableDataCell className="font-weight-bold">
                                                    {activity.name || 'Unknown'}
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <CBadge color={isDarkMode ? "light" : "dark"} shape="rounded-pill" className={`px-2 py-1 ${isDarkMode ? 'text-dark' : ''}`}>
                                                        {activity.role || 'Unknown'}
                                                    </CBadge>
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    {activity.department || 'Unknown'}
                                                </CTableDataCell>
                                                <CTableDataCell className={isDarkMode ? "text-info" : "text-primary"}>
                                                    {activity.route}
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <CBadge 
                                                        color={getBadgeColor(activity.action)} 
                                                        shape="rounded-pill"
                                                        className={getBadgeColor(activity.action) === 'light' ? 'text-dark' : ''}
                                                    >
                                                        {activity.action}
                                                    </CBadge>
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <CTooltip content={activity.description} placement="bottom">
                                                        <div className="text-truncate" style={{ maxWidth: '200px' }}>
                                                            {activity.description}
                                                        </div>
                                                    </CTooltip>
                                                </CTableDataCell>
                                                <CTableDataCell className="text-nowrap">
                                                    <CTooltip content={new Date(activity.timestamp).toLocaleString()}>
                                                        <span>
                                                            {getRelativeTime(activity.timestamp)}
                                                        </span>
                                                    </CTooltip>
                                                </CTableDataCell>
                                            </CTableRow>
                                        ))
                                    )}
                                </CTableBody>
                            </CTable>
                        </div>
                    )}
                </CCardBody>
                <CCardFooter className={`${isDarkMode ? 'bg-dark text-white border-secondary' : 'bg-light text-muted'}`}>
                    <CRow>
                        <CCol>
                            <small>Showing {activities.length} activities</small>
                        </CCol>
                        <CCol className="text-end">
                            <small>Last updated: {new Date().toLocaleString()}</small>
                        </CCol>
                    </CRow>
                </CCardFooter>
            </CCard>
        </CContainer>
    );
};

export default ActivityTracker;