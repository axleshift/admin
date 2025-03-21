import React, { useState, useEffect } from 'react';
import { useGetNewUserQuery } from '../../../state/hrApi';
import { useSaveUserMutation } from '../../../state/adminApi';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CFormInput,
  CFormSelect,
  CButton,
  CSpinner,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CAlert
} from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserPlus, 
  faSave, 
  faSync, 
  faEye, 
  faEyeSlash, 
  faShieldAlt 
} from '@fortawesome/free-solid-svg-icons';
import logActivity from '../../../utils/activityLogger';
import SecurityAssistant from './SecurityAssist'; // Import the new component

const HRUsersPage = () => {
  const { data: users, isLoading, isError, refetch } = useGetNewUserQuery();
  const [saveUser] = useSaveUserMutation();  
  const [currentUser, setCurrentUser] = useState(null);

  const departments = ['Administrative', 'Finance', 'HR', 'Core', 'Logistics'];
  const [selectedUsers, setSelectedUsers] = useState({});
  const [showPassword, setShowPassword] = useState({});
  const [securityStatus, setSecurityStatus] = useState({});
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [selectedUserForSecurity, setSelectedUserForSecurity] = useState(null);
  
  useEffect(() => {
    try {
      const userString = localStorage.getItem('currentUser');
      if (userString) {
        const user = JSON.parse(userString);
        setCurrentUser(user);
        
        logActivity({
          name: user.name || 'Unknown User',
          role: user.role || 'Unknown Role',
          department: user.department || 'Unknown Department',
          route: 'hr/users',
          action: 'VIEW',
          description: 'Accessed new users registration page'
        });
      }
    } catch (error) {
      console.error('Failed to get current user:', error);
    }
  }, []);
// Fix the getRolesForDepartment function
const getRolesForDepartment = (department) => {
  if (!department) return [];
  
  // Normalize department name for consistent comparison
  const normalizedDept = department.toLowerCase();
  
  if (normalizedDept === 'finance') {
    return ['user', 'admin', 'staff', 'superadmin', 'technician'];
  } 
  else if (normalizedDept === 'administrative' || normalizedDept === 'admin'){
    return ['admin', 'manager', 'superadmin'];
  }
  else if (normalizedDept === "logistics"){
    return ['Admin', 'Manager', 'Employee', 'Contractor'];
  }
  else if (normalizedDept === "core"){
    return ['Admin', 'Manager', 'Employee', 'Contractor'];
  }
  else if (normalizedDept === "hr"){
    return ['Admin', 'Manager', 'Employee', 'Contractor'];
  }
  
  return [];
};

  const handlePasswordChange = (userId, password) => {
    setSelectedUsers({
      ...selectedUsers,
      [userId]: { ...selectedUsers[userId], password }
    });
  };

  const toggleShowPassword = (userId) => {
    setShowPassword({
      ...showPassword,
      [userId]: !showPassword[userId]
    });
  };

  const handleDepartmentChange = (userId, department) => {
    setSelectedUsers({
      ...selectedUsers,
      [userId]: { ...selectedUsers[userId], department, role: '' }
    });
  };

  const handleRoleChange = (userId, role) => {
    setSelectedUsers({
      ...selectedUsers,
      [userId]: { ...selectedUsers[userId], role }
    });
  };
  
  // Handler for security status updates from the SecurityAssistant component
  const handleSecurityUpdate = (userId, status) => {
    setSecurityStatus({
      ...securityStatus,
      [userId]: status
    });
  };
  
  // Show security analysis modal
  const openSecurityModal = (user) => {
    const userId = user.id || user._id || user.email;
    const userData = {
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: selectedUsers[userId]?.password || '',
      role: selectedUsers[userId]?.role || '',
      department: selectedUsers[userId]?.department || ''
    };
    
    setSelectedUserForSecurity(userData);
    setShowSecurityModal(true);
  };

  const handleSaveUser = async (user) => {
    const userId = user.id || user._id || user.email;
    const userData = selectedUsers[userId] || {};
    
    // Check if security analysis has been performed and if it passed
    const userSecurityStatus = securityStatus[userId];
    if (!userSecurityStatus || !userSecurityStatus.isSecure) {
      // Show security modal if security hasn't been checked or failed
      openSecurityModal(user);
      return;
    }
    
    const payload = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: userData.password || '',
      role: userData.role || '',
      department: userData.department || ''
    };

    try {
      const response = await saveUser(payload).unwrap();
      console.log('User saved successfully:', response);
      
      if (currentUser) {
        const detailedDescription = `Registered new user: ${user.firstName} ${user.lastName} (${user.email}) with role: ${userData.role} in department: ${userData.department}`;
        
        logActivity({
          name: currentUser.name || 'Unknown User',
          role: currentUser.role || 'Unknown Role',
          department: currentUser.department || 'Unknown Department',
          route: 'hr/users',
          action: 'CREATE',
          description: detailedDescription
        });
      }
      
      refetch();
    } catch (error) {
      console.error('Error saving user:', error);
      
      if (currentUser) {
        logActivity({
          name: currentUser.name || 'Unknown User',
          role: currentUser.role || 'Unknown Role',
          department: currentUser.department || 'Unknown Department',
          route: 'hr/users',
          action: 'ERROR',
          description: `Failed to register user: ${user.firstName} ${user.lastName} (${user.email}). Error: ${error.message || 'Unknown error'}`
        });
      }
      
      if (error.data && error.data.error) {
        console.error('Validation error:', error.data.error);
      }
    }
  };

  // Prepare user data for security analysis
  const getUserDataForSecurity = (user) => {
    if (!user) return null;
    
    const userId = user.id || user._id || user.email;
    const userData = selectedUsers[userId] || {};
    
    return {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: userData.password || '',
      role: userData.role || '',
      department: userData.department || ''
    };
  };

  return (
    <>
      <CRow>
        <CCol md={12}>
          <CCard>
            <CCardHeader>
              <h4><FontAwesomeIcon icon={faUserPlus} className="me-2" />New Users</h4>
            </CCardHeader>
            <CCardBody>
              <CTable hover responsive className="align-middle">
                <CTableHead color="light">
                  <CTableRow>
                    <CTableHeaderCell>First Name</CTableHeaderCell>
                    <CTableHeaderCell>Last Name</CTableHeaderCell>
                    <CTableHeaderCell>Email</CTableHeaderCell>
                    <CTableHeaderCell>Password</CTableHeaderCell>
                    <CTableHeaderCell>Department</CTableHeaderCell>
                    <CTableHeaderCell>Role</CTableHeaderCell>
                    <CTableHeaderCell>Security</CTableHeaderCell>
                    <CTableHeaderCell>Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                {users && users.map((user) => {
                  const userId = user.id || user._id || user.email;
                  const selectedDepartment = selectedUsers[userId]?.department || '';
                  const availableRoles = getRolesForDepartment(selectedDepartment);
                  const userSecurityStatus = securityStatus[userId] || {};
                  const securityColor = userSecurityStatus?.isSecure ? 'success' : 
                                    (userSecurityStatus ? 'warning' : 'secondary');

                  return (
                    <CTableRow key={userId}>
                      <CTableDataCell>{user.firstName}</CTableDataCell>
                      <CTableDataCell>{user.lastName}</CTableDataCell>
                      <CTableDataCell>{user.email}</CTableDataCell>
                      <CTableDataCell>
                        <div className="d-flex align-items-center">
                          <CFormInput
                            type={showPassword[userId] ? "text" : "password"}
                            placeholder="Set password"
                            value={selectedUsers[userId]?.password || ''}
                            onChange={(e) => handlePasswordChange(userId, e.target.value)}
                          />
                          <CButton 
                            color="link" 
                            onClick={() => toggleShowPassword(userId)}
                            className="ms-2"
                          >
                            <FontAwesomeIcon icon={showPassword[userId] ? faEyeSlash : faEye} />
                          </CButton>
                        </div>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CFormSelect
                          value={selectedUsers[userId]?.department || ''}
                          onChange={(e) => handleDepartmentChange(userId, e.target.value)}
                        >
                          <option value="">Select department</option>
                          {departments.map((dept) => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </CFormSelect>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CFormSelect
                          value={selectedUsers[userId]?.role || ''}
                          onChange={(e) => handleRoleChange(userId, e.target.value)}
                          disabled={!selectedUsers[userId]?.department}
                        >
                          <option value="">Select role</option>
                          {availableRoles.map((role) => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </CFormSelect>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CButton 
                          color={securityColor}
                          size="sm"
                          onClick={() => openSecurityModal(user)}
                        >
                          <FontAwesomeIcon icon={faShieldAlt} className="me-1" />
                          {userSecurityStatus?.isSecure ? 'Secure' : 'Check'}
                        </CButton>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CButton 
                          color="primary"
                          onClick={() => handleSaveUser(user)}
                          disabled={!selectedUsers[userId]?.department || !selectedUsers[userId]?.role || !selectedUsers[userId]?.password}
                        >
                          <FontAwesomeIcon icon={faSave} className="me-1" />
                          Save
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  );
                })}
              </CTableBody>
              </CTable>
              {isLoading && (
                <div className="text-center my-3">
                  <CSpinner color="primary" />
                </div>
              )}
              {isError && (
                <CAlert color="danger" className="mt-3">
                  Error loading new users. Please try again.
                </CAlert>
              )}
              {users && users.length === 0 && (
                <CAlert color="info" className="mt-3">
                  No new user registrations pending.
                </CAlert>
              )}
              <div className="d-flex justify-content-end mt-3">
                <CButton color="secondary" onClick={refetch}>
                  <FontAwesomeIcon icon={faSync} className="me-1" />
                  Refresh
                </CButton>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Security Modal */}
      <CModal 
        visible={showSecurityModal} 
        onClose={() => setShowSecurityModal(false)}
        size="lg"
      >
        <CModalHeader onClose={() => setShowSecurityModal(false)}>
          <CModalTitle>Security Analysis</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedUserForSecurity && (
            <SecurityAssistant 
              userData={selectedUserForSecurity} 
              onSecurityUpdate={(status) => {
                handleSecurityUpdate(selectedUserForSecurity.userId, status);
              }}
            />
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowSecurityModal(false)}>
            Close
          </CButton>
          {selectedUserForSecurity && securityStatus[selectedUserForSecurity.userId]?.isSecure && (
            <CButton 
              color="success" 
              onClick={() => {
                setShowSecurityModal(false);
                // Find original user object to save
                const userToSave = users.find(u => {
                  const id = u.id || u._id || u.email;
                  return id === selectedUserForSecurity.userId;
                });
                if (userToSave) {
                  handleSaveUser(userToSave);
                }
              }}
            >
              <FontAwesomeIcon icon={faSave} className="me-1" />
              Save User
            </CButton>
          )}
        </CModalFooter>
      </CModal>
    </>
  );
};

export default HRUsersPage;