import React, { useState } from 'react';
import {
  CCard,
  CContainer,
  CRow,
  CBadge,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CButton,
  CFormSelect,
  CInputGroup,
  CFormInput,
} from '@coreui/react';
import { useGetWorkersQuery, useChangeRoleMutation, useFireUserMutation } from '../../state/api';
import CustomHeader from '../../components/header/customhead';

const Works = () => {
  const { data, isLoading, error } = useGetWorkersQuery(); // Fetch workers data
  const [changeRole] = useChangeRoleMutation(); // Mutation to change role
  const [fireUser] = useFireUserMutation(); // Mutation to delete user
  const [searchTerm, setSearchTerm] = useState(''); // Search term state
  const [selectedRole, setSelectedRole] = useState({}); // Store role changes

  // Check for loading state
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Check for errors
  if (error) {
    return <div>Error: {error.message}</div>;
  }

  // Function to handle role change
  const handleRoleChange = async (userId) => {
    const newRole = selectedRole[userId] || ''; // Get the selected role or default to empty string
    if (!newRole) {
      alert('Please select a role before updating.');
      return;
    }
    try {
      await changeRole({ userId, newRole });
      alert('Role updated successfully!');
    } catch (err) {
      alert('Error updating role');
    }
  };

  // Function to handle user deletion
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await fireUser({ userId });
        alert('User deleted successfully!');
      } catch (err) {
        alert('Error deleting user');
      }
    }
  };

  // Filter the workers data based on the search term (searching by username or email)
  const filteredData = data.filter(
    (item) =>
      item.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <CContainer m="1.5rem 2.5rem">
      <CRow>
        <CustomHeader title="Employees" subtitle="List of Employees" />
        
        {/* Search Bar */}
        <CInputGroup className="mb-3">
          <CFormInput
            placeholder="Search by Username or Email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CInputGroup>
        
        <CCard mt="40px" height="75vh">
          <CTable striped bordered>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Username</CTableHeaderCell>
                <CTableHeaderCell>Name</CTableHeaderCell>
                <CTableHeaderCell>Email</CTableHeaderCell>
                <CTableHeaderCell>Phone Number</CTableHeaderCell>
                <CTableHeaderCell>Country</CTableHeaderCell>
                <CTableHeaderCell>Occupation</CTableHeaderCell>
                <CTableHeaderCell>Role</CTableHeaderCell>
                <CTableHeaderCell>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {filteredData.map((item) => (
                <CTableRow key={item._id}>
                  <CTableDataCell>{item.username}</CTableDataCell>
                  <CTableDataCell>{item.name}</CTableDataCell>
                  <CTableDataCell>{item.email}</CTableDataCell>
                  <CTableDataCell>
                    {item.phoneNumber ? (
                      item.phoneNumber.length === 10 ? (
                        item.phoneNumber.replace(/^(\d{3})(\d{3})(\d{4})/, '($1)$2-$3')
                      ) : (
                        item.phoneNumber // Fallback to original number if it's not 10 digits
                      )
                    ) : (
                      'N/A'
                    )}
                  </CTableDataCell>
                  <CTableDataCell>{item.country}</CTableDataCell>
                  <CTableDataCell>{item.occupation}</CTableDataCell>
                  <CTableDataCell>
                    <CFormSelect
                      value={selectedRole[item._id] || item.role}
                      onChange={(e) => setSelectedRole({ ...selectedRole, [item._id]: e.target.value })}
                    >
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="employee">Employee</option>
                    </CFormSelect>
                    <CBadge color="primary">{item.role}</CBadge>
                  </CTableDataCell>
                  <CTableDataCell>
                    <CButton color="warning" onClick={() => handleRoleChange(item._id)}>
                      Update Role
                    </CButton>
                    <CButton color="danger" onClick={() => handleDeleteUser(item._id)}>
                      Delete
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCard>
      </CRow>
    </CContainer>
  );
};

export default Works;
