import React, { useState } from 'react';
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
import { useGetWorkersQuery, useChangeRoleMutation, useFireUserMutation, usePostgenerateMutation } from '../../../state/api';
import CustomHeader from '../../../components/header/customhead';
import ExcelJS from 'exceljs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import ActivityTracker from '../../../util/ActivityTracker'; // Import ActivityTracker

// Import the mutations for the departments
import { 
  usePostToHrMutation, 
  usePostToFinanceMutation, 
  usePostToCoreMutation, 
  usePostToLogisticsMutation 
} from '../../../state/api'; 
import axios from 'axios'; 

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
  const [downloadAllClicked, setDownloadAllClicked] = useState(false); // State for tracking Download All button click
  const [roleChangeTracked, setRoleChangeTracked] = useState({ userId: null, userName: null, newRole: null }); // State for tracking role change
  const [deleteTracked, setDeleteTracked] = useState({ userId: null, userName: null }); // State for tracking delete user

  // Define hooks for the department mutations
  const [postToHr] = usePostToHrMutation();
  const [postToFinance] = usePostToFinanceMutation();
  const [postToCore] = usePostToCoreMutation();
  const [postToLogistics] = usePostToLogisticsMutation();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const handleEmployeeClick = (id) => {
    setSelectedEmployeeId((prevId) => (prevId === id ? null : id));
  };
  
  // Prevent event propagation when clicking inside the employee details
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

      // Find the user's name from the data array
      const user = data.find((user) => user._id === userId);
      const userName = user ? user.name : 'Unknown User';

      // Track the role change activity with the user's name
      setRoleChangeTracked({ userId, userName, newRole });
    } catch (err) {
      alert('Error updating role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await fireUser({ userId });
        alert('User deleted successfully!');

        // Find the user's name from the data array
        const user = data.find((user) => user._id === userId);
        const userName = user ? user.name : 'Unknown User';

        // Track the delete user activity
        setDeleteTracked({ userId, userName });
      } catch (err) {
        alert('Error deleting user');
      }
    }
  };

  const handleDownloadAll = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('All Employees');

    worksheet.columns = [
      { header: 'Username', key: 'username', width: 30 },
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone Number', key: 'phoneNumber', width: 20 },
      { header: 'Country', key: 'country', width: 20 },
      { header: 'Occupation', key: 'occupation', width: 20 },
      { header: 'Role', key: 'role', width: 20 },
      { header: 'Department', key: 'department', width: 20 },
    ];

    filteredData.forEach((item) => {
      worksheet.addRow({
        username: item.username,
        name: item.name,
        email: item.email,
        phoneNumber: item.phoneNumber,
        country: item.country,
        occupation: item.occupation,
        role: item.role,
        department: item.department,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'All_Employees.xlsx';
    a.click();
    URL.revokeObjectURL(url);

    // Track the Download All button click
    setDownloadAllClicked(true);
  };

  const filteredData = data.filter((item) => {
    const username = item.username || ""; // Default to empty string if undefined
    const email = item.email || ""; // Default to empty string if undefined
  
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
        department: department.toUpperCase(), // Convert department to uppercase
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
    } catch (error) {
      console.error('Error during generation and sending:', error);
      alert('Failed to generate token or send data.');
    }
  };

  const handleDepartmentGenerateToken = () => {
    if (selectedDepartment === 'all') {
      alert('Please select a department to generate token.');
      return;
    }
    // Loop through the filtered employees and generate token for each one in the selected department
    const departmentEmployees = filteredData.filter(employee => employee.department === selectedDepartment);
    departmentEmployees.forEach(employee => {
      handleGenerateAndSend(employee._id, selectedDepartment);
    });
  };
   
  const handleResetPassword = async (userId) => {
    try {
      const user = data.find(user => user._id === userId);
      const response = await axios.post('http://localhost:5053/general/forgot-password', { email: user.email });
      alert(response.data.message);
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Failed to send reset password link.');
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
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CCol>

        <CRow className="mb-3">
          <CCol xs="4">
            <CFormSelect
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
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
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              size="sm"
              style={{ width: '120px' }}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
            </CFormSelect>
          </CCol>

          <CCol xs="4" className="d-flex justify-content-end">
            <div className="d-flex align-items-center">
              <CButton color="info" onClick={handleDownloadAll} size="sm" className="me-2">
                <FontAwesomeIcon icon={faDownload} /> Download All
              </CButton>
              <CButton color="success" onClick={handleDepartmentGenerateToken} size="sm">
                Send to {selectedDepartment} Department
              </CButton>
            </div>
          </CCol>
        </CRow>

        {/* Track Download All button click */}
        {downloadAllClicked && (
          <ActivityTracker
            action="Download All"
            description="User downloaded all employee data as an Excel file"
          />
        )}

        {/* Track Role Change */}
        {roleChangeTracked.userId && (
          <ActivityTracker
            action="Change Role"
            description={`Changed role for user ${roleChangeTracked.userName} to ${roleChangeTracked.newRole}`}
          />
        )}

        {/* Track Delete User */}
        {deleteTracked.userId && (
          <ActivityTracker
            action="Delete User"
            description={`Deleted user ${deleteTracked.userName}`}
          />
        )}

        {filteredData.map((item) => (
          <CCard
            key={item._id}
            className="mb-3"
            style={{ cursor: 'pointer' }}
            onClick={() => handleEmployeeClick(item._id)}
          >
            <CCardHeader>
              <h4>
                {item.username} - {item.name}
              </h4>
            </CCardHeader>
            {selectedEmployeeId === item._id && (
              <CCardBody onClick={stopPropagation}>
                <CListGroup>
                  <CListGroupItem>Email: {item.email}</CListGroupItem>
                  <CListGroupItem>
                    Phone Number: {item.phoneNumber || 'N/A'}
                  </CListGroupItem>
                  <CListGroupItem>Country: {item.country}</CListGroupItem>
                  <CListGroupItem>Occupation: {item.occupation}</CListGroupItem>
                  <CListGroupItem>Role: {item.role}</CListGroupItem>
                  <CListGroupItem>
                    Department: {item.department}
                  </CListGroupItem>
                  <CListGroupItem>
                    <CFormSelect
                      value={selectedRole[item._id] || ''}
                      onClick={stopPropagation}
                      onChange={(e) =>
                        setSelectedRole({
                          ...selectedRole,
                          [item._id]: e.target.value,
                        })
                      }
                    >
                      <option value="">Select Role</option>
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
                        stopPropagation(e);
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
                        stopPropagation(e);
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
                          stopPropagation(e);
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
                        stopPropagation(e);
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