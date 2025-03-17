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
  FaSuitcaseRolling,
  FaHistory,
  FaUser,
  FaRoute,
  FaClipboardList
} from 'react-icons/fa';


import { useGetSecurityAlertsQuery, useGetLoginAttemptsQuery} from '../../../state/adminApi';
import logActivity from './../../../utils/activityLogger';

const SecurityDashboard = () => {
  const [activeTab, setActiveTab] = useState('alerts');
  const [currentUser, setCurrentUser] = useState({
    name: '',
    role: '',
    department: ''
  });
  
  
  useEffect(() => {
    
    const userInfo = {
      name: localStorage.getItem('userName') || 'Admin User',
      role: localStorage.getItem('userRole') || 'Administrator',
      department: localStorage.getItem('userDepartment') || 'IT Security'
    };
    setCurrentUser(userInfo);
  }, []);
  
  
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

  const [activityFilters, setActivityFilters] = useState({
    name: '',
    action: '',
    route: ''
  });

  
  const prepareLoginQuery = () => {
    const queryParams = { ...loginFilters };
    
    
    if (queryParams.status === 'attempt') {
      
      
      delete queryParams.status;
      queryParams.emptyUserId = true;
    }
    
    return queryParams;
  };

  
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

  const {
    data: userActivities = [],
    isLoading: activitiesLoading,
    error: activitiesError
  } = useGetUserActivitiesQuery(activityFilters);

  
  const loginAttempts = React.useMemo(() => {
    if (loginFilters.status === 'attempt') {
      
      return loginAttemptsRaw.filter(attempt => 
        !attempt.userId || attempt.userId === '' || 
        attempt.userId === null || attempt.userId === undefined
      );
    } else if (loginFilters.status === 'success' || loginFilters.status === 'failed') {
      
      return loginAttemptsRaw.filter(attempt => 
        attempt.status === loginFilters.status && 
        attempt.userId && attempt.userId !== '' && 
        attempt.userId !== null && attempt.userId !== undefined
      );
    } else {
      
      return loginAttemptsRaw;
    }
  }, [loginAttemptsRaw, loginFilters.status]);

  
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    
    
    logActivity({
      name: currentUser.name,
      role: currentUser.role,
      department: currentUser.department,
      route: `/security/${tabName}`,
      action: 'Tab Change',
      description: `User navigated to ${tabName} tab in Security Dashboard`
    });
  };

  
  const handleAlertFilterChange = (e) => {
    const { name, value } = e.target;
    setAlertFilters(prev => ({
      ...prev,
      [name]: value
    }));
    
    
    logActivity({
      name: currentUser.name,
      role: currentUser.role,
      department: currentUser.department,
      route: '/security/alerts',
      action: 'Filter Change',
      description: `User filtered alerts by ${name}=${value}`
    });
  };

  
  const handleLoginFilterChange = (e) => {
    const { name, value } = e.target;
    setLoginFilters(prev => ({
      ...prev,
      [name]: value
    }));
    
    
    logActivity({
      name: currentUser.name,
      role: currentUser.role,
      department: currentUser.department,
      route: '/security/logins',
      action: 'Filter Change',
      description: `User filtered login attempts by ${name}=${value}`
    });
  };

  
  const handleActivityFilterChange = (e) => {
    const { name, value } = e.target;
    setActivityFilters(prev => ({
      ...prev,
      [name]: value
    }));
    
    
    logActivity({
      name: currentUser.name,
      role: currentUser.role,
      department: currentUser.department,
      route: '/security/activity',
      action: 'Filter Change',
      description: `User filtered activity logs by ${name}=${value}`
    });
  };
  
  
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };
  
  
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
  
  
  const getAlertTypeBadgeColor = (type) => {
    switch (type) {
      case 'SUSPICIOUS_LOGIN': return 'warning';
      case 'BRUTE_FORCE': return 'danger';
      case 'MULTIPLE_FAILURES': return 'danger';
      case 'UNUSUAL_LOCATION': return 'info';
      default: return 'secondary';
    }
  };

  
  const getActivityBadgeColor = (action) => {
    switch (action.toUpperCase()) {
      case 'LOGIN': return 'success';
      case 'LOGOUT': return 'info';
      case 'TAB CHANGE': return 'secondary';
      case 'FILTER CHANGE': return 'primary';
      case 'BUTTON CLICK': return 'warning';
      case 'DATA EXPORT': return 'dark';
      case 'ALERT ACTION': return 'danger';
      default: return 'light';
    }
  };

  
  const renderSafely = (data) => {
    if (data === null || data === undefined) return '-';
    if (typeof data === 'object') {
      
      if (data.name) return data.name;
      if (data.id) return data.id;
      if (data.toString && data.toString() !== '[object Object]') return data.toString();
      return JSON.stringify(data);
    }
    return data;
  };

  
  const determineLoginStatus = (attempt) => {
    
    if (!attempt.userId || attempt.userId === '' || attempt.userId === null || attempt.userId === undefined) {
      return 'attempt';
    }
    
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
                onClick={() => handleTabChange('alerts')}
              >
                <FaExclamationTriangle className="me-2" /> Security Alerts
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink 
                active={activeTab === 'logins'}
                onClick={() => handleTabChange('logins')}
              >
                <FaKey className="me-2" /> Login Attempts
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink 
                active={activeTab === 'activity'}
                onClick={() => handleTabChange('activity')}
              >
                <FaHistory className="me-2" /> User Activity
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
          
          {/* User Activity Tab */}
          {activeTab === 'activity' && (
            <CCard className="mb-4">
              <CCardHeader>
                <strong><FaHistory className="me-2" /> User Activity Logs</strong>
              </CCardHeader>
              <CCardBody>
                {/* Filters */}
                <CRow className="mb-3 filter-section">
                  <CCol sm={12}>
                    <h6><FaFilter className="me-2" /> Filters</h6>
                  </CCol>
                  <CCol sm={3}>
                    <CFormInput 
                      placeholder="User Name"
                      name="name"
                      value={activityFilters.name}
                      onChange={handleActivityFilterChange}
                      className="mb-2"
                    />
                  </CCol>
                  <CCol sm={3}>
                    <CFormInput 
                      placeholder="Route"
                      name="route"
                      value={activityFilters.route}
                      onChange={handleActivityFilterChange}
                      className="mb-2"
                    />
                  </CCol>
                  <CCol sm={3}>
                    <CFormSelect 
                      name="action"
                      value={activityFilters.action}
                      onChange={handleActivityFilterChange}
                      className="mb-2"
                    >
                      <option value="">All Actions</option>
                      <option value="Login">Login</option>
                      <option value="Logout">Logout</option>
                      <option value="Tab Change">Tab Change</option>
                      <option value="Filter Change">Filter Change</option>
                      <option value="Button Click">Button Click</option>
                      <option value="Data Export">Data Export</option>
                      <option value="Alert Action">Alert Action</option>
                    </CFormSelect>
                  </CCol>
                  <CCol sm={3}>
                    <CButton 
                      color="secondary"
                      onClick={() => {
                        setActivityFilters({
                          name: '',
                          action: '',
                          route: ''
                        });
                        
                        
                        logActivity({
                          name: currentUser.name,
                          role: currentUser.role,
                          department: currentUser.department,
                          route: '/security/activity',
                          action: 'Reset Filters',
                          description: 'User reset activity filters'
                        });
                      }}
                      className="mb-2"
                    >
                      Reset Filters
                    </CButton>
                  </CCol>
                </CRow>
                
                {/* Error Handling */}
                {activitiesError && <div className="alert alert-danger">
                  Failed to load user activities: {activitiesError.toString()}
                </div>}
                
                {/* User Activity Table */}
                {activitiesLoading ? (
                  <div className="text-center py-5">
                    <CSpinner color="primary" />
                    <p className="mt-3">Loading user activities...</p>
                  </div>
                ) : (
                  <CTable hover responsive>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Timestamp</CTableHeaderCell>
                        <CTableHeaderCell>User</CTableHeaderCell>
                        <CTableHeaderCell>Role</CTableHeaderCell>
                        <CTableHeaderCell>Department</CTableHeaderCell>
                        <CTableHeaderCell>Action</CTableHeaderCell>
                        <CTableHeaderCell>Route</CTableHeaderCell>
                        <CTableHeaderCell>Description</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {userActivities.length === 0 ? (
                        <CTableRow>
                          <CTableDataCell colSpan="7" className="text-center">
                            No user activities found
                          </CTableDataCell>
                        </CTableRow>
                      ) : (
                        userActivities.map(activity => (
                          <CTableRow key={activity._id}>
                            <CTableDataCell>
                              <FaClock className="me-1" />
                              {activity.timestamp ? formatDate(activity.timestamp) : '-'}
                            </CTableDataCell>
                            <CTableDataCell>
                              <FaUser className="me-1" />
                              {renderSafely(activity.name)}
                            </CTableDataCell>
                            <CTableDataCell>
                              <FaSuitcaseRolling className="me-1" />
                              {renderSafely(activity.role)}
                            </CTableDataCell>
                            <CTableDataCell>
                              <FaBuilding className="me-1" />
                              {renderSafely(activity.department)}
                            </CTableDataCell>
                            <CTableDataCell>
                              <CBadge color={getActivityBadgeColor(activity.action)}>
                                {renderSafely(activity.action)}
                              </CBadge>
                            </CTableDataCell>
                            <CTableDataCell>
                              <FaRoute className="me-1" />
                              {renderSafely(activity.route)}
                            </CTableDataCell>
                            <CTableDataCell>
                              <FaClipboardList className="me-1" />
                              {renderSafely(activity.description)}
                            </CTableDataCell>
                          </CTableRow>
                        ))
                      )}
                    </CTableBody>
                  </CTable>
                )}
                
                {/* Export Button */}
                <CRow className="mt-3">
                  <CCol sm={12}>
                    <CButton 
                      color="primary"
                      onClick={() => {
                        
                        
                        
                        logActivity({
                          name: currentUser.name,
                          role: currentUser.role,
                          department: currentUser.department,
                          route: '/security/activity',
                          action: 'Data Export',
                          description: 'User exported activity logs'
                        });
                        
                        
                        alert('Activity logs exported successfully');
                      }}
                    >
                      Export Activity Logs
                    </CButton>
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>
          )}
        </CCol>
      </CRow>
    </div>
  );
};

export default SecurityDashboard;