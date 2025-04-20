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
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CAlert
} from '@coreui/react';
import { usePostForgotPasswordMutation } from '../../../../state/adminApi';
import { 
  useGetWorkersQuery, 
  useChangeRoleMutation, 
  useFireUserMutation
} from '../../../../state/hrApi';

import CustomHeader from '../../../../components/header/customhead';
import Papa from 'papaparse';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {  
  faDownload, 
  faUsers, 
  faFilter, 
  faIdCard, 
  faMoneyBillWave, 
  faCubes, 
  faTruck, 
  faBuilding,
  faUserShield, 
  faUserCog, 
  faUserTie, 
  faUser,
  faLock,
  faCopy
} from '@fortawesome/free-solid-svg-icons';
import GrantAccessModal from '../../scene/modal.js';
import axios from 'axios';
import axiosInstance from '../../../../utils/axiosInstance';
import logActivity from './../../../../utils/activityLogger';

const Works = () => {
  const { data, isLoading, error } = useGetWorkersQuery();
  const [changeRole] = useChangeRoleMutation();
  const [fireUser] = useFireUserMutation();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState({});
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('all');
  const [downloadAllClicked, setDownloadAllClicked] = useState(false);
  const [roleChangeTracked, setRoleChangeTracked] = useState({ userId: null, userName: null, newRole: null });
  const [deleteTracked, setDeleteTracked] = useState({ userId: null, userName: null });
  const [showModal, setShowModal] = useState(false);
  const [accessButtonClicked, setAccessButtonClicked] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [downloadPassword, setDownloadPassword] = useState('');
  const [downloadFileName, setDownloadFileName] = useState('');
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [forgotPasswordMutation] = usePostForgotPasswordMutation();

  const userRole = localStorage.getItem('role');
  const userDepartment = localStorage.getItem('department');
  const userName = localStorage.getItem('name');
  const userUsername = localStorage.getItem('username');

  // Check if user is superadmin and from Administrative department
  const isSuperAdminAndAdministrative = userRole === 'superadmin' && userDepartment === 'Administrative';

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

  const handleDownloadSecureZip = async (downloadType) => {
    try {
      setIsDownloading(true);
      
      // Get the download type and set file name
      let fileName = '';
      let filterParams = {};
      
      switch(downloadType) {
        case 'all': 
          fileName = 'All_Employees'; 
          break;
        case 'current-filter': 
          fileName = 'Filtered_Employees';
          // Send current filter parameters to server
          filterParams = {
            searchTerm: searchTerm,
            department: selectedDepartment,
            role: selectedRoleFilter
          };
          break;
        // other cases remain the same
      }
      
      // Send request to server with credentials and filter params
      const response = await axiosInstance.post(
        '/management/downloadZip',
        {
          name: userName,
          role: userRole,
          username: userUsername,
          downloadType: downloadType,
          filterParams: filterParams // Add filter parameters
        },
        { responseType: 'blob' }
      );
      
      // Rest of the function remains the same
      const password = userName.substring(0, 2) + userRole.charAt(0) + userUsername.slice(-6);
      setDownloadPassword(password);
      setDownloadFileName(`${fileName}_Protected.zip`);
      setShowPasswordModal(true);
      
      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `${fileName}_Protected.zip`);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Log activity
      logActivity({
        name: userName,
        role: userRole,
        department: userDepartment,
        route: '/employees',
        action: 'Download Protected Data',
        description: `Downloaded ${fileName} as password-protected zip`
      });
      
    } catch (err) {
      console.error('Error creating protected zip:', err);
      alert('Failed to create protected download. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };
  
  const handleCopyPassword = () => {
    navigator.clipboard.writeText(downloadPassword);
    setPasswordCopied(true);
    setTimeout(() => setPasswordCopied(false), 3000);
  };
  
  // Legacy download function (CSV only)
  const handleDownload = (downloadType) => {
    let dataToDownload = [];
    let fileName = '';
    
    // Filter the data based on downloadType
    switch(downloadType) {
      case 'all':
        dataToDownload = filteredData;
        fileName = 'All_Employees';
        break;
      case 'current-filter':
        dataToDownload = filteredData;
        fileName = 'Filtered_Employees';
        break;
      case 'hr':
        dataToDownload = data.filter(item => item.department === 'HR');
        fileName = 'HR_Employees';
        break;
      case 'finance':
        dataToDownload = data.filter(item => item.department === 'Finance');
        fileName = 'Finance_Employees';
        break;
      case 'core':
        dataToDownload = data.filter(item => item.department === 'Core');
        fileName = 'Core_Employees';
        break;
      case 'logistics':
        dataToDownload = data.filter(item => item.department === 'Logistics');
        fileName = 'Logistics_Employees';
        break;
      case 'administrative':
        dataToDownload = data.filter(item => item.department === 'Administrative');
        fileName = 'Administrative_Employees';
        break;
      case 'superadmin':
        dataToDownload = data.filter(item => item.role === 'superadmin');
        fileName = 'SuperAdmin_Employees';
        break;
      case 'admin':
        dataToDownload = data.filter(item => item.role === 'admin');
        fileName = 'Admin_Employees';
        break;
      case 'manager':
        dataToDownload = data.filter(item => item.role === 'manager');
        fileName = 'Manager_Employees';
        break;
      case 'employee':
        dataToDownload = data.filter(item => item.role === 'employee');
        fileName = 'Regular_Employees';
        break;
      default:
        dataToDownload = filteredData;
        fileName = 'Employees';
    }
    
    const columns = ['Username', 'Name', 'Email', 'Phone Number', 'Country', 'Occupation', 'Role', 'Department'];
    const rows = dataToDownload.map(item => [
      item.username,
      item.name,
      item.email,
      item.phoneNumber || 'N/A',
      item.country,
      item.occupation,
      item.role,
      item.department
    ]);
  
    const csvContent = Papa.unparse([columns, ...rows]);
  
    // Trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  
    // Log activity
    logActivity({
      name: userName,
      role: userRole,
      department: userDepartment,
      route: '/employees',
      action: 'Download Data',
      description: `Downloaded ${fileName} data (${dataToDownload.length} records)`
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
            {isSuperAdminAndAdministrative && (
              <CDropdown className="download-dropdown">
                <CDropdownToggle color="primary" size="sm" className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faDownload} className="me-2" /> 
                  <span>Export Data</span>
                </CDropdownToggle>
                <CDropdownMenu className="shadow-sm p-2">
                  <h6 className="dropdown-header text-primary">Quick Export</h6>
                  <CDropdownItem onClick={() => handleDownloadSecureZip('all')} className="d-flex align-items-center">
                    <FontAwesomeIcon icon={faUsers} className="me-2 text-secondary" /> 
                    <FontAwesomeIcon icon={faLock} className="me-1 text-secondary" size="xs" />
                    <span>All Employees (Protected)</span>
                  </CDropdownItem>
                  <CDropdownItem onClick={() => handleDownloadSecureZip('current-filter')} className="d-flex align-items-center">
                    <FontAwesomeIcon icon={faFilter} className="me-2 text-secondary" />
                    <FontAwesomeIcon icon={faLock} className="me-1 text-secondary" size="xs" />
                    <span>Current Filter Results (Protected)</span>
                  </CDropdownItem>
                  
                  <CDropdownItem divider className="my-2" />
                  
                  <CDropdownItem header className="text-primary">By Department</CDropdownItem>
                  <div className="department-items">
                    <CDropdownItem onClick={() => handleDownloadSecureZip('hr')} className="d-flex align-items-center">
                      <FontAwesomeIcon icon={faIdCard} className="me-2 text-secondary" /> 
                      <FontAwesomeIcon icon={faLock} className="me-1 text-secondary" size="xs" />
                      <span>HR</span>
                    </CDropdownItem>
                    <CDropdownItem onClick={() => handleDownloadSecureZip('finance')} className="d-flex align-items-center">
                      <FontAwesomeIcon icon={faMoneyBillWave} className="me-2 text-secondary" />
                      <FontAwesomeIcon icon={faLock} className="me-1 text-secondary" size="xs" />
                      <span>Finance</span>
                    </CDropdownItem>
                    <CDropdownItem onClick={() => handleDownloadSecureZip('core')} className="d-flex align-items-center">
                      <FontAwesomeIcon icon={faCubes} className="me-2 text-secondary" />
                      <FontAwesomeIcon icon={faLock} className="me-1 text-secondary" size="xs" />
                      <span>Core</span>
                    </CDropdownItem>
                    <CDropdownItem onClick={() => handleDownloadSecureZip('logistics')} className="d-flex align-items-center">
                      <FontAwesomeIcon icon={faTruck} className="me-2 text-secondary" />
                      <FontAwesomeIcon icon={faLock} className="me-1 text-secondary" size="xs" />
                      <span>Logistics</span>
                    </CDropdownItem>
                    <CDropdownItem onClick={() => handleDownloadSecureZip('administrative')} className="d-flex align-items-center">
                      <FontAwesomeIcon icon={faBuilding} className="me-2 text-secondary" />
                      <FontAwesomeIcon icon={faLock} className="me-1 text-secondary" size="xs" />
                      <span>Administrative</span>
                    </CDropdownItem>
                  </div>
                  
                  <CDropdownItem divider className="my-2" />
                  
                  <CDropdownItem header className="text-primary">By Role</CDropdownItem>
                  <div className="role-items">
                    <CDropdownItem onClick={() => handleDownloadSecureZip('admin')} className="d-flex align-items-center">
                      <FontAwesomeIcon icon={faUserCog} className="me-2 text-secondary" />
                      <FontAwesomeIcon icon={faLock} className="me-1 text-secondary" size="xs" />
                      <span>Admins</span>
                    </CDropdownItem>
                    <CDropdownItem onClick={() => handleDownloadSecureZip('manager')} className="d-flex align-items-center">
                      <FontAwesomeIcon icon={faUserTie} className="me-2 text-secondary" />
                      <FontAwesomeIcon icon={faLock} className="me-1 text-secondary" size="xs" />
                      <span>Managers</span>
                    </CDropdownItem>
                    <CDropdownItem onClick={() => handleDownloadSecureZip('employee')} className="d-flex align-items-center">
                      <FontAwesomeIcon icon={faUser} className="me-2 text-secondary" />
                      <FontAwesomeIcon icon={faLock} className="me-1 text-secondary" size="xs" />
                      <span>Employees</span>
                    </CDropdownItem>
                  </div>
                </CDropdownMenu>
              </CDropdown>
            )}
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
              {isSuperAdminAndAdministrative && (
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
              )}
            </CCardHeader>
          
            {/* Grant Access Modal */}
            {selectedEmployeeId && accessButtonClicked && isSuperAdminAndAdministrative && (
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
                  {isSuperAdminAndAdministrative && (
                    <>
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
                    </>
                  )}
                </CListGroup>
              </CCardBody>
            )}
          </CCard>
        ))}
      </CRow>
      
      {/* Password Modal */}
      <CModal 
        visible={showPasswordModal} 
        onClose={() => setShowPasswordModal(false)}
        alignment="center"
      >
        <CModalHeader closeButton>
          <h5 className="mb-0">Secure Download Information</h5>
        </CModalHeader>
        <CModalBody>
          <CAlert color="info" className="d-flex align-items-center mb-3">
            <FontAwesomeIcon icon={faLock} className="me-2" />
            <div>Your file <strong>{downloadFileName}</strong> is being downloaded as a password-protected zip file for security.</div>
          </CAlert>
          
          <p className="mb-4">To open this file, you&apos;ll need the following password:</p>
          
          <div className="password-container p-3 bg-light border rounded mb-4">
            <div className="d-flex justify-content-between align-items-center">
              <code className="password-display fs-5">{downloadPassword}</code>
              <CButton 
                color="secondary" 
                size="sm" 
                onClick={handleCopyPassword}
                disabled={passwordCopied}
              >
                <FontAwesomeIcon icon={faCopy} className="me-1" />
                {passwordCopied ? 'Copied!' : 'Copy'}
              </CButton>
            </div>
          </div>
          
          <p className="small text-muted">
            This password is securely generated based on your account details and is unique to you.
            Please keep it confidential and do not share it with unauthorized personnel.
          </p>
        </CModalBody>
        <CModalFooter>
          <CButton 
            color="primary" 
            onClick={() => setShowPasswordModal(false)}
          >
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
};

export default Works;