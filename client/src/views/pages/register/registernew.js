import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CFormSelect,
  CFormInput
} from '@coreui/react';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [editingUserId, setEditingUserId] = useState(null);

  // Role and Department Options
  const roleOptions = ['Super Admin', 'Admin', 'Manager', 'Employee'];
  const departmentOptions = ['HR', 'Logistics', 'Administrative', 'Core', 'Finance'];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5053/general/users'); // API call
      setUsers(response.data);
    } catch (err) {
      setError('Failed to fetch users');
    }
  };

  // Handle input change (password, role, department)
  const handleChange = (userId, field, value) => {
    setUsers(users.map(user => 
      user._id === userId ? { ...user, [field]: value } : user
    ));
  };

  // Save changes to backend
  const handleSave = async (userId) => {
    const userToUpdate = users.find(user => user._id === userId);
    try {
      await axios.put(`http://localhost:5053/general/users/${userId}`, {
        role: userToUpdate.role,
        department: userToUpdate.department,
        password: userToUpdate.password || undefined, // Only send password if changed
      });
      setEditingUserId(null);
    } catch (err) {
      setError('Failed to update user');
    }
  };

  return (
    <div>
      <h2>User List</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <CTable striped hover responsive>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>Name</CTableHeaderCell>
            <CTableHeaderCell>Email</CTableHeaderCell>
            <CTableHeaderCell>Password</CTableHeaderCell>
            <CTableHeaderCell>Phone</CTableHeaderCell>
            <CTableHeaderCell>Role</CTableHeaderCell>
            <CTableHeaderCell>Department</CTableHeaderCell>
            <CTableHeaderCell>Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {users.map((user) => (
            <CTableRow key={user._id}>
              <CTableDataCell>{user.name}</CTableDataCell>
              <CTableDataCell>{user.email}</CTableDataCell>

              {/* Password Field - Show Input if Blank */}
              <CTableDataCell>
                {editingUserId === user._id || !user.password ? (
                  <CFormInput
                    type="password"
                    placeholder="Enter new password"
                    value={user.password || ''}
                    onChange={(e) => handleChange(user._id, 'password', e.target.value)}
                  />
                ) : (
                  '******' // Hide password if it exists
                )}
              </CTableDataCell>

              <CTableDataCell>{user.phoneNumber}</CTableDataCell>

              {/* Role Dropdown - Show Dropdown if Blank */}
              <CTableDataCell>
                {editingUserId === user._id || !user.role ? (
                  <CFormSelect
                    value={user.role || ''}
                    onChange={(e) => handleChange(user._id, 'role', e.target.value)}
                  >
                    <option value="">Select Role</option>
                    {roleOptions.map((role, index) => (
                      <option key={index} value={role}>{role}</option>
                    ))}
                  </CFormSelect>
                ) : (
                  user.role
                )}
              </CTableDataCell>

              {/* Department Dropdown - Show Dropdown if Blank */}
              <CTableDataCell>
                {editingUserId === user._id || !user.department ? (
                  <CFormSelect
                    value={user.department || ''}
                    onChange={(e) => handleChange(user._id, 'department', e.target.value)}
                  >
                    <option value="">Select Department</option>
                    {departmentOptions.map((dept, index) => (
                      <option key={index} value={dept}>{dept}</option>
                    ))}
                  </CFormSelect>
                ) : (
                  user.department
                )}
              </CTableDataCell>

              <CTableDataCell>
                {editingUserId === user._id ? (
                  <>
                    <CButton color="success" size="sm" onClick={() => handleSave(user._id)}>Save</CButton>{' '}
                    <CButton color="secondary" size="sm" onClick={() => setEditingUserId(null)}>Cancel</CButton>
                  </>
                ) : (
                  <CButton color="primary" size="sm" onClick={() => setEditingUserId(user._id)}>Edit</CButton>
                )}
                {' '}
                <CButton color="danger" size="sm">Delete</CButton>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>
    </div>
  );
};

export default UserList;
