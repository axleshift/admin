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
  CSpinner
} from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faSave, faSync, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import logActivity from '../../../utils/ActivityLogger'; // Import the logActivity function

const HRUsersPage = () => {
  const { data: users, isLoading, isError, refetch } = useGetNewUserQuery();
  const [saveUser] = useSaveUserMutation();  
  const [currentUser, setCurrentUser] = useState(null);

  const departments = ['Administrative', 'Finance', 'HR', 'Core', 'Logistics'];
  const [selectedUsers, setSelectedUsers] = useState({});
  const [showPassword, setShowPassword] = useState({});

  // Get current user information from local storage or context
  useEffect(() => {
    try {
      const userString = localStorage.getItem('currentUser');
      if (userString) {
        const user = JSON.parse(userString);
        setCurrentUser(user);
        
        // Log page view when component mounts
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

  const getRolesForDepartment = (department) => {
    if (department === 'Finance') {
      return ['user', 'admin', 'staff', 'superadmin', 'technician'];
    } 
    else if (department === 'Adminstrative' || 'Admin'){
      return ['admin', 'manager', 'superadmin'];
    }
    else if (department === "Logistics"){
      return ['Admin', 'Manager', 'Employee', 'Contractor'];
    }
    else if (department === "Core"){
      return ['Admin', 'Manager', 'Employee', 'Contractor'];
    }
    else if (department === "HR"){
      return ['Admin', 'Manager', 'Employee', 'Contractor'];
    }
    // Return an empty array if the department doesn't match any defined category
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

  const handleSaveUser = async (user) => {
    const userData = selectedUsers[user.id] || {};
    const payload = {
      id: user.id,
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
      
      // Log user registration activity with detailed information
      if (currentUser) {
        // Create a detailed description including all user info
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
      
      // Log error in user registration
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
      
      // Log the detailed error message if available
      if (error.data && error.data.error) {
        console.error('Validation error:', error.data.error);
      }
    }
  };

  return (
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
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {users && users.map((user) => {
                  const userId = user.id || user._id || user.email;
                  const selectedDepartment = selectedUsers[userId]?.department || '';
                  const availableRoles = getRolesForDepartment(selectedDepartment);

                  return (
                    <CTableRow key={userId}>
                      <CTableDataCell>{user.firstName}</CTableDataCell>
                      <CTableDataCell>{user.lastName}</CTableDataCell>
                      <CTableDataCell>{user.email}</CTableDataCell>
                      <CTableDataCell>
                        <div className="d-flex align-items-center">
                          <CFormInput
                            type={showPassword[userId] ? 'text' : 'password'}
                            placeholder="Set password"
                            value={(selectedUsers[userId]?.password || '')}
                            onChange={(e) => handlePasswordChange(userId, e.target.value)}
                          />
                          <CButton 
                            variant="ghost" 
                            onClick={() => toggleShowPassword(userId)}
                            className="ms-2"
                          >
                            <FontAwesomeIcon icon={showPassword[userId] ? faEyeSlash : faEye} />
                          </CButton>
                        </div>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CFormSelect
                          value={selectedDepartment}
                          onChange={(e) => handleDepartmentChange(userId, e.target.value)}
                        >
                          <option value="">Select Department</option>
                          {departments.map((dept) => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </CFormSelect>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CFormSelect
                          value={(selectedUsers[userId]?.role || '')}
                          onChange={(e) => handleRoleChange(userId, e.target.value)}
                          disabled={!selectedDepartment}
                        >
                          <option value="">Select Role</option>
                          {availableRoles.map((role) => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </CFormSelect>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          color="primary"
                          size="sm"
                          onClick={() => handleSaveUser(user)}
                          disabled={!selectedDepartment || !selectedUsers[userId]?.role || !selectedUsers[userId]?.password}
                        >
                          <FontAwesomeIcon icon={faSave} className="me-2" />
                          Save
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  );
                })}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default HRUsersPage;