import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { CModal, CModalHeader, CModalBody, CModalFooter, CButton, CFormCheck } from '@coreui/react';
import { 
  useGetUserPermissionsQuery, 
  useGrantAccessMutation, 
  useRevokeAccessMutation 
} from '../../../state/hrApi'; // Adjust the import path as needed

const GrantAccessModal = ({ visible, onClose, userId }) => {
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const name = sessionStorage.getItem('name');

  // List of all permissions that can be granted
  const allPermissions = [
    { name: 'HR Dashboard', to: '/hrdash' },
    { name: 'Finance Dashboard', to: '/financedash' },
    { name: 'Core Dashboard', to: '/coredash' },
    { name: 'Logistic Dashboard', to: '/logisticdash' },
    { name: 'Employees', to: '/worker' },
    { name: 'Payroll', to: '/payroll' },
    { name: 'Transactions', to: '/freight/transaction' },
    { name: 'User Activity', to: '/useractivity/index' },
    { name: 'Restore', to: '/restore' },
    { name: 'Customer', to: '/customer' },
    { name: 'Monthly', to: '/monthly' },
    { name: 'Daily', to: '/daily' },
    { name: 'Breakdown', to: '/breakdown' },
  ];

  // Fetch current user permissions
  const { data, isLoading, error } = useGetUserPermissionsQuery(userId);

  // Safely extract permissions, defaulting to an empty array
  const currentPermissions = Array.isArray(data?.permissions) 
    ? data.permissions 
    : (Array.isArray(data) 
      ? data 
      : []);

  // Mutations for granting and revoking access
  const [grantAccessMutation] = useGrantAccessMutation();
  const [revokeAccessMutation] = useRevokeAccessMutation();

  // Prevent clicks inside the modal from closing it
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  const handleSelect = (route) => {
    setSelectedPermissions((prev) =>
      prev.includes(route) ? prev.filter((r) => r !== route) : [...prev, route]
    );
  };

  // Grant Access 
  const handleGrant = async () => {
    if (!userId) {
      console.error("❌ Error: userId is null before making the API request.");
      return;
    }
  
    try {
      await grantAccessMutation({
        userId,
        newPermissions: selectedPermissions,
        grantedBy: name,
      }).unwrap();
  
      console.log("✅ Access granted successfully");
      alert('Permissions granted successfully');
      onClose();
    } catch (error) {
      console.error('❌ Error granting access:', error);
      alert("Failed to grant access.");
    }
  };

  // Revoke Access
  const handleRevoke = async () => {
    if (!userId) {
      console.error('❌ Error: userId is null before making the API request.');
      return;
    }
  
    try {
      await revokeAccessMutation({
        userId,
        permissionsToRemove: selectedPermissions,
      }).unwrap();
  
      console.log('✅ Access revoked successfully');
      alert('Permissions revoked successfully');
      onClose();
    } catch (error) {
      console.error('❌ Error revoking access:', error);
      alert('Failed to revoke access.');
    }
  };

  // Render loading state if permissions are being fetched
  if (isLoading) {
    return <div>Loading permissions...</div>;
  }

  // Render error state if there was an issue fetching permissions
  if (error) {
    return <div>Error loading permissions: {error.toString()}</div>;
  }

  return (
    <CModal visible={visible} onClose={onClose} onClick={handleModalClick}>
      <CModalHeader onClick={handleModalClick}>Manage Access Permission</CModalHeader>
      <CModalBody onClick={handleModalClick}>
        <h5>Grant Access</h5>
        {allPermissions.map((item) => (
          <CFormCheck
            key={item.to}
            label={item.name}
            checked={selectedPermissions.includes(item.to)}
            onChange={() => handleSelect(item.to)}
          />
        ))}
        <h5>Revoke Access</h5>
        {currentPermissions.map((perm) => (
          <CFormCheck
            key={perm}
            label={perm}
            checked={selectedPermissions.includes(perm)}
            onChange={() => handleSelect(perm)}
          />
        ))}
      </CModalBody>
      <CModalFooter onClick={handleModalClick}>
        <CButton color="secondary" onClick={onClose}>Cancel</CButton>
        <CButton color="primary" onClick={handleGrant}>Grant Access</CButton>
        <CButton color="danger" onClick={handleRevoke}>
          Revoke Access
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

GrantAccessModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired
};

export default GrantAccessModal;