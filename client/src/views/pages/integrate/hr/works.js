import React, { useEffect, useState } from 'react';
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardHeader,
  CListGroup,
  CListGroupItem,
  CButton,
  CFormInput,
  CFormSelect,
  CBadge,
} from '@coreui/react';
import { usePostForgotPasswordMutation } from '../../../../state/adminApi';
import { 
  usePostToHrMutation, 
  usePostToFinanceMutation, 
  usePostToCoreMutation, 
  usePostToLogisticsMutation,
  useGetWorkersQuery, 
  useChangeRoleMutation, 
  useFireUserMutation,
  usePostgenerateMutation 
} from '../../../../state/hrApi';
import CustomHeader from '../../../../components/header/customhead';
import Papa from 'papaparse';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import GrantAccessModal from '../../scene/modal.js';
import axios from 'axios';


import logActivity from './../../../../utils/activityLogger';

const Works = () => {
  const { data, isLoading, error } = useGetWorkersQuery();
  const [changeRole] = useChangeRoleMutation();
  const [fireUser] = useFireUserMutation();
  const [postGenerate] = usePostgenerateMutation();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState({});
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('all');
  const [oauthToken, setOauthToken] = useState(null);
  const [downloadAllClicked, setDownloadAllClicked] = useState(false);
  const [roleChangeTracked, setRoleChangeTracked] = useState({ userId: null, userName: null, newRole: null });
  const [deleteTracked, setDeleteTracked] = useState({ userId: null, userName: null });
  const [showModal, setShowModal] = useState(false);
  const [accessButtonClicked, setAccessButtonClicked] = useState(false);
  const [forgotPasswordMutation] = usePostForgotPasswordMutation();

  
  const userRole = sessionStorage.getItem('role');
  const userDepartment = sessionStorage.getItem('department');
  const userName = sessionStorage.getItem('name');

  
  const [postToHr] = usePostToHrMutation();
  const [postToFinance] = usePostToFinanceMutation();
  const [postToCore] = usePostToCoreMutation();
  const [postToLogistics] = usePostToLogisticsMutation();

  useEffect(() => {
    if (selectedEmployeeId) {
      console.log("🟢 Opening Modal with userId:", selectedEmployeeId);
      setShowModal(true);
    }
  }, [selectedEmployeeId]); 

  useEffect(() => {
    
    logActivity({
      name: userName,
      role: userRole,
      department: userDepartment,
      route: '/employees',
      action: 'Page Visit',
      description: 'User visited the Employees page'
    });
  }, []); 

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const handleEmployeeClick = (id) => {
    setSelectedEmployeeId((prevId) => (prevId === id ? null : id));
    
    
    if (id && !selectedEmployeeId) {
      const employee = data.find(user => user._id === id);
      logActivity({
        name: userName,
        role: userRole,
        department: userDepartment,
        route: '/employees',
        action: 'View Employee Details',
        description: `User viewed details for employee: ${employee?.name || 'Unknown'}`
      });
    }
  };
  
  
  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  const handleRoleChange = async (userId) => {
    const newRole = selectedRole[userId] || '';
    if (!newRole) {
      alert('Please select a role before updating.');
      return;
    }
    try {
      await changeRole({ userId, newRole });
      alert('Role updated successfully!');

      
      const user = data.find((user) => user._id === userId);
      const userName = user ? user.name : 'Unknown User';
      
      
      logActivity({
        name: userName,
        role: userRole,
        department: userDepartment,
        route: '/employees',
        action: 'Role Change',
        description: `Changed role for ${user?.name || 'Unknown User'} to ${newRole}`
      });

    } catch (err) {
      alert('Error updating role');
      
      
      logActivity({
        name: userName,
        role: userRole,
        department: userDepartment,
        route: '/employees',
        action: 'Role Change Failed',
        description: `Failed to change role for user ID: ${userId}`
      });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        
        const user = data.find((user) => user._id === userId);
        const targetUserName = user ? user.name : 'Unknown User';
        
        await fireUser({ userId });
        alert('User deleted successfully!');

        
        logActivity({
          name: userName,
          role: userRole,
          department: userDepartment,
          route: '/employees',
          action: 'Delete User',
          description: `Deleted user: ${targetUserName}`
        });

      } catch (err) {
        alert('Error deleting user');
        
        
        logActivity({
          name: userName,
          role: userRole,
          department: userDepartment,
          route: '/employees',
          action: 'Delete User Failed',
          description: `Failed to delete user ID: ${userId}`
        });
      }
    }
  };



  const handleDownloadAll = () => {
    const columns = ['Username', 'Name', 'Email', 'Phone Number', 'Country', 'Occupation', 'Role', 'Department'];
    const data = filteredData.map(item => [
      item.username,
      item.name,
      item.email,
      item.phoneNumber,
      item.country,
      item.occupation,
      item.role,
      item.department
    ]);
  
    const csvContent = Papa.unparse([columns, ...data]);
  
    // Trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'All_Employees.csv';
    a.click();
    URL.revokeObjectURL(url);
  
    // Log activity
    logActivity({
      name: userName,
      role: userRole,
      department: userDepartment,
      route: '/employees',
      action: 'Download Data',
      description: `Downloaded employee data (${filteredData.length} records)`
    });
  };
  

  const filteredData = data.filter((item) => {
    const username = item.username || ""; 
    const email = item.email || ""; 
  
    const matchesSearch =
      username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment =
      selectedDepartment === 'all' || item.department === selectedDepartment;
    const matchesRole =
      selectedRoleFilter === 'all' || item.role === selectedRoleFilter;
  
    return matchesSearch && matchesDepartment && matchesRole;
  });
  
  const handleGenerateAndSend = async (userId, department) => {
    try {
      const tokenResponse = await postGenerate(userId).unwrap();
      const { token, message } = tokenResponse;
      setOauthToken(token);
      alert(message);
  
      const userData = data.find((user) => user._id === userId);
      const payload = {
        ...userData,
        oauthToken: token,
        department: department.toUpperCase(),
      };
  
      let response;
      switch (department.toLowerCase()) {
        case 'hr':
          response = await postToHr({ payload }).unwrap();
          break;
        case 'finance':
          response = await postToFinance({ payload }).unwrap();
          break;
        case 'core':
          response = await postToCore({ payload }).unwrap();
          break;
        case 'logistics':
          response = await postToLogistics({ payload }).unwrap();
          break;
        default:
          throw new Error('Invalid department');
      }
  
      console.log(`Response from ${department}:`, response);
      alert(response.message);
      
      
      logActivity({
        name: userName,
        role: userRole,
        department: userDepartment,
        route: '/employees',
        action: 'Send to Department',
        description: `Sent user ${userData?.name || 'Unknown'} data to ${department} department`
      });
      
    } catch (error) {
      console.error('Error during generation and sending:', error);
      alert('Failed to generate token or send data.');
      
      
      logActivity({
        name: userName,
        role: userRole,
        department: userDepartment,
        route: '/employees',
        action: 'Send to Department Failed',
        description: `Failed to send user data to ${department} department`
      });
    }
  };

  const handleDepartmentGenerateToken = () => {
    if (selectedDepartment === 'all') {
      alert('Please select a department to generate token.');
      return;
    }
    
    
    const departmentEmployees = filteredData.filter(employee => employee.department === selectedDepartment);
    
    if (departmentEmployees.length === 0) {
      alert(`No employees found in ${selectedDepartment} department.`);
      return;
    }
    
    departmentEmployees.forEach(employee => {
      handleGenerateAndSend(employee._id, selectedDepartment);
    });
    
    
    logActivity({
      name: userName,
      role: userRole,
      department: userDepartment,
      route: '/employees',
      action: 'Bulk Send to Department',
      description: `Sent ${departmentEmployees.length} employees' data to ${selectedDepartment} department`
    });
  };
   
  const handleResetPassword = async (userId) => {
    try {
      const user = data.find(user => user._id === userId);
      
      if (!user || !user.email) {
        alert('User email not found');
        return;
      }

      const response = await forgotPasswordMutation(user.email).unwrap();
      
      
      alert(response.message || 'Reset password link sent successfully');
      
      
      logActivity({
        name: userName,
        role: userRole,
        department: userDepartment,
        route: '/employees',
        action: 'Password Reset',
        description: `Sent password reset link to ${user.name} (${user.email})`
      });
      
    } catch (err) {
      
      console.error('Error resetting password:', err);
      alert(err.message || 'Failed to send reset password link');
      
      
      logActivity({
        name: userName,
        role: userRole,
        department: userDepartment,
        route: '/employees',
        action: 'Password Reset Failed',
        description: `Failed to send password reset link to user ID: ${userId}`
      });
    }
  };

  return (
    <CContainer m="1.5rem 2.5rem">
      <CRow>
        <CustomHeader title="Employees" subtitle="List of Employees" />
        
        <CCol xs="12" className="mb-3">
          <CFormInput
            placeholder="Search by Username or Email"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              
              
              if (e.target.value && e.target.value.length >= 3) {
                logActivity({
                  name: userName,
                  role: userRole,
                  department: userDepartment,
                  route: '/employees',
                  action: 'Search',
                  description: `User searched for: "${e.target.value}"`
                });
              }
            }}
          />
        </CCol>

        <CRow className="mb-3">
          <CCol xs="4">
            <CFormSelect
              value={selectedDepartment}
              onChange={(e) => {
                setSelectedDepartment(e.target.value);
                
                
                if (e.target.value !== 'all') {
                  logActivity({
                    name: userName,
                    role: userRole,
                    department: userDepartment,
                    route: '/employees',
                    action: 'Filter',
                    description: `Filtered employees by department: ${e.target.value}`
                  });
                }
              }}
              size="sm"
              style={{ width: '120px' }}
            >
              <option value="all">All Departments</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="Core">Core</option>
              <option value="Logistics">Logistics</option>
              <option value="Administrative">Administrative</option>
            </CFormSelect>
          </CCol>

          <CCol xs="4">
            <CFormSelect
              value={selectedRoleFilter}
              onChange={(e) => {
                setSelectedRoleFilter(e.target.value);
                
                
                if (e.target.value !== 'all') {
                  logActivity({
                    name: userName,
                    role: userRole,
                    department: userDepartment,
                    route: '/employees',
                    action: 'Filter',
                    description: `Filtered employees by role: ${e.target.value}`
                  });
                }
              }}
              size="sm"
              style={{ width: '120px' }}
            >
              <option value="all">All Roles</option>
              <option value="superadmin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
            </CFormSelect>
          </CCol>

          <CCol xs="4" className="d-flex justify-content-end">
            <div className="d-flex align-items-center">
              <CButton 
                color="info" 
                onClick={handleDownloadAll} 
                size="sm" 
                className="me-2"
              >
                <FontAwesomeIcon icon={faDownload} /> Download All
              </CButton>
              <CButton 
                color="success" 
                onClick={handleDepartmentGenerateToken} 
                size="sm"
              >
                Send to {selectedDepartment} Department
              </CButton>
            </div>
          </CCol>
        </CRow>

        {filteredData.map((item) => (
          <CCard
            key={item._id}
            className="mb-3"
            style={{ cursor: 'pointer' }}
            onClick={(e) => {
              
              if (!e.target.closest('button')) {
                console.log("🟢 Card Clicked ID:", item._id);
                
                
                if (selectedEmployeeId !== item._id) {
                  logActivity({
                    name: userName,
                    role: userRole,
                    department: userDepartment,
                    route: '/employees',
                    action: 'View Employee',
                    description: `Viewed details for employee: ${item.name}`
                  });
                }
                
                setSelectedEmployeeId((prevId) => (prevId === item._id ? null : item._id)); 
                setAccessButtonClicked(false); 
              }
            }}
          >
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <h4>
                {item.username} - {item.name}
              </h4>
              <CButton
                color="primary"
                onClick={(e) => {
                  e.stopPropagation(); 
                  console.log("✅ Button Clicked ID:", item._id);
                  
                  
                  logActivity({
                    name: userName,
                    role: userRole,
                    department: userDepartment,
                    route: '/employees',
                    action: 'Access Management',
                    description: `Opened access management for: ${item.name}`
                  });
                  
                  setSelectedEmployeeId(item._id); 
                  setAccessButtonClicked(true); 
                  
                  setTimeout(() => {
                    setShowModal(true); 
                  }, 100);
                }}
              >
                Access
              </CButton>
            </CCardHeader>
          
            {/* Grant Access Modal */}
            {selectedEmployeeId && accessButtonClicked && (
              <GrantAccessModal
                visible={showModal}
                onClose={() => {
                  setShowModal(false);
                  
                  
                  logActivity({
                    name: userName,
                    role: userRole,
                    department: userDepartment,
                    route: '/employees',
                    action: 'Close Access Management',
                    description: `Closed access management modal for employee ID: ${selectedEmployeeId}`
                  });
                }}
                userId={selectedEmployeeId}
              />
            )}
          
            {/* Card Body */}
            {selectedEmployeeId === item._id && !accessButtonClicked && (
              <CCardBody>
                <CListGroup>
                  <CListGroupItem>Email: {item.email}</CListGroupItem>
                  <CListGroupItem>
                    Phone Number: {item.phoneNumber || 'N/A'}
                  </CListGroupItem>
                  <CListGroupItem>Country: {item.country}</CListGroupItem>
                  <CListGroupItem>Occupation: {item.occupation}</CListGroupItem>
                  <CListGroupItem>Role: {item.role}</CListGroupItem>
                  <CListGroupItem>Department: {item.department}</CListGroupItem>
                  <CListGroupItem>
                    <CFormSelect
                      value={selectedRole[item._id] || ''}
                      onClick={(e) => e.stopPropagation()} 
                      onChange={(e) => {
                        const newRole = e.target.value;
                        setSelectedRole({
                          ...selectedRole,
                          [item._id]: newRole,
                        });
                        
                        
                        if (newRole) {
                          logActivity({
                            name: userName,
                            role: userRole,
                            department: userDepartment,
                            route: '/employees',
                            action: 'Select Role',
                            description: `Selected role ${newRole} for ${item.name}`
                          });
                        }
                      }}
                    >
                      <option value="">Select Role</option>
                      <option value="superadmin">Super Admin</option>
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="employee">Employee</option>
                    </CFormSelect>
                  </CListGroupItem>
                  <CListGroupItem>
                    <CButton
                      color="primary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRoleChange(item._id);
                      }}
                    >
                      Change Role
                    </CButton>
                    <CButton
                      color="danger"
                      size="sm"
                      className="ms-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteUser(item._id);
                      }}
                    >
                      Fire User
                    </CButton>
                  </CListGroupItem>
                  <CListGroupItem>
                    {item.department !== 'Administrative' && (
                      <CButton
                        color="info"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGenerateAndSend(item._id, item.department);
                        }}
                      >
                        Send to {item.department}
                      </CButton>
                    )}
                  </CListGroupItem>
                  <CListGroupItem>
                    <CButton
                      color="info"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResetPassword(item._id);
                      }}
                    >
                      Send link to reset password
                    </CButton>
                  </CListGroupItem>
                </CListGroup>
              </CCardBody>
            )}
          </CCard>
        ))}
      </CRow>
    </CContainer>
  );
};

export default Works;