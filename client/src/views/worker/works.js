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
} from '@coreui/react';
import { useGetWorkersQuery, useChangeRoleMutation, useFireUserMutation } from '../../state/api';
import CustomHeader from '../../components/header/customhead';
const Works = () => {
    const { data, isLoading, error } = useGetWorkersQuery(); // Fetch workers data
    const [changeRole] = useChangeRoleMutation(); // Mutation to change role
    const [fireUser] = useFireUserMutation(); // Mutation to delete user
  
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
      const newRole = selectedRole[userId]; // Get the selected role
      try {
        await changeRole({ userId, newRole });
        alert('Role updated successfully!');
      } catch (err) {
        alert('Error updating role');
      }
    };
  
    // Function to handle user deletion
    const handleDeleteUser = async (userId) => {
      try {
        await fireUser({ userId });
        alert('User deleted successfully!');
      } catch (err) {
        alert('Error deleting user');
      }
    };
  
    return (
      <CContainer m="1.5rem 2.5rem">
        <CRow>
          <CustomHeader title="Employees" subtitle="List of Employees" />
          <CCard mt="40px" height="75vh">
            <CTable striped bordered>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>ID</CTableHeaderCell>
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
                {data.map((item) => (
                  <CTableRow key={item._id}>
                    <CTableDataCell>{item._id}</CTableDataCell>
                    <CTableDataCell>{item.name}</CTableDataCell>
                    <CTableDataCell>{item.email}</CTableDataCell>
                    <CTableDataCell>
                      {item.phoneNumber.replace(/^(\d{3})(\d{3})(\d{4})/, '($1)$2-$3')}
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
                      <CButton
                        color="warning"
                        onClick={() => handleRoleChange(item._id)}
                      >
                        Update Role
                      </CButton>
                      <CButton
                        color="danger"
                        onClick={() => handleDeleteUser(item._id)}
                      >
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
