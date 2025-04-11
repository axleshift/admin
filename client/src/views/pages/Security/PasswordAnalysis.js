import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../utils/axiosInstance';

// CoreUI imports
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
  CButton,
  CContainer,
  CRow,
  CCol,
  CProgress,
  CSpinner,
  CAlert,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CPagination,
  CPaginationItem,
  CFormSelect,
  CFormInput,
  CCollapse,
  CBadge
} from '@coreui/react';

// FontAwesome imports
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLock, 
  faKey, 
  faInfoCircle, 
  faRobot, 
  faSearch, 
  faFilter, 
  faUser,
  faCalendarAlt,
  faShieldAlt,
  faEye,
  faSort,
  faExclamationTriangle,
  faHistory,
  faChevronDown,
  faChevronUp,
  faMapMarkerAlt
} from '@fortawesome/free-solid-svg-icons';

function PasswordResetAnalysisPage() {
  const [passwordResetEvents, setPasswordResetEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    strengthLevel: '',
    searchTerm: ''
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showHistoryCollapse, setShowHistoryCollapse] = useState({});
  const navigate = useNavigate();

  // Fetch password reset events
  useEffect(() => {
    fetchPasswordResetEvents();
  }, [currentPage, pageSize, filters]);

  const fetchPasswordResetEvents = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Construct query parameters
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: pageSize,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''))
      });
      
      const response = await axiosInstance.get(`/security/password-reset-analysis?${queryParams}`);
      
      setPasswordResetEvents(response.data.data || []);
      setTotalPages(response.data.totalPages || 1);
      
      // Initialize history collapse state for new events
      const newShowHistoryCollapse = {};
      response.data.data.forEach(event => {
        if (event._id) {
          newShowHistoryCollapse[event._id] = false;
        }
      });
      setShowHistoryCollapse(prev => ({...prev, ...newShowHistoryCollapse}));
      
    } catch (err) {
      console.error('Error fetching password reset events:', err);
      setError(err.response?.data?.Message || 'Failed to load password reset analysis data');
      setPasswordResetEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Helper function to determine progress color
  const getProgressColor = (score) => {
    if (score < 40) return 'danger';
    if (score < 60) return 'warning';
    if (score < 80) return 'info';
    return 'success';
  };

  // Handle showing details modal
  const handleShowDetails = (event) => {
    setSelectedEvent(event);
    setShowDetailModal(true);
  };

  // Handle filter change
  const handleFilterChange = (name, value) => {
    setFilters({
      ...filters,
      [name]: value
    });
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    // The actual fetching is handled by the useEffect
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      strengthLevel: '',
      searchTerm: ''
    });
    setCurrentPage(1);
  };

  // Toggle history collapse
  const toggleHistoryCollapse = (eventId) => {
    setShowHistoryCollapse(prev => ({
      ...prev,
      [eventId]: !prev[eventId]
    }));
  };

  return (
    <CContainer fluid className="px-4">
      <CRow className="mb-3">
        <CCol>
          <h2 className="mb-3 mt-4">
            <FontAwesomeIcon icon={faKey} className="me-2 text-primary" />
            Password Reset Analysis Dashboard
          </h2>
          <p className="text-muted">
            Monitor and analyze password reset events and security levels across the system
          </p>
        </CCol>
      </CRow>

      {/* Filters and Search Section */}
      <CCard className="mb-4 shadow-sm">
        <CCardHeader>
          <FontAwesomeIcon icon={faFilter} className="me-2" />
          Filters & Search
        </CCardHeader>
        <CCardBody>
          <form onSubmit={handleSearch}>
            <CRow className="g-3">
              <CCol md={3}>
                <CFormInput
                  type="date"
                  label="From Date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                />
              </CCol>
              <CCol md={3}>
                <CFormInput
                  type="date"
                  label="To Date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                />
              </CCol>
              <CCol md={3}>
                <CFormSelect
                  label="Password Strength"
                  value={filters.strengthLevel}
                  onChange={(e) => handleFilterChange('strengthLevel', e.target.value)}
                >
                  <option value="">All Strength Levels</option>
                  <option value="Weak">Weak</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Strong">Strong</option>
                  <option value="Very Strong">Very Strong</option>
                </CFormSelect>
              </CCol>
              <CCol md={3}>
                <CFormInput
                  type="text"
                  label="Search User"
                  placeholder="Name or Email"
                  value={filters.searchTerm}
                  onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                />
              </CCol>
            </CRow>
            <CRow className="mt-3">
              <CCol className="d-flex justify-content-end">
                <CButton 
                  color="secondary" 
                  variant="outline" 
                  className="me-2"
                  onClick={handleResetFilters}
                >
                  Reset Filters
                </CButton>
                <CButton 
                  type="submit" 
                  color="primary"
                >
                  <FontAwesomeIcon icon={faSearch} className="me-2" />
                  Search
                </CButton>
              </CCol>
            </CRow>
          </form>
        </CCardBody>
      </CCard>

      {/* Error Alert */}
      {error && (
        <CAlert color="danger" className="mb-4">
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          {error}
        </CAlert>
      )}

      {/* Main Data Table */}
      <CCard className="mb-4 shadow-sm">
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <div>
            <FontAwesomeIcon icon={faShieldAlt} className="me-2" />
            Password Reset Events
          </div>
          <div className="d-flex align-items-center">
            <span className="me-2">Show:</span>
            <CFormSelect
              size="sm"
              className="me-3"
              style={{ width: '80px' }}
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </CFormSelect>
          </div>
        </CCardHeader>
        <CCardBody>
          {loading ? (
            <div className="text-center py-5">
              <CSpinner color="primary" />
              <p className="mt-3 text-muted">Loading password reset data...</p>
            </div>
          ) : passwordResetEvents.length === 0 ? (
            <div className="text-center py-5">
              <FontAwesomeIcon icon={faInfoCircle} size="2x" className="text-muted mb-3" />
              <p className="text-muted">No password reset events found</p>
            </div>
          ) : (
            <>
              <CTable responsive hover align="middle" className="mb-0">
                <CTableHead>
                  <CTableRow className="bg-light">
                    <CTableHeaderCell style={{width: '5%'}}>#</CTableHeaderCell>
                    <CTableHeaderCell style={{width: '20%'}}>
                      <FontAwesomeIcon icon={faUser} className="me-2" />
                      User
                    </CTableHeaderCell>
                    <CTableHeaderCell style={{width: '15%'}}>
                      <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                      Reset Date
                    </CTableHeaderCell>
                    <CTableHeaderCell style={{width: '30%'}}>
                      <FontAwesomeIcon icon={faShieldAlt} className="me-2" />
                      Password Strength
                    </CTableHeaderCell>
                    <CTableHeaderCell style={{width: '15%'}}>Status</CTableHeaderCell>
                    <CTableHeaderCell style={{width: '15%'}}>Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {passwordResetEvents.map((event, index) => (
                    <React.Fragment key={event?._id || index}>
                      <CTableRow>
                        <CTableDataCell>
                          {(currentPage - 1) * pageSize + index + 1}
                        </CTableDataCell>
                        <CTableDataCell>
                          <div className="d-flex flex-column">
                            <span className="fw-bold">{event?.user?.name || 'Unknown'}</span>
                            <span className="small text-muted">{event?.user?.email || 'No email'}</span>
                            {event?.previousResets && event.previousResets.length > 0 && (
                              <div className="mt-1">
                                <CButton 
                                  color="link" 
                                  size="sm" 
                                  className="p-0"
                                  onClick={() => toggleHistoryCollapse(event._id)}
                                >
                                  <FontAwesomeIcon icon={faHistory} className="me-1" />
                                  {showHistoryCollapse[event._id] ? 'Hide' : 'Show'} History 
                                  <FontAwesomeIcon 
                                    icon={showHistoryCollapse[event._id] ? faChevronUp : faChevronDown} 
                                    className="ms-1" 
                                    size="xs" 
                                  />
                                  <CBadge color="light" shape="rounded-pill" className="ms-2">
                                    {event.previousResets.length}
                                  </CBadge>
                                </CButton>
                              </div>
                            )}
                          </div>
                        </CTableDataCell>
                        <CTableDataCell>
                          {formatDate(event?.timestamp)}
                        </CTableDataCell>
                        <CTableDataCell>
                          <div className="d-flex flex-column">
                            <div className="d-flex justify-content-between mb-1">
                              <span>{event?.passwordAnalysis?.strength || 'N/A'}</span>
                              <span className="fw-bold">{event?.passwordAnalysis?.score || 0}/100</span>
                            </div>
                            <CProgress 
                              thin 
                              value={event?.passwordAnalysis?.score || 0} 
                              color={getProgressColor(event?.passwordAnalysis?.score || 0)}
                            />
                          </div>
                        </CTableDataCell>
                        <CTableDataCell>
                          {event?.validationPassed ? (
                            <CButton color="success" variant="outline" size="sm" className="px-3" disabled>
                              Success
                            </CButton>
                          ) : (
                            <CButton color="danger" variant="outline" size="sm" className="px-3" disabled>
                              Failed
                            </CButton>
                          )}
                        </CTableDataCell>
                        <CTableDataCell>
                          <CButton 
                            color="primary" 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleShowDetails(event)}
                          >
                            <FontAwesomeIcon icon={faEye} className="me-1" />
                            Details
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                      
                      {/* History Collapse Section */}
                      {event?.previousResets && event.previousResets.length > 0 && (
                        <CTableRow>
                          <CTableDataCell colSpan="6" className="p-0 border-0">
                            <CCollapse visible={showHistoryCollapse[event._id]}>
                              <div className="bg-light p-3">
                                <h6 className="mb-3">
                                  <FontAwesomeIcon icon={faHistory} className="me-2 text-primary" />
                                  Password Reset History
                                </h6>
                                <CTable small hover responsive className="mb-0">
                                  <CTableHead>
                                    <CTableRow className="bg-white">
                                      <CTableHeaderCell>Date</CTableHeaderCell>
                                      <CTableHeaderCell>Strength</CTableHeaderCell>
                                      <CTableHeaderCell>Status</CTableHeaderCell>
                                      <CTableHeaderCell>IP Address</CTableHeaderCell>
                                    </CTableRow>
                                  </CTableHead>
                                  <CTableBody>
                                    {event.previousResets.map((reset, i) => (
                                      <CTableRow key={i}>
                                        <CTableDataCell>
                                          {formatDate(reset.timestamp)}
                                        </CTableDataCell>
                                        <CTableDataCell>
                                          <div className="d-flex align-items-center">
                                            <div style={{ width: '80px' }}>
                                              <CProgress 
                                                thin 
                                                value={reset?.passwordAnalysis?.score || 0} 
                                                color={getProgressColor(reset?.passwordAnalysis?.score || 0)}
                                              />
                                            </div>
                                            <span className="ms-2 small">
                                              {reset?.passwordAnalysis?.score || 0}/100
                                            </span>
                                          </div>
                                        </CTableDataCell>
                                        <CTableDataCell>
                                          {reset?.validationPassed ? (
                                            <CBadge color="success" shape="rounded-pill">Success</CBadge>
                                          ) : (
                                            <CBadge color="danger" shape="rounded-pill">Failed</CBadge>
                                          )}
                                        </CTableDataCell>
                                        <CTableDataCell>
                                          <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1 text-muted" />
                                          {reset?.ipAddress || 'N/A'}
                                        </CTableDataCell>
                                      </CTableRow>
                                    ))}
                                  </CTableBody>
                                </CTable>
                              </div>
                            </CCollapse>
                          </CTableDataCell>
                        </CTableRow>
                      )}
                    </React.Fragment>
                  ))}
                </CTableBody>
              </CTable>

              {/* Pagination */}
              <CPagination align="center" className="mt-4">
                <CPaginationItem 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                >
                  First
                </CPaginationItem>
                <CPaginationItem 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                >
                  Previous
                </CPaginationItem>

                {/* Generate page numbers */}
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <CPaginationItem 
                      key={pageNum} 
                      active={pageNum === currentPage}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </CPaginationItem>
                  );
                })}

                <CPaginationItem 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                >
                  Next
                </CPaginationItem>
                <CPaginationItem 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                >
                  Last
                </CPaginationItem>
              </CPagination>
            </>
          )}
        </CCardBody>
      </CCard>

      {/* Detail Modal */}
      <CModal 
        visible={showDetailModal} 
        onClose={() => setShowDetailModal(false)}
        size="lg"
      >
        <CModalHeader onClose={() => setShowDetailModal(false)}>
          <CModalTitle>
            <FontAwesomeIcon icon={faKey} className="me-2 text-primary" />
            Password Reset Details
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedEvent && (
            <>
              <CRow className="mb-4">
                <CCol md={6}>
                  <h5>User Information</h5>
                  <div className="mb-2">
                    <strong>Name:</strong> {selectedEvent.user?.name || 'Unknown'}
                  </div>
                  <div className="mb-2">
                    <strong>Email:</strong> {selectedEvent.user?.email || 'No email'}
                  </div>
                  <div className="mb-2">
                    <strong>Department:</strong> {selectedEvent.user?.department || 'N/A'}
                  </div>
                  <div className="mb-2">
                    <strong>Role:</strong> {selectedEvent.user?.role || 'User'}
                  </div>
                </CCol>
                <CCol md={6}>
                  <h5>Event Information</h5>
                  <div className="mb-2">
                    <strong>Event ID:</strong> {selectedEvent._id || 'N/A'}
                  </div>
                  <div className="mb-2">
                    <strong>Timestamp:</strong> {formatDate(selectedEvent.timestamp)}
                  </div>
                  <div className="mb-2">
                    <strong>IP Address:</strong> {selectedEvent.ipAddress || 'N/A'}
                  </div>
                  <div className="mb-2">
                    <strong>Status:</strong> {selectedEvent.validationPassed ? 'Success' : 'Failed'}
                  </div>
                </CCol>
              </CRow>

              <h5 className="mb-3">Password Analysis</h5>
              <CCard className="mb-4 border">
                <CCardBody>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="fw-bold">Strength Rating:</span>
                      <span className={`text-${getProgressColor(selectedEvent.passwordAnalysis?.score || 0)}`}>
                        {selectedEvent.passwordAnalysis?.strength || 'N/A'}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span className="fw-bold">Score:</span>
                      <span>{selectedEvent.passwordAnalysis?.score || 0}/100</span>
                    </div>
                    <CProgress 
                      className="mb-3"
                      value={selectedEvent.passwordAnalysis?.score || 0} 
                      color={getProgressColor(selectedEvent.passwordAnalysis?.score || 0)} 
                    />
                  </div>

                  {selectedEvent.passwordAnalysis?.feedback && selectedEvent.passwordAnalysis.feedback.length > 0 && (
                    <div className="mb-3">
                      <h6>Feedback & Recommendations</h6>
                      <ul className="list-group list-group-flush">
                        {selectedEvent.passwordAnalysis.feedback.map((item, index) => (
                          <li key={index} className="list-group-item px-0">
                            <FontAwesomeIcon icon={faInfoCircle} className="me-2 text-primary" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedEvent.passwordAnalysis?.explanation && (
                    <div className="p-3 bg-light rounded">
                      <h6>Analysis Explanation</h6>
                      <p className="mb-0">{selectedEvent.passwordAnalysis.explanation}</p>
                    </div>
                  )}
                </CCardBody>
              </CCard>

              {selectedEvent.validationDetails && (
                <div className="mb-3">
                  <h5 className="mb-3">Validation Details</h5>
                  <CCard className="border">
                    <CCardBody>
                      <div className="mb-2">
                        <strong>Validation Passed:</strong> {selectedEvent.validationDetails.passed ? 'Yes' : 'No'}
                      </div>
                      {selectedEvent.validationDetails.message && (
                        <div className="mb-2">
                          <strong>Message:</strong> {selectedEvent.validationDetails.message}
                        </div>
                      )}
                      {selectedEvent.validationDetails.checks && (
                        <div className="mt-3">
                          <h6>Validation Checks</h6>
                          <ul className="list-group list-group-flush">
                            {Object.entries(selectedEvent.validationDetails.checks).map(([key, value]) => (
                              <li key={key} className="list-group-item px-0 d-flex justify-content-between">
                                <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                                <span>
                                  {value ? (
                                    <span className="text-success">Passed</span>
                                  ) : (
                                    <span className="text-danger">Failed</span>
                                  )}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CCardBody>
                  </CCard>
                </div>
              )}

              {selectedEvent.previousResets && selectedEvent.previousResets.length > 0 && (
                <div className="mb-3">
                  <h5 className="mb-3">
                    <FontAwesomeIcon icon={faHistory} className="me-2" />
                    Password Reset History
                  </h5>
                  <CCard className="border">
                    <CCardBody>
                      <CTable responsive small hover className="mb-0">
                        <CTableHead>
                          <CTableRow className="bg-light">
                            <CTableHeaderCell>Date</CTableHeaderCell>
                            <CTableHeaderCell>Password Strength</CTableHeaderCell>
                            <CTableHeaderCell>Status</CTableHeaderCell>
                            <CTableHeaderCell>IP Address</CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {selectedEvent.previousResets.map((reset, index) => (
                            <CTableRow key={reset._id || index}>
                              <CTableDataCell>{formatDate(reset.timestamp)}</CTableDataCell>
                              <CTableDataCell>
                                <div className="d-flex align-items-center">
                                  <div style={{ width: '100px' }}>
                                    <CProgress 
                                      thin 
                                      value={reset?.passwordAnalysis?.score || 0} 
                                      color={getProgressColor(reset?.passwordAnalysis?.score || 0)}
                                    />
                                  </div>
                                  <span className="ms-2">
                                    {reset?.passwordAnalysis?.strength || 'N/A'} 
                                    ({reset?.passwordAnalysis?.score || 0}/100)
                                  </span>
                                </div>
                              </CTableDataCell>
                              <CTableDataCell>
                                {reset?.validationPassed ? (
                                  <span className="text-success">Success</span>
                                ) : (
                                  <span className="text-danger">Failed</span>
                                )}
                              </CTableDataCell>
                              <CTableDataCell>
                                {reset?.ipAddress || 'N/A'}
                              </CTableDataCell>
                            </CTableRow>
                          ))}
                        </CTableBody>
                      </CTable>
                    </CCardBody>
                  </CCard>
                </div>
              )}
            </>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowDetailModal(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
}

export default PasswordResetAnalysisPage;