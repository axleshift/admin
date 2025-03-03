// components/SecurityMonitoring.jsx
import React, { useState, useEffect } from 'react';
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
  CBadge,
  CButton,
  CSpinner,
  CForm,
  CFormSelect,
  CInputGroup,
  CInputGroupText,
  CFormInput,
  CTabContent,
  CTabPane,
  CNav,
  CNavItem,
  CNavLink
} from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShieldAlt, 
  faClock, 
  faExclamationTriangle, 
  faCheckCircle, 
  faUserShield, 
  faSearch,
  faSync,
  faFilter,
  faLock,
  faGlobe,
  faUser,
  faInfoCircle,
  faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';
import { format } from 'date-fns';
import {
    useGetLoginAttemptsQuery,
    useGetSecurityAlertsQuery,
    useResolveAlertMutation
  } from '../../../state/adminApi';


// Status Badge Component
const StatusBadge = ({ status }) => {
  let color;
  let icon;
  
  switch(status) {
    case 'success':
      color = 'success';
      icon = faCheckCircle;
      break;
    case 'failed':
    case 'unauthorized':
      color = 'danger';
      icon = faExclamationTriangle;
      break;
    case 'attempted':
      color = 'info';
      icon = faClock;
      break;
    case 'error':
      color = 'warning';
      icon = faExclamationCircle;
      break;
    case 'active':
      color = 'danger';
      icon = faExclamationTriangle;
      break;
    case 'resolved':
      color = 'success';
      icon = faCheckCircle;
      break;
    case 'false_positive':
      color = 'secondary';
      icon = faInfoCircle;
      break;
    default:
      color = 'secondary';
      icon = faInfoCircle;
  }
  
  return (
    <CBadge color={color} className="me-1">
      <FontAwesomeIcon icon={icon} className="me-1" /> {status}
    </CBadge>
  );
};

// Security Monitoring Page Component
const SecurityMonitoring = () => {
  const [activeTab, setActiveTab] = useState('login-attempts');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('1d');
  
  // Query params
  const loginAttemptsParams = { status: filterStatus, search: searchTerm, period: dateFilter };
  const securityAlertsParams = { status: filterStatus, search: searchTerm, period: dateFilter };
  
  // RTK Query hooks
  const { 
    data: loginAttempts = [], 
    isLoading: isLoadingAttempts, 
    refetch: refetchAttempts 
  } = useGetLoginAttemptsQuery(loginAttemptsParams);
  
  const { 
    data: securityAlerts = [], 
    isLoading: isLoadingAlerts, 
    refetch: refetchAlerts 
  } = useGetSecurityAlertsQuery(securityAlertsParams);
  
  const [resolveAlert] = useResolveAlertMutation();
  
  // Format date
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm:ss');
  };
  
  // Handle alert resolution
  const handleResolveAlert = async (alertId, resolution = 'resolved by admin') => {
    try {
      await resolveAlert({ alertId, resolution }).unwrap();
      refetchAlerts();
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  };
  
  // Filter handlers
  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleDateFilterChange = (e) => {
    setDateFilter(e.target.value);
  };
  
  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="bg-light">
            <strong><FontAwesomeIcon icon={faShieldAlt} className="me-2" /> Security Monitoring Dashboard</strong>
          </CCardHeader>
          <CCardBody>
            <CNav variant="tabs" className="mb-4">
              <CNavItem>
                <CNavLink 
                  active={activeTab === 'login-attempts'}
                  onClick={() => setActiveTab('login-attempts')}
                  href="#"
                >
                  <FontAwesomeIcon icon={faLock} className="me-2" /> Login Attempts
                  {loginAttempts.length > 0 && (
                    <CBadge color="primary" shape="rounded-pill" className="ms-2">
                      {loginAttempts.length}
                    </CBadge>
                  )}
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink 
                  active={activeTab === 'security-alerts'}
                  onClick={() => setActiveTab('security-alerts')}
                  href="#"
                >
                  <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" /> Security Alerts
                  {securityAlerts.length > 0 && (
                    <CBadge color="danger" shape="rounded-pill" className="ms-2">
                      {securityAlerts.filter(alert => alert.status === 'active').length}
                    </CBadge>
                  )}
                </CNavLink>
              </CNavItem>
            </CNav>
            
            {/* Filter Controls */}
            <CRow className="mb-3">
              <CCol md={4}>
                <CInputGroup>
                  <CInputGroupText>
                    <FontAwesomeIcon icon={faSearch} />
                  </CInputGroupText>
                  <CFormInput 
                    placeholder="Search by email, IP or user ID..." 
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </CInputGroup>
              </CCol>
              <CCol md={3}>
                <CInputGroup>
                  <CInputGroupText>
                    <FontAwesomeIcon icon={faFilter} />
                  </CInputGroupText>
                  <CFormSelect 
                    value={filterStatus}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Statuses</option>
                    {activeTab === 'login-attempts' ? (
                      <>
                        <option value="attempted">Attempted</option>
                        <option value="success">Success</option>
                        <option value="failed">Failed</option>
                        <option value="unauthorized">Unauthorized</option>
                        <option value="error">Error</option>
                      </>
                    ) : (
                      <>
                        <option value="active">Active</option>
                        <option value="resolved">Resolved</option>
                        <option value="false_positive">False Positive</option>
                      </>
                    )}
                  </CFormSelect>
                </CInputGroup>
              </CCol>
              <CCol md={3}>
                <CInputGroup>
                  <CInputGroupText>
                    <FontAwesomeIcon icon={faClock} />
                  </CInputGroupText>
                  <CFormSelect 
                    value={dateFilter}
                    onChange={handleDateFilterChange}
                  >
                    <option value="1d">Last 24 Hours</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="all">All Time</option>
                  </CFormSelect>
                </CInputGroup>
              </CCol>
              <CCol md={2}>
                <CButton 
                  color="primary" 
                  className="w-100"
                  onClick={() => activeTab === 'login-attempts' ? refetchAttempts() : refetchAlerts()}
                >
                  <FontAwesomeIcon icon={faSync} className="me-2" /> Refresh
                </CButton>
              </CCol>
            </CRow>
            
            <CTabContent>
              {/* Login Attempts Tab */}
              <CTabPane visible={activeTab === 'login-attempts'}>
                {isLoadingAttempts ? (
                  <div className="text-center my-5">
                    <CSpinner color="primary" />
                    <p className="mt-2">Loading login attempts...</p>
                  </div>
                ) : (
                  <CTable hover responsive striped className="border">
                    <CTableHead className="bg-light">
                      <CTableRow>
                        <CTableHeaderCell scope="col">Timestamp</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Identifier</CTableHeaderCell>
                        <CTableHeaderCell scope="col">IP Address</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Status</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Reason</CTableHeaderCell>
                        <CTableHeaderCell scope="col">User Agent</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {loginAttempts.length > 0 ? (
                        loginAttempts.map((attempt) => (
                          <CTableRow key={attempt._id}>
                            <CTableDataCell>{formatDate(attempt.timestamp)}</CTableDataCell>
                            <CTableDataCell>
                              <FontAwesomeIcon icon={faUser} className="me-2" />
                              {attempt.identifier}
                            </CTableDataCell>
                            <CTableDataCell>
                              <FontAwesomeIcon icon={faGlobe} className="me-2" />
                              {attempt.ipAddress}
                            </CTableDataCell>
                            <CTableDataCell>
                              <StatusBadge status={attempt.status} />
                            </CTableDataCell>
                            <CTableDataCell>
                              {attempt.reason || attempt.error || '-'}
                            </CTableDataCell>
                            <CTableDataCell className="text-truncate" style={{ maxWidth: '200px' }}>
                              {attempt.userAgent}
                            </CTableDataCell>
                          </CTableRow>
                        ))
                      ) : (
                        <CTableRow>
                          <CTableDataCell colSpan="6" className="text-center">
                            No login attempts found
                          </CTableDataCell>
                        </CTableRow>
                      )}
                    </CTableBody>
                  </CTable>
                )}
              </CTabPane>
              
              {/* Security Alerts Tab */}
              <CTabPane visible={activeTab === 'security-alerts'}>
                {isLoadingAlerts ? (
                  <div className="text-center my-5">
                    <CSpinner color="primary" />
                    <p className="mt-2">Loading security alerts...</p>
                  </div>
                ) : (
                  <CTable hover responsive striped className="border">
                    <CTableHead className="bg-light">
                      <CTableRow>
                        <CTableHeaderCell scope="col">Timestamp</CTableHeaderCell>
                        <CTableHeaderCell scope="col">User ID</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Alert Type</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Status</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Details</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {securityAlerts.length > 0 ? (
                        securityAlerts.map((alert) => (
                          <CTableRow key={alert._id}>
                            <CTableDataCell>{formatDate(alert.timestamp)}</CTableDataCell>
                            <CTableDataCell>
                              <FontAwesomeIcon icon={faUserShield} className="me-2" />
                              {alert.userId}
                            </CTableDataCell>
                            <CTableDataCell>
                              <CBadge color="warning" className="me-1">
                                {alert.alertType.replace(/_/g, ' ')}
                              </CBadge>
                            </CTableDataCell>
                            <CTableDataCell>
                              <StatusBadge status={alert.status} />
                            </CTableDataCell>
                            <CTableDataCell>
                              {alert.details ? (
                                <div>
                                  {Object.entries(alert.details).map(([key, value]) => (
                                    <div key={key} className="small">
                                      <strong>{key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}:</strong> {value.toString()}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                '-'
                              )}
                            </CTableDataCell>
                            <CTableDataCell>
                              {alert.status === 'active' && (
                                <CButton 
                                  color="success" 
                                  size="sm"
                                  onClick={() => handleResolveAlert(alert._id)}
                                >
                                  <FontAwesomeIcon icon={faCheckCircle} className="me-1" /> Resolve
                                </CButton>
                              )}
                              {alert.status === 'active' && (
                                <CButton 
                                  color="secondary" 
                                  size="sm"
                                  className="ms-1"
                                  onClick={() => handleResolveAlert(alert._id, 'marked as false positive')}
                                >
                                  False Positive
                                </CButton>
                              )}
                              {alert.status !== 'active' && alert.resolution && (
                                <div className="small text-muted">
                                  <strong>Resolved by:</strong> {alert.resolution.resolvedBy || 'System'}<br />
                                  <strong>Notes:</strong> {alert.resolution.notes || '-'}
                                </div>
                              )}
                            </CTableDataCell>
                          </CTableRow>
                        ))
                      ) : (
                        <CTableRow>
                          <CTableDataCell colSpan="6" className="text-center">
                            No security alerts found
                          </CTableDataCell>
                        </CTableRow>
                      )}
                    </CTableBody>
                  </CTable>
                )}
              </CTabPane>
            </CTabContent>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default SecurityMonitoring;