// SecurityDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  FaTimes
} from 'react-icons/fa';

// Import the CSS file

const SecurityDashboard = () => {
  const [activeTab, setActiveTab] = useState('alerts');
  const [securityAlerts, setSecurityAlerts] = useState([]);
  const [loginAttempts, setLoginAttempts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [loginsLoading, setLoginsLoading] = useState(true);
  const [error, setError] = useState(null);
  
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

  // Base URL for API
  const API_URL = 'http://localhost:5053/security';

  // Fetch security alerts
  const fetchSecurityAlerts = async () => {
    setAlertsLoading(true);
    setError(null);
    
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (alertFilters.userId) params.append('userId', alertFilters.userId);
      if (alertFilters.alertType) params.append('alertType', alertFilters.alertType);
      if (alertFilters.status) params.append('status', alertFilters.status);
      
      const response = await axios.get(`${API_URL}/security-alert`, { params });
      setSecurityAlerts(response.data);
    } catch (err) {
      console.error('Error fetching security alerts:', err);
      setError('Failed to load security alerts. Please try again.');
    } finally {
      setAlertsLoading(false);
    }
  };

  // Fetch login attempts
  const fetchLoginAttempts = async () => {
    setLoginsLoading(true);
    setError(null);
    
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (loginFilters.userId) params.append('userId', loginFilters.userId);
      if (loginFilters.status) params.append('status', loginFilters.status);
      if (loginFilters.ipAddress) params.append('ipAddress', loginFilters.ipAddress);
      
      const response = await axios.get(`${API_URL}/login-attemp`, { params });
      setLoginAttempts(response.data);
    } catch (err) {
      console.error('Error fetching login attempts:', err);
      setError('Failed to load login attempts. Please try again.');
    } finally {
      setLoginsLoading(false);
    }
  };

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

  // Initial data fetch
  useEffect(() => {
    if (activeTab === 'alerts') {
      fetchSecurityAlerts();
    } else {
      fetchLoginAttempts();
    }
  }, [activeTab]);
  
  // Format timestamp
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };
  
  // Get badge color based on status
  const getStatusBadgeColor = (status, isLoginAttempt = false) => {
    if (isLoginAttempt) {
      return status === 'SUCCESS' ? 'success' : 'danger';
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
                  <CCol sm={3}>
                    <CButton color="primary" onClick={fetchSecurityAlerts}>
                      Apply Filters
                    </CButton>
                  </CCol>
                </CRow>
                
                {/* Alerts Table */}
                {error && <div className="alert alert-danger">{error}</div>}
                
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
                      <option value="SUCCESS">Success</option>
                      <option value="FAILED">Failed</option>
                    </CFormSelect>
                  </CCol>
                  <CCol sm={3}>
                    <CButton color="primary" onClick={fetchLoginAttempts}>
                      Apply Filters
                    </CButton>
                  </CCol>
                </CRow>
                
                {/* Login Attempts Table */}
                {error && <div className="alert alert-danger">{error}</div>}
                
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
                        <CTableHeaderCell>User ID</CTableHeaderCell>
                        <CTableHeaderCell>IP Address</CTableHeaderCell>
                        <CTableHeaderCell>Device/Browser</CTableHeaderCell>
                        <CTableHeaderCell>Location</CTableHeaderCell>
                        <CTableHeaderCell>Timestamp</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {loginAttempts.length === 0 ? (
                        <CTableRow>
                          <CTableDataCell colSpan="6" className="text-center">
                            No login attempts found
                          </CTableDataCell>
                        </CTableRow>
                      ) : (
                        loginAttempts.map(attempt => (
                          <CTableRow key={attempt._id}>
                            <CTableDataCell>
                              <CBadge color={getStatusBadgeColor(attempt.status, true)}>
                                {renderSafely(attempt.status) === 'SUCCESS' ? (
                                  <><FaCheck className="me-1" /> SUCCESS</>
                                ) : (
                                  <><FaTimes className="me-1" /> FAILED</>
                                )}
                              </CBadge>
                            </CTableDataCell>
                            <CTableDataCell>
                              <FaUserShield className="me-1" />
                              {renderSafely(attempt.userId)}
                            </CTableDataCell>
                            <CTableDataCell>
                              <FaGlobe className="me-1" />
                              {renderSafely(attempt.ipAddress)}
                            </CTableDataCell>
                            <CTableDataCell>
                              {renderSafely(attempt.userAgent)}
                            </CTableDataCell>
                            <CTableDataCell>
                              {renderSafely(attempt.location)}
                            </CTableDataCell>
                            <CTableDataCell>
                              <FaClock className="me-1" />
                              {attempt.timestamp ? formatDate(attempt.timestamp) : '-'}
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
        </CCol>
      </CRow>
    </div>
  );
};

export default SecurityDashboard;