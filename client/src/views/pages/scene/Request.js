import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSendMessageMutation } from '../../../state/adminApi'; // Assuming the RTK API slice is in services/api
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
  CCol 
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

  useEffect(() => {
    const storedUserId = sessionStorage.getItem('userId');
    const storedUserName = sessionStorage.getItem('name');
    const storedUserDepartment = sessionStorage.getItem('department');
    
    if (storedUserId) {
      setUserId(storedUserId);
      setMaskedUserId(maskUserId(storedUserId));
    }
    if (storedUserName) setUserName(storedUserName);
    if (storedUserDepartment) setUserDepartment(storedUserDepartment);
  }, []);

  const handlePermissionToggle = (permission) => {
    setSelectedPermissions(prev =>
      prev.includes(permission) ? prev.filter(p => p !== permission) : [...prev, permission]
    );
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
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

      setSubmitStatus({ success: true, message: 'Access request sent successfully!' });
      setSelectedPermissions([]);
    } catch (error) {
      setSubmitStatus({ success: false, message: error.data?.error || 'Failed to send request' });
    }
  };

  return (
    <CContainer className="vh-100 d-flex align-items-center justify-content-center bg-light">
      <CRow className="w-100 justify-content-center">
        <CCol md={10} lg={12}>
          <CCard className="shadow-lg">
            <CCardHeader className="bg-primary text-white d-flex align-items-center">
              <FontAwesomeIcon icon={faUserShield} className="me-2" />
              <strong>Access Request</strong>
            </CCardHeader>
            <CCardBody>
              <CForm>
                <CFormInput type="text" label="User ID" value={maskedUserId} readOnly className="bg-light" />
                <label className="form-label mt-3">Select Permissions</label>
                {AVAILABLE_PERMISSIONS.map((category) => (
                  <div key={category.category} className="mb-3">
                    <div className="d-flex justify-content-between align-items-center bg-light p-2 rounded cursor-pointer" onClick={() => toggleCategory(category.category)}>
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
                            <CFormCheck id={permission.key} label={permission.label} checked={selectedPermissions.includes(permission.key)} onChange={() => handlePermissionToggle(permission.key)} />
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
