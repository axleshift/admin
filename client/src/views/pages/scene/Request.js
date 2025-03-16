import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSendMessageMutation } from '../../../state/adminApi';
import { 
  CCard, 
  CCardBody, 
  CCardHeader, 
  CForm, 
  CFormInput, 
  CFormCheck, 
  CButton, 
  CContainer, 
  CRow, 
  CCol,
  useColorModes
} from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserShield, 
  faCheckCircle, 
  faTimesCircle, 
  faUser,
  faHandshake,
  faShippingFast,
  faMoneyBillWave,
  faBell
} from '@fortawesome/free-solid-svg-icons';
import logActivity from './../../../utils/logActivity' 

const maskUserId = (userId) => {
  if (!userId) return '';
  return userId.length <= 2 ? '*'.repeat(userId.length) : `${userId[0]}${'*'.repeat(userId.length - 2)}${userId[userId.length - 1]}`;
};

const AVAILABLE_PERMISSIONS = [
  {
    category: 'HR',
    icon: faUser,
    permissions: [
      { key: '/worker', label: 'Employees' },
      { key: '/jobposting', label: 'Job Postings' },
      { key: '/payroll', label: 'Payroll Management' },
    ]
  },
  {
    category: 'Finance',
    icon: faMoneyBillWave,
    permissions: [
      { key: '/freight/transaction', label: 'Transactions' },
      { key: '/invoice', label: 'Invoicing' },
      { key: '/financialanalytics', label: 'Financial Analytics' },
      { key: '/oversales', label: 'Oversales' },
      { key: '/freightaudit', label: 'Freight Audit' },
    ]
  },
  {
    category: 'Logistics',
    icon: faShippingFast,
    permissions: [
      { key: '/freight/transaction', label: 'Freight Transactions' },
      { key: '/logistic1/index', label: 'Logistics Index' },
    ]
  },
  {
    category: 'Core',
    icon: faHandshake,
    permissions: [
      { key: '/customer', label: 'Customer' },
      { key: '/monthly', label: 'Monthly' },
      { key: '/daily', label: 'Daily' },
      { key: '/breakdown', label: 'Breakdown' },
      { key: '/shipment', label: 'Shipment Management' },
    ]
  },
  {
    category: 'Administrative',
    icon: faBell,
    permissions: [
      { key: '/useractivity/index', label: 'User Activity'},
      { key: '/announce', label: 'Announcements' },
      { key: '/recovery', label: 'Recovery' },
      { key: '/registernew', label: 'New User Registration' },
      { key: '/PendingRequest', label: 'Pending Requests' },
      { key: '/AccessReview', label: 'Access Review' },
      { key: '/monitoring', label: 'User Monitoring' },
      { key: '/restore', label: 'System Restore' },
    ]
  }
];

const AccessRequestPage = () => {
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [userDepartment, setUserDepartment] = useState('');
  const [maskedUserId, setMaskedUserId] = useState('');
  const [submitStatus, setSubmitStatus] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});

  const [sendMessage, { isLoading }] = useSendMessageMutation();
  const { colorMode } = useColorModes();
  const isDarkMode = colorMode === 'dark';

  const storedTheme = useSelector((state) => state.changeState?.theme);

  useEffect(() => {
    const storedUserId = sessionStorage.getItem('userId');
    const storedUserName = sessionStorage.getItem('name');
    const storedUserDepartment = sessionStorage.getItem('department');
    const userRole = sessionStorage.getItem('role');
    
    if (storedUserId) {
      setUserId(storedUserId);
      setMaskedUserId(maskUserId(storedUserId));
    }
    if (storedUserName) setUserName(storedUserName);
    if (storedUserDepartment) setUserDepartment(storedUserDepartment);

    logActivity({
      name: storedUserName,
      role: userRole,
      department: storedUserDepartment,
      route: '/access-request',
      action: 'Page Visit',
      description: 'User visited the access request page'
    });
  }, []);

  const handlePermissionToggle = (permission) => {
    const newSelectedPermissions = selectedPermissions.includes(permission) 
      ? selectedPermissions.filter(p => p !== permission) 
      : [...selectedPermissions, permission];
    
    setSelectedPermissions(newSelectedPermissions);
    
    logActivity({
      name: userName,
      role: sessionStorage.getItem('role'),
      department: userDepartment,
      route: '/access-request',
      action: 'Toggle Permission',
      description: `User ${selectedPermissions.includes(permission) ? 'removed' : 'added'} permission: ${permission}`
    });
  };

  const toggleCategory = (category) => {
    const newExpandedState = { ...expandedCategories, [category]: !expandedCategories[category] };
    setExpandedCategories(newExpandedState);
    
    logActivity({
      name: userName,
      role: sessionStorage.getItem('role'),
      department: userDepartment,
      route: '/access-request',
      action: 'Toggle Category',
      description: `User ${expandedCategories[category] ? 'collapsed' : 'expanded'} category: ${category}`
    });
  };

  const handleSubmitRequest = async () => {
    setSubmitStatus(null);

    if (!userId || !userName || !userDepartment || selectedPermissions.length === 0) {
      setSubmitStatus({ success: false, message: 'Ensure all fields are filled and at least one permission is selected.' });
      return;
    }

    try {
      const response = await sendMessage({
        requestType: 'AccessRequest',
        pageName: selectedPermissions[0] || '',
        name: userName,
        department: userDepartment,
        username: userId,
        requestDetails: { permissions: selectedPermissions }
      }).unwrap();

      logActivity({
        name: userName,
        role: sessionStorage.getItem('role'),
        department: userDepartment,
        route: '/access-request',
        action: 'Submit Request',
        description: `User submitted access request for permissions: ${selectedPermissions.join(', ')}`
      });

      setSubmitStatus({ success: true, message: 'Access request sent successfully!' });
      setSelectedPermissions([]);
    } catch (error) {
      logActivity({
        name: userName,
        role: sessionStorage.getItem('role'),
        department: userDepartment,
        route: '/access-request',
        action: 'Submit Request Failed',
        description: `User failed to submit access request: ${error.data?.error || 'Unknown error'}`
      });

      setSubmitStatus({ success: false, message: error.data?.error || 'Failed to send request' });
    }
  };

  const cardStyle = isDarkMode ? {
    backgroundColor: '#2c2c34',
    color: '#fff'
  } : {};

  const headerStyle = isDarkMode ? {
    backgroundColor: '#3c4b64',
    color: '#fff'
  } : {
    backgroundColor: '#321fdb',
    color: '#fff'
  };

  const categoryStyle = isDarkMode ? {
    backgroundColor: '#3a3a3a',
    color: '#fff'
  } : {
    backgroundColor: '#f8f9fa',
    color: '#000'
  };

  const inputStyle = isDarkMode ? {
    backgroundColor: '#3a3a3a',
    color: '#fff',
    borderColor: '#666'
  } : {
    backgroundColor: '#f8f9fa',
    color: '#000'
  };

  return (
    <CContainer className={`vh-100 d-flex align-items-center justify-content-center ${isDarkMode ? 'bg-dark' : 'bg-light'}`}>
      <CRow className="w-100 justify-content-center">
        <CCol md={10} lg={12}>
          <CCard className="shadow-lg" style={cardStyle}>
            <CCardHeader className="d-flex align-items-center" style={headerStyle}>
              <FontAwesomeIcon icon={faUserShield} className="me-2" />
              <strong>Access Request</strong>
            </CCardHeader>
            <CCardBody>
              <CForm>
                <CFormInput 
                  type="text" 
                  label="User ID" 
                  value={maskedUserId} 
                  readOnly 
                  style={inputStyle} 
                />
                <label className={`form-label mt-3 ${isDarkMode ? 'text-light' : ''}`}>Select Permissions</label>
                {AVAILABLE_PERMISSIONS.map((category) => (
                  <div key={category.category} className="mb-3">
                    <div 
                      className="d-flex justify-content-between align-items-center p-2 rounded cursor-pointer" 
                      style={categoryStyle}
                      onClick={() => toggleCategory(category.category)}
                    >
                      <div>
                        <FontAwesomeIcon icon={category.icon} className="me-2 text-primary" />
                        <strong>{category.category}</strong>
                      </div>
                      <span>{expandedCategories[category.category] ? '▼' : '►'}</span>
                    </div>
                    {expandedCategories[category.category] && (
                      <CRow className="mt-2">
                        {category.permissions.map((permission) => (
                          <CCol xs={6} md={4} key={permission.key} className="mb-2">
                            <CFormCheck 
                              id={permission.key} 
                              label={permission.label} 
                              checked={selectedPermissions.includes(permission.key)} 
                              onChange={() => handlePermissionToggle(permission.key)} 
                              className={isDarkMode ? 'text-light' : ''}
                            />
                          </CCol>
                        ))}
                      </CRow>
                    )}
                  </div>
                ))}
                {submitStatus && (
                  <div className={`alert ${submitStatus.success ? 'alert-success' : 'alert-danger'} d-flex align-items-center`}>
                    <FontAwesomeIcon icon={submitStatus.success ? faCheckCircle : faTimesCircle} className="me-2" />
                    {submitStatus.message}
                  </div>
                )}
                <CButton color="primary" className="w-100 mt-3" onClick={handleSubmitRequest} disabled={isLoading || !userId}>
                  {isLoading ? 'Sending Request...' : 'Submit Access Request'}
                </CButton>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default AccessRequestPage;