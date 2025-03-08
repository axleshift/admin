import React, { useState } from 'react';
import { 
  CCard, 
  CCardBody, 
  CCardHeader, 
  CCol, 
  CRow, 
  CTable, 
  CTableHead, 
  CTableRow, 
  CTableHeaderCell, 
  CTableBody, 
  CTableDataCell,
  CNav,
  CNavItem,
  CNavLink,
  CFormInput,
  CFormSelect,
  CButton,
  CBadge,
  CSpinner
} from '@coreui/react';
import { 
  FaShieldAlt, 
  FaKey, 
  FaFilter, 
  FaExclamationTriangle,
  FaUserShield,
  FaClock,
  FaGlobe,
  FaCheck,
  FaTimes,
  FaQuestion,
  FaBuilding,
  FaSuitcaseRolling
} from 'react-icons/fa';

// Import the security API slice
import { useGetSecurityAlertsQuery, useGetLoginAttemptsQuery } from '../../../state/adminApi';

const SecurityDashboard = () => {
  const [activeTab, setActiveTab] = useState('alerts');
  
  // Filter states
  const [alertFilters, setAlertFilters] = useState({
    userId: '',
    alertType: '',
    status: ''
  });
  
  const [loginFilters, setLoginFilters] = useState({
    userId: '',
    status: '',
    ipAddress: ''
  });

  // Prepare a modified query object for login attempts to handle the "attempt" status specially
  const prepareLoginQuery = () => {
    const queryParams = { ...loginFilters };
    
    // Special handling for "attempt" status - we need to find records with missing or empty userId
    if (queryParams.status === 'attempt') {
      // Set up a special flag that your backend can interpret to look for empty userIds
      // OR handle it on the frontend by removing the status filter and filtering the results after fetching
      delete queryParams.status;
      queryParams.emptyUserId = true;
    }
    
    return queryParams;
  };

  // Use RTK Query hooks
  const {
    data: securityAlerts = [], 
    isLoading: alertsLoading, 
    error: alertsError
  } = useGetSecurityAlertsQuery(alertFilters);

  const {
    data: loginAttemptsRaw = [], 
    isLoading: loginsLoading, 
    error: loginsError
  } = useGetLoginAttemptsQuery(prepareLoginQuery());

  // Post-process login attempts based on filter
  const loginAttempts = React.useMemo(() => {
    if (loginFilters.status === 'attempt') {
      // If filtering for "attempt", only show records with empty userId
      return loginAttemptsRaw.filter(attempt => 
        !attempt.userId || attempt.userId === '' || 
        attempt.userId === null || attempt.userId === undefined
      );
    } else if (loginFilters.status === 'success' || loginFilters.status === 'failed') {
      // For success/failed, ensure we only show records with matching status AND non-empty userIds
      return loginAttemptsRaw.filter(attempt => 
        attempt.status === loginFilters.status && 
        attempt.userId && attempt.userId !== '' && 
        attempt.userId !== null && attempt.userId !== undefined
      );
    } else {
      // If no status filter, show all
      return loginAttemptsRaw;
    }
  }, [loginAttemptsRaw, loginFilters.status]);

  // Handle alerts filter change
  const handleAlertFilterChange = (e) => {
    const { name, value } = e.target;
    setAlertFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle login filter change
  const handleLoginFilterChange = (e) => {
    const { name, value } = e.target;
    setLoginFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Format timestamp
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };
  
  // Get badge color based on status
  const getStatusBadgeColor = (status, isLoginAttempt = false) => {
    if (isLoginAttempt) {
      if (status === 'attempt') return 'warning';
      return status === 'success' ? 'success' : 'danger';
    }
    
    switch (status) {
      case 'OPEN': return 'warning';
      case 'RESOLVED': return 'success';
      case 'FALSE_POSITIVE': return 'info';
      default: return 'secondary';
    }
  };
  
  // Get alert type badge color
  const getAlertTypeBadgeColor = (type) => {
    switch (type) {
      case 'SUSPICIOUS_LOGIN': return 'warning';
      case 'BRUTE_FORCE': return 'danger';
      case 'MULTIPLE_FAILURES': return 'danger';
      case 'UNUSUAL_LOCATION': return 'info';
      default: return 'secondary';
    }
  };

  // Helper function to safely render potentially complex data
  const renderSafely = (data) => {
    if (data === null || data === undefined) return '-';
    if (typeof data === 'object') {
      // If it's an object, convert to string or extract a relevant property
      if (data.name) return data.name;
      if (data.id) return data.id;
      if (data.toString && data.toString() !== '[object Object]') return data.toString();
      return JSON.stringify(data);
    }
    return data;
  };

  // Helper to determine login status based on userId and status
  const determineLoginStatus = (attempt) => {
    // If userId is missing or empty, mark as "attempt"
    if (!attempt.userId || attempt.userId === '' || attempt.userId === null || attempt.userId === undefined) {
      return 'attempt';
    }
    // Otherwise use the original status
    return attempt.status;
  };

  return (
    <div className="security-dashboard">
      <CRow>
        <CCol>
          <CNav variant="tabs" className="mb-4">
            <CNavItem>
              <CNavLink 
                active={activeTab === 'alerts'}
                onClick={() => setActiveTab('alerts')}
              >
                <FaExclamationTriangle className="me-2" /> Security Alerts
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink 
                active={activeTab === 'logins'}
                onClick={() => setActiveTab('logins')}
              >
                <FaKey className="me-2" /> Login Attempts
              </CNavLink>
            </CNavItem>
          </CNav>
          
          {/* Security Alerts Tab */}
          {activeTab === 'alerts' && (
            <CCard className="mb-4">
              <CCardHeader>
                <strong><FaExclamationTriangle className="me-2" /> Security Alerts</strong>
              </CCardHeader>
              <CCardBody>
                {/* Filters */}
                <CRow className="mb-3 filter-section">
                  <CCol sm={12}>
                    <h6><FaFilter className="me-2" /> Filters</h6>
                  </CCol>
                  <CCol sm={3}>
                    <CFormInput 
                      placeholder="User ID"
                      name="userId"
                      value={alertFilters.userId}
                      onChange={handleAlertFilterChange}
                      className="mb-2"
                    />
                  </CCol>
                  <CCol sm={3}>
                    <CFormSelect 
                      name="alertType"
                      value={alertFilters.alertType}
                      onChange={handleAlertFilterChange}
                      className="mb-2"
                    >
                      <option value="">All Alert Types</option>
                      <option value="SUSPICIOUS_LOGIN">Suspicious Login</option>
                      <option value="BRUTE_FORCE">Brute Force</option>
                      <option value="MULTIPLE_FAILURES">Multiple Failures</option>
                      <option value="UNUSUAL_LOCATION">Unusual Location</option>
                    </CFormSelect>
                  </CCol>
                  <CCol sm={3}>
                    <CFormSelect 
                      name="status"
                      value={alertFilters.status}
                      onChange={handleAlertFilterChange}
                      className="mb-2"
                    >
                      <option value="">All Statuses</option>
                      <option value="OPEN">Open</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="FALSE_POSITIVE">False Positive</option>
                    </CFormSelect>
                  </CCol>
                </CRow>
                
                {/* Error Handling */}
                {alertsError && <div className="alert alert-danger">
                  Failed to load security alerts: {alertsError.toString()}
                </div>}
                
                {/* Alerts Table */}
                {alertsLoading ? (
                  <div className="text-center py-5">
                    <CSpinner color="primary" />
                    <p className="mt-3">Loading security alerts...</p>
                  </div>
                ) : (
                  <CTable hover responsive>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Alert Type</CTableHeaderCell>
                        <CTableHeaderCell>User</CTableHeaderCell>
                        <CTableHeaderCell>Timestamp</CTableHeaderCell>
                        <CTableHeaderCell>Details</CTableHeaderCell>
                        <CTableHeaderCell>Status</CTableHeaderCell>
                        <CTableHeaderCell>Resolution</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {securityAlerts.length === 0 ? (
                        <CTableRow>
                          <CTableDataCell colSpan="6" className="text-center">
                            No security alerts found
                          </CTableDataCell>
                        </CTableRow>
                      ) : (
                        securityAlerts.map(alert => (
                          <CTableRow key={alert._id}>
                            <CTableDataCell>
                              <CBadge color={getAlertTypeBadgeColor(alert.alertType)}>
                                {renderSafely(alert.alertType)}
                              </CBadge>
                            </CTableDataCell>
                            <CTableDataCell>
                              <FaUserShield className="me-1" />
                              {typeof alert.userId === 'object' && alert.userId !== null
                                ? renderSafely(alert.userId.name) || renderSafely(alert.userId)
                                : renderSafely(alert.userId)}
                            </CTableDataCell>
                            <CTableDataCell>
                              <FaClock className="me-1" />
                              {alert.timestamp ? formatDate(alert.timestamp) : '-'}
                            </CTableDataCell>
                            <CTableDataCell>{renderSafely(alert.details)}</CTableDataCell>
                            <CTableDataCell>
                              <CBadge color={getStatusBadgeColor(alert.status)}>
                                {renderSafely(alert.status)}
                              </CBadge>
                            </CTableDataCell>
                            <CTableDataCell>
                              {alert.resolution && typeof alert.resolution === 'object'
                                ? renderSafely(alert.resolution.notes)
                                : '-'}
                            </CTableDataCell>
                          </CTableRow>
                        ))
                      )}
                    </CTableBody>
                  </CTable>
                )}
              </CCardBody>
            </CCard>
          )}
          
          {/* Login Attempts Tab */}
          {activeTab === 'logins' && (
            <CCard className="mb-4">
              <CCardHeader>
                <strong><FaKey className="me-2" /> Login Attempts</strong>
              </CCardHeader>
              <CCardBody>
                {/* Filters */}
                <CRow className="mb-3 filter-section">
                  <CCol sm={12}>
                    <h6><FaFilter className="me-2" /> Filters</h6>
                  </CCol>
                  <CCol sm={3}>
                    <CFormInput 
                      placeholder="User ID"
                      name="userId"
                      value={loginFilters.userId}
                      onChange={handleLoginFilterChange}
                      className="mb-2"
                    />
                  </CCol>
                  <CCol sm={3}>
                    <CFormInput 
                      placeholder="IP Address"
                      name="ipAddress"
                      value={loginFilters.ipAddress}
                      onChange={handleLoginFilterChange}
                      className="mb-2"
                    />
                  </CCol>
                  <CCol sm={3}>
                    <CFormSelect 
                      name="status"
                      value={loginFilters.status}
                      onChange={handleLoginFilterChange}
                      className="mb-2"
                    >
                      <option value="">All Statuses</option>
                      <option value="success">Success</option>
                      <option value="failed">Failed</option>
                      <option value="attempt">Attempt</option>
                    </CFormSelect>
                  </CCol>
                </CRow>
                
                {/* Error Handling */}
                {loginsError && <div className="alert alert-danger">
                  Failed to load login attempts: {loginsError.toString()}
                </div>}
                
                {/* Login Attempts Table */}
                {loginsLoading ? (
                  <div className="text-center py-5">
                    <CSpinner color="primary" />
                    <p className="mt-3">Loading login attempts...</p>
                  </div>
                ) : (
                  <CTable hover responsive>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Status</CTableHeaderCell>
                        <CTableHeaderCell>Name</CTableHeaderCell>
                        <CTableHeaderCell>Role</CTableHeaderCell>
                        <CTableHeaderCell>Department</CTableHeaderCell>
                        <CTableHeaderCell>Device/Browser</CTableHeaderCell>
                        <CTableHeaderCell>Timestamp</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {loginAttempts.length === 0 ? (
                        <CTableRow>
                          <CTableDataCell colSpan="7" className="text-center">
                            No login attempts found
                          </CTableDataCell>
                        </CTableRow>
                      ) : (
                        loginAttempts.map(attempt => {
                          const loginStatus = determineLoginStatus(attempt);
                          return (
                            <CTableRow key={attempt._id}>
                              <CTableDataCell>
                                <CBadge color={getStatusBadgeColor(loginStatus, true)}>
                                  {loginStatus === 'success' ? (
                                    <><FaCheck className="me-1" /> SUCCESS</>
                                  ) : loginStatus === 'attempt' ? (
                                    <><FaQuestion className="me-1" /> ATTEMPT</>
                                  ) : (
                                    <><FaTimes className="me-1" /> FAILED</>
                                  )}
                                </CBadge>
                              </CTableDataCell>
                              <CTableDataCell>
                                <FaUserShield className="me-1" />
                                {renderSafely(attempt.name)}
                              </CTableDataCell>
                              <CTableDataCell>
                                <FaSuitcaseRolling className="me-1" />
                                {renderSafely(attempt.role)}
                              </CTableDataCell>
                              <CTableDataCell>
                                <FaBuilding className="me-1" />
                                {renderSafely(attempt.department)}
                              </CTableDataCell>
                             
                              <CTableDataCell>
                                {renderSafely(attempt.userAgent)}
                              </CTableDataCell>
                              <CTableDataCell>
                                <FaClock className="me-1" />
                                {attempt.timestamp ? formatDate(attempt.timestamp) : '-'}
                              </CTableDataCell>
                            </CTableRow>
                          );
                        })
                      )}
                    </CTableBody>
                  </CTable>
                )}
              </CCardBody>
            </CCard>
          )}
        </CCol>
      </CRow>
    </div>
  );
};

export default SecurityDashboard;