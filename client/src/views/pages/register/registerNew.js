import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../utils/axiosInstance';
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
  CFormSelect,
  CButton,
  CSpinner,
  CAlert
} from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserPlus, 
  faSave, 
  faSync,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';

const HRUsersPage = () => {
  // Keep the saveUser mutation from RTK Query
  const [saveUser, { isLoading: isSaving }] = useSaveUserMutation();
  
  // State for fetched users (replacing useGetNewUserQuery)
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  
  // Original state management
  const [selectedUsers, setSelectedUsers] = useState({});
  const [errors, setErrors] = useState({});
  const [saveStatus, setSaveStatus] = useState({});

  // Departments and roles configuration
  const departments = ['Administrative', 'Finance', 'HR', 'Core', 'Logistics'];
  
  const departmentRoles = {
    'Finance': ['User', 'Admin', 'Staff', 'Superadmin', 'Technician'],
    'Administrative': ['Admin', 'Manager', 'Superadmin'],
    'HR': ['Admin', 'Manager', 'Employee', 'Contractor'],
    'Core': ['Admin', 'Manager', 'Employee', 'Contractor'],
    'Logistics': ['Admin', 'Manager', 'Employee', 'Contractor']
  };

  // Fetch users from the API
  const fetchUsers = async () => {
    setIsLoading(true);
    setIsError(false);
    
    try {
      const response = await axiosInstance.get('/hr/newUsers');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to replace the refetch from RTK Query
  const refetch = () => {
    fetchUsers();
  };

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Validation helpers
  const validateUserSelection = (userId) => {
    const userSelection = selectedUsers[userId] || {};
    const newErrors = {};

    if (!userSelection.department) {
      newErrors.department = 'Department is required';
    }
    if (!userSelection.role) {
      newErrors.role = 'Role is required';
    }

    setErrors(prev => ({
      ...prev,
      [userId]: newErrors
    }));

    return Object.keys(newErrors).length === 0;
  };

  // Event Handlers
  const handleDepartmentChange = (userId, department) => {
    setSelectedUsers(prev => ({
      ...prev,
      [userId]: { 
        ...prev[userId], 
        department, 
        role: '' 
      }
    }));
    
    // Clear any previous errors
    setErrors(prev => ({
      ...prev,
      [userId]: {}
    }));
  };

  const handleRoleChange = (userId, role) => {
    setSelectedUsers(prev => ({
      ...prev,
      [userId]: { 
        ...prev[userId], 
        role 
      }
    }));
    
    // Clear any previous errors
    setErrors(prev => ({
      ...prev,
      [userId]: {}
    }));
  };

  // Remove user from local state after successful save
  const removeUserFromList = (userId) => {
    setUsers(currentUsers => currentUsers.filter(user => 
      (user._id || user.id) !== userId
    ));
    
    // Also clean up related state
    const newSelectedUsers = { ...selectedUsers };
    const newErrors = { ...errors };
    const newSaveStatus = { ...saveStatus };
    
    delete newSelectedUsers[userId];
    delete newErrors[userId];
    delete newSaveStatus[userId];
    
    setSelectedUsers(newSelectedUsers);
    setErrors(newErrors);
    setSaveStatus(newSaveStatus);
  };

  // Modified handleSaveUser function with user removal
  const handleSaveUser = async (user) => {
    const userId = user._id || user.id;
    
    // Validate user selection
    const isValid = validateUserSelection(userId);
    if (!isValid) return;

    // Prepare user data
    const userData = {
      id: userId,
      firstName: user.firstName || user.name?.split(' ')[0] || '',
      lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
      email: user.email,
      department: selectedUsers[userId].department,
      role: selectedUsers[userId].role
    };

    try {
      // Update save status to loading
      setSaveStatus(prev => ({
        ...prev,
        [userId]: { loading: true, error: null }
      }));

      // Attempt to save user using Redux mutation
      const result = await saveUser(userData).unwrap();

      // Success handling
      setSaveStatus(prev => ({
        ...prev,
        [userId]: { 
          loading: false, 
          error: null, 
          success: true 
        }
      }));

      // Remove the user from the list
      removeUserFromList(userId);
      
      // Display temporary success message (optional)
      setTimeout(() => {
        setSaveStatus(prev => {
          const newStatus = { ...prev };
          delete newStatus[userId];
          return newStatus;
        });
      }, 3000); // Remove success status after 3 seconds
      
    } catch (error) {
      // Error handling
      setSaveStatus(prev => ({
        ...prev,
        [userId]: { 
          loading: false, 
          error: error.data?.message || 'An unexpected error occurred', 
          success: false 
        }
      }));

      console.error('Save user error:', error);
    }
  };

  return (
    <CRow>
      <CCol md={12}>
        <CCard>
          <CCardHeader>
            <h4><FontAwesomeIcon icon={faUserPlus} className="me-2" />New Users Registration</h4>
          </CCardHeader>
          <CCardBody>
            <div className="d-flex justify-content-end mb-3">
              <CButton 
                color="info" 
                onClick={fetchUsers}
                disabled={isLoading}
              >
                <FontAwesomeIcon icon={faSync} className="me-2" />
                Refresh
              </CButton>
            </div>
            
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Name</CTableHeaderCell>
                  <CTableHeaderCell>Email</CTableHeaderCell>
                  <CTableHeaderCell>Department</CTableHeaderCell>
                  <CTableHeaderCell>Role</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {users?.map((user) => {
                  const userId = user._id || user.id;
                  const userSelection = selectedUsers[userId] || {};
                  const userErrors = errors[userId] || {};
                  const saveStatusForUser = saveStatus[userId] || {};
                  
                  // Handle different user data formats (MongoDB vs original)
                  const firstName = user.firstName || user.name?.split(' ')[0] || '';
                  const lastName = user.lastName || user.name?.split(' ').slice(1).join(' ') || '';

                  return (
                    <CTableRow key={userId}>
                      <CTableDataCell>
                        {firstName} {lastName}
                      </CTableDataCell>
                      <CTableDataCell>{user.email}</CTableDataCell>
                      <CTableDataCell>
                        <CFormSelect
                          value={userSelection.department || ''}
                          onChange={(e) => handleDepartmentChange(userId, e.target.value)}
                          invalid={!!userErrors.department}
                        >
                          <option value="">Select Department</option>
                          {departments.map((dept) => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </CFormSelect>
                        {userErrors.department && (
                          <div className="text-danger small">
                            {userErrors.department}
                          </div>
                        )}
                      </CTableDataCell>
                      <CTableDataCell>
                        <CFormSelect
                          value={userSelection.role || ''}
                          onChange={(e) => handleRoleChange(userId, e.target.value)}
                          disabled={!userSelection.department}
                          invalid={!!userErrors.role}
                        >
                          <option value="">Select Role</option>
                          {(departmentRoles[userSelection.department] || []).map((role) => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </CFormSelect>
                        {userErrors.role && (
                          <div className="text-danger small">
                            {userErrors.role}
                          </div>
                        )}
                      </CTableDataCell>
                      <CTableDataCell>
                        <CButton 
                          color={
                            saveStatusForUser.success ? 'success' : 
                            saveStatusForUser.error ? 'danger' : 'primary'
                          }
                          onClick={() => handleSaveUser(user)}
                          disabled={saveStatusForUser.loading || isSaving}
                        >
                          {saveStatusForUser.loading || isSaving ? (
                            <CSpinner size="sm" />
                          ) : (
                            <>
                              <FontAwesomeIcon icon={faSave} className="me-2" />
                              {saveStatusForUser.success ? 'Saved' : 
                               saveStatusForUser.error ? 'Retry' : 'Save'}
                            </>
                          )}
                        </CButton>
                        {saveStatusForUser.error && (
                          <div className="text-danger small mt-1">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="me-1" />
                            {saveStatusForUser.error}
                          </div>
                        )}
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
              <CAlert color="danger">
                Failed to load users. Please try again.
              </CAlert>
            )}

            {(!users || users.length === 0) && !isLoading && (
              <CAlert color="info">
                No new users available for registration.
              </CAlert>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default HRUsersPage;