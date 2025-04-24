import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSendMessageMutation } from '../../../state/adminApi';
import { 
  CCard, 
  CCardBody, 
  CCardHeader, 
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
import logActivity from './../../../utils/activityLogger';

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
      { key: '/leave', label: 'Leave Management' },
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

  const [sendMessage, { isLoading }] = useSendMessageMutation();
  const { colorMode } = useColorModes();
  const isDarkMode = colorMode === 'dark';

  const storedTheme = useSelector((state) => state.changeState?.theme);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    const storedUserName = localStorage.getItem('name');
    const storedUserDepartment = localStorage.getItem('department');
    const userRole = localStorage.getItem('role');
    
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
      role: localStorage.getItem('role'),
      department: userDepartment,
      route: '/access-request',
      action: 'Toggle Permission',
      description: `User ${selectedPermissions.includes(permission) ? 'removed' : 'added'} permission: ${permission}`
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
        role: localStorage.getItem('role'),
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
        role: localStorage.getItem('role'),
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
    color: '#fff',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '16px'
  } : {
    backgroundColor: '#f8f9fa',
    color: '#000',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '16px'
  };

  const inputStyle = isDarkMode ? {
    backgroundColor: '#3a3a3a',
    color: '#fff',
    borderColor: '#666'
  } : {
    backgroundColor: '#f8f9fa',
    color: '#000'
  };

  const stickyContainerStyle = {
    position: 'sticky',
    top: '20px',
    maxHeight: '90vh',
    overflowY: 'auto'
  };

  return (
    <CContainer fluid className={`py-4 ${isDarkMode ? 'bg-dark' : 'bg-light'}`}>
      <CRow className="justify-content-center">
        <CCol md={8} lg={6}>
          <div style={stickyContainerStyle}>
            <CCard className="shadow-lg mb-4" style={cardStyle}>
              <CCardHeader className="d-flex align-items-center" style={headerStyle}>
                <FontAwesomeIcon icon={faUserShield} className="me-2" />
                <strong>Access Request</strong>
              </CCardHeader>
              <CCardBody>
                <CFormInput 
                  type="text" 
                  label="User ID" 
                  value={maskedUserId} 
                  readOnly 
                  style={inputStyle} 
                  className="mb-4"
                />
                
                <label className={`form-label ${isDarkMode ? 'text-light' : ''}`}>Available Permissions</label>
                
                {AVAILABLE_PERMISSIONS.map((category) => (
                  <div key={category.category} className="mb-4">
                    <div className="d-flex align-items-center mb-2" style={categoryStyle}>
                      <FontAwesomeIcon icon={category.icon} className="me-2 text-primary" />
                      <strong>{category.category}</strong>
                    </div>
                    
                    <CRow>
                      {category.permissions.map((permission) => (
                        <CCol xs={12} md={6} key={permission.key} className="mb-3">
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
                  </div>
                ))}
                
                {submitStatus && (
                  <div className={`alert ${submitStatus.success ? 'alert-success' : 'alert-danger'} d-flex align-items-center mt-3`}>
                    <FontAwesomeIcon icon={submitStatus.success ? faCheckCircle : faTimesCircle} className="me-2" />
                    {submitStatus.message}
                  </div>
                )}
                
                <CButton 
                  color="primary" 
                  className="w-100 mt-3" 
                  onClick={handleSubmitRequest} 
                  disabled={isLoading || !userId}
                >
                  {isLoading ? 'Sending Request...' : 'Submit Access Request'}
                </CButton>
              </CCardBody>
            </CCard>
          </div>
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default AccessRequestPage;