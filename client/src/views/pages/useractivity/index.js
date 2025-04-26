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
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CCollapse,
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
  CPagination,
  CPaginationItem
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
  faFileDownload,
  faRobot,
  faChartLine,
  faShieldAlt,
  faExclamationTriangle,
  faCheckCircle,
  faEye
} from '@fortawesome/free-solid-svg-icons';

const ActivityTracker = () => {
    const [activities, setActivities] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [showAIModal, setShowAIModal] = useState(false);
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [activitiesPerPage] = useState(20);
    const [totalPages, setTotalPages] = useState(1);
    
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
                setTotalPages(Math.ceil(response.data.length / activitiesPerPage));
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
                setTotalPages(Math.ceil(response.data.length / activitiesPerPage));
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

    // Function to view AI analysis
    const viewAIAnalysis = (activity) => {
        setSelectedActivity(activity);
        setShowAIModal(true);
    };

    // Get current activities for pagination
    const indexOfLastActivity = currentPage * activitiesPerPage;
    const indexOfFirstActivity = indexOfLastActivity - activitiesPerPage;
    const currentActivities = activities.slice(indexOfFirstActivity, indexOfLastActivity);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Function to generate pagination items
    const generatePaginationItems = () => {
        const items = [];
        const maxPagesToShow = 5; // Show 5 page numbers at a time
        
        // Always show first page
        items.push(
            <CPaginationItem 
                key="first" 
                active={currentPage === 1}
                onClick={() => paginate(1)}
            >
                1
            </CPaginationItem>
        );
        
        let startPage = Math.max(2, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 2);
        
        // Adjust if we're near the end
        if (endPage - startPage < maxPagesToShow - 2) {
            startPage = Math.max(2, endPage - (maxPagesToShow - 2));
        }
        
        // Add ellipsis after first page if needed
        if (startPage > 2) {
            items.push(<CPaginationItem key="ellipsis1" disabled>...</CPaginationItem>);
        }
        
        // Add middle pages
        for (let i = startPage; i <= endPage; i++) {
            items.push(
                <CPaginationItem 
                    key={i} 
                    active={currentPage === i}
                    onClick={() => paginate(i)}
                >
                    {i}
                </CPaginationItem>
            );
        }
        
        // Add ellipsis before last page if needed
        if (endPage < totalPages - 1) {
            items.push(<CPaginationItem key="ellipsis2" disabled>...</CPaginationItem>);
        }
        
        // Always show last page if there's more than one page
        if (totalPages > 1) {
            items.push(
                <CPaginationItem 
                    key="last" 
                    active={currentPage === totalPages}
                    onClick={() => paginate(totalPages)}
                >
                    {totalPages}
                </CPaginationItem>
            );
        }
        
        return items;
    };

    // IMPROVED: Parse AI analysis to handle both string and object formats
    const parseAIAnalysis = (analysis) => {
        // Default values
        const defaultResult = { 
            category: 'General activity', 
            patterns: 'No unusual patterns detected', 
            risk: 'MEDIUM' // Default to MEDIUM instead of UNKNOWN
        };
        
        // If there's no analysis, return defaults
        if (!analysis) return defaultResult;
        
        // If aiStructuredAnalysis is available, use it directly
        if (typeof analysis === 'object' && analysis !== null) {
            // Check if it has the expected properties
            if (analysis.category && analysis.patterns && analysis.riskLevel) {
                return { 
                    category: analysis.category, 
                    patterns: analysis.patterns, 
                    // Convert UNKNOWN to MEDIUM
                    risk: analysis.riskLevel === 'UNKNOWN' ? 'MEDIUM' : analysis.riskLevel 
                };
            }
            
            // For database objects with aiStructuredAnalysis
            if (analysis.aiStructuredAnalysis) {
                const structuredData = analysis.aiStructuredAnalysis;
                return {
                    category: structuredData.category || defaultResult.category,
                    patterns: structuredData.patterns || defaultResult.patterns,
                    risk: structuredData.riskLevel === 'UNKNOWN' ? 'MEDIUM' : structuredData.riskLevel || defaultResult.risk
                };
            }
        }
        
        // If it's a string or doesn't have the right properties, try to parse it
        const analysisText = typeof analysis === 'string' ? analysis : JSON.stringify(analysis);
        
        if (!analysisText) return defaultResult;
        
        try {
            // Try parsing it as JSON first
            const parsedAnalysis = JSON.parse(analysisText);
            if (parsedAnalysis.category && parsedAnalysis.patterns && parsedAnalysis.riskLevel) {
                return {
                    category: parsedAnalysis.category,
                    patterns: parsedAnalysis.patterns,
                    risk: parsedAnalysis.riskLevel === 'UNKNOWN' ? 'MEDIUM' : parsedAnalysis.riskLevel
                };
            }
        } catch (e) {
            // Not valid JSON, proceed with text extraction
        }
        
        // Extract risk level from text
        let riskLevel = 'MEDIUM'; // Default to MEDIUM instead of UNKNOWN
        const riskMatch = analysisText.match(/risk(?:\s*level|\s*assessment)?:?\s*(low|medium|high|unknown)/i);
        if (riskMatch) {
            riskLevel = riskMatch[1].toUpperCase();
            // Convert UNKNOWN to MEDIUM
            if (riskLevel === 'UNKNOWN') riskLevel = 'MEDIUM';
        }
        
        // Try to extract category section
        let category = defaultResult.category;
        const categoryMatch = analysisText.match(/categor(?:y|ization):?\s*([^.]+)/i);
        if (categoryMatch) category = categoryMatch[1].trim();
        
        // Try to extract patterns section
        let patterns = defaultResult.patterns;
        const patternsMatch = analysisText.match(/patterns:?\s*([^.]+)/i) || 
                            analysisText.match(/unusual patterns:?\s*([^.]+)/i);
        if (patternsMatch) patterns = patternsMatch[1].trim();
        
        return { category, patterns, risk: riskLevel };
    };

    // Get risk badge color with improved handling for UNKNOWN case
    const getRiskBadgeColor = (risk) => {
        if (!risk || risk.toLowerCase() === 'unknown') return 'warning'; // Handle UNKNOWN as warning (yellow)
        if (risk.toLowerCase() === 'high') return 'danger';
        if (risk.toLowerCase() === 'medium') return 'warning';
        if (risk.toLowerCase() === 'low') return 'success';
        return isDarkMode ? 'light' : 'secondary';
    };

    // Style for the title in dark mode
    const titleStyle = isDarkMode ? { color: '#FFFFFF' } : {}; // Bright color in dark mode

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

    // Helper function to extract and properly display AI analysis data
    const getAnalysisData = (activity) => {
        // If the activity has structured analysis data
        if (activity.aiStructuredAnalysis) {
            return {
                category: activity.aiStructuredAnalysis.category || 'General activity',
                patterns: activity.aiStructuredAnalysis.patterns || 'No unusual patterns detected',
                risk: activity.aiStructuredAnalysis.riskLevel === 'UNKNOWN' ? 'MEDIUM' : activity.aiStructuredAnalysis.riskLevel || 'MEDIUM',
                fullAnalysis: typeof activity.aiAnalysis === 'string' 
                    ? activity.aiAnalysis 
                    : (activity.aiAnalysis?.fullAnalysis || JSON.stringify(activity.aiAnalysis))
            };
        }
        
        // If no structured data, parse from aiAnalysis
        const parsedData = parseAIAnalysis(activity.aiAnalysis);
        return {
            category: parsedData.category,
            patterns: parsedData.patterns,
            risk: parsedData.risk,
            fullAnalysis: typeof activity.aiAnalysis === 'string' 
                ? activity.aiAnalysis 
                : JSON.stringify(activity.aiAnalysis)
        };
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
                            style={titleStyle}
                        >
                            Activity Tracker <CBadge color="info" shape="rounded-pill" className="ms-2">AI Enhanced</CBadge>
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
                        
                    </div>
                </CCardHeader>
                <CCardBody>
                    {loading ? (
                        <div className="text-center p-5">
                            <CSpinner color="primary" />
                            <p className={`mt-2 ${isDarkMode ? 'text-light' : 'text-muted'}`}>Loading activity data...</p>
                        </div>
                    ) : (
                        <>
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
                                            <CTableHeaderCell className="text-nowrap">
                                                <FontAwesomeIcon icon={faRobot} className={`me-2 ${isDarkMode ? 'text-white' : 'text-muted'}`} />
                                                AI Analysis
                                            </CTableHeaderCell>
                                        </CTableRow>
                                    </CTableHead>
                                    <CTableBody>
                                        {currentActivities.length === 0 ? (
                                            <CTableRow>
                                                <CTableDataCell colSpan={8} className={`text-center p-5 ${isDarkMode ? 'text-white' : 'text-muted'}`}>
                                                    No activity records found
                                                </CTableDataCell>
                                            </CTableRow>
                                        ) : (
                                            currentActivities.map(activity => {
                                                // Get analysis data including proper risk level
                                                const analysisData = getAnalysisData(activity);
                                                
                                                return (
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
                                                        <CTableDataCell>
                                                            {activity.aiAnalysis ? (
                                                                <div className="d-flex align-items-center">
                                                                    <CBadge 
                                                                        color={getRiskBadgeColor(analysisData.risk)} 
                                                                        shape="rounded-pill"
                                                                        className="me-2"
                                                                    >
                                                                        {analysisData.risk}
                                                                    </CBadge>
                                                                    <CButton 
                                                                        color="light" 
                                                                        size="sm"
                                                                        onClick={() => viewAIAnalysis(activity)}
                                                                    >
                                                                        <FontAwesomeIcon icon={faEye} className="me-1" />
                                                                        View
                                                                    </CButton>
                                                                </div>
                                                            ) : (
                                                                <span className="text-muted">Not available</span>
                                                            )}
                                                        </CTableDataCell>
                                                    </CTableRow>
                                                );
                                            })
                                        )}
                                    </CTableBody>
                                </CTable>
                            </div>
                            
                            {/* Pagination */}
                            {activities.length > 0 && (
                                <div className="d-flex justify-content-center mt-4">
                                    <CPagination aria-label="Activity pagination" className={isDarkMode ? "pagination-dark" : ""}>
                                        <CPaginationItem 
                                            aria-label="Previous" 
                                            disabled={currentPage === 1}
                                            onClick={() => paginate(currentPage - 1)}
                                        >
                                            <span aria-hidden="true">&laquo;</span>
                                        </CPaginationItem>
                                        
                                        {generatePaginationItems()}
                                        
                                        <CPaginationItem 
                                            aria-label="Next" 
                                            disabled={currentPage === totalPages}
                                            onClick={() => paginate(currentPage + 1)}
                                        >
                                            <span aria-hidden="true">&raquo;</span>
                                        </CPaginationItem>
                                    </CPagination>
                                </div>
                            )}
                        </>
                    )}
                </CCardBody>
                <CCardFooter className={`${isDarkMode ? 'bg-dark text-white border-secondary' : 'bg-light text-muted'}`}>
                    <CRow>
                        <CCol>
                            <small>Showing {indexOfFirstActivity + 1}-{Math.min(indexOfLastActivity, activities.length)} of {activities.length} activities</small>
                        </CCol>
                        <CCol className="text-end">
                            <small>Last updated: {new Date().toLocaleString()}</small>
                        </CCol>
                    </CRow>
                </CCardFooter>
            </CCard>

            {/* AI Analysis Modal - UPDATED to properly display data */}
            <CModal 
                visible={showAIModal} 
                onClose={() => setShowAIModal(false)}
                size="lg"
                backdrop="static"
                className={isDarkMode ? "modal-dark" : ""}
            >
                <CModalHeader className={isDarkMode ? "bg-dark text-white" : ""}>
                    <CModalTitle>
                        <FontAwesomeIcon icon={faRobot} className="me-2 text-primary" />
                        AI Activity Analysis
                    </CModalTitle>
                </CModalHeader>
                <CModalBody className={isDarkMode ? "bg-dark text-white" : ""}>
                    {selectedActivity && (
                        <>
                            <div className="mb-4">
                                <h5>Activity Details</h5>
                                <CRow className="mb-3">
                                    <CCol md="6">
                                        <p className="mb-1"><strong>User:</strong> {selectedActivity.name}</p>
                                        <p className="mb-1"><strong>Role:</strong> {selectedActivity.role}</p>
                                        <p className="mb-1"><strong>Department:</strong> {selectedActivity.department}</p>
                                    </CCol>
                                    <CCol md="6">
                                        <p className="mb-1"><strong>Route:</strong> {selectedActivity.route}</p>
                                        <p className="mb-1"><strong>Action:</strong> {selectedActivity.action}</p>
                                        <p className="mb-1"><strong>Time:</strong> {new Date(selectedActivity.timestamp).toLocaleString()}</p>
                                    </CCol>
                                </CRow>
                                <p className="mb-1"><strong>Description:</strong> {selectedActivity.description}</p>
                            </div>

                            <div className="mb-3 mt-4">
                                <h5>
                                    <FontAwesomeIcon icon={faChartLine} className="me-2 text-info" />
                                    AI Analysis Results
                                </h5>
                                
                                {selectedActivity.aiAnalysis ? (
                                    <>
                                        {/* Get analysis data */}
                                        {(() => {
                                            const analysisData = getAnalysisData(selectedActivity);
                                            
                                            return (
                                                <>
                                                    <CAccordion activeItemKey={1} className="mt-3">
                                                        <CAccordionItem itemKey={1}>
                                                            <CAccordionHeader>Full Analysis</CAccordionHeader>
                                                            <CAccordionBody>
                                                                <div 
                                                                    className={`p-3 ${isDarkMode ? 'bg-secondary bg-opacity-10' : 'bg-light'}`} 
                                                                    style={{whiteSpace: 'pre-line', borderRadius: '0.25rem'}}
                                                                >
                                                                    {analysisData.fullAnalysis}
                                                                </div>
                                                            </CAccordionBody>
                                                        </CAccordionItem>
                                                    </CAccordion>
                                                    
                                                    <CRow className="mt-4">
                                                        <CCol md="4">
                                                            <CCard className={isDarkMode ? "bg-dark text-white border-secondary" : ""}>
                                                                <CCardHeader className="bg-info text-white">
                                                                    <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                                                                    Category
                                                                </CCardHeader>
                                                                <CCardBody>
                                                                    {analysisData.category}
                                                                </CCardBody>
                                                            </CCard>
                                                        </CCol>
                                                        <CCol md="4">
                                                            <CCard className={isDarkMode ? "bg-dark text-white border-secondary" : ""}>
                                                                <CCardHeader className="bg-primary text-white">
                                                                    <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                                                                    Patterns
                                                                </CCardHeader>
                                                                <CCardBody>
                                                                    {analysisData.patterns}
                                                                </CCardBody>
                                                            </CCard>
                                                        </CCol>
                                                        <CCol md="4">
                                                            <CCard className={isDarkMode ? "bg-dark text-white border-secondary" : ""}>
                                                                <CCardHeader className={`bg-${getRiskBadgeColor(analysisData.risk)} text-white`}>
                                                                    <FontAwesomeIcon icon={faShieldAlt} className="me-2" />
                                                                    Risk Level
                                                                </CCardHeader>
                                                                <CCardBody className="d-flex justify-content-center align-items-center">
                                                                    <CBadge 
                                                                        color={getRiskBadgeColor(analysisData.risk)} 
                                                                        size="lg"
                                                                        shape="rounded-pill"
                                                                        className="px-4 py-2"
                                                                    >
                                                                        {analysisData.risk}
                                                                    </CBadge>
                                                                </CCardBody>
                                                            </CCard>
                                                        </CCol>
                                                    </CRow>
                                                </>
                                            );
                                        })()}
                                    </>
                                ) : (
                                    <div className="text-center p-4">
                                        <p className="text-muted">AI analysis not available for this activity.</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </CModalBody>
                <CModalFooter className={isDarkMode ? "bg-dark text-white" : ""}>
                    <CButton 
                        color="secondary" 
                        onClick={() => setShowAIModal(false)}
                    >
                        Close
                    </CButton>
                </CModalFooter>
            </CModal>
        </CContainer>
    );
};

export default ActivityTracker;