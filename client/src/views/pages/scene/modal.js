import React, { useEffect, useState } from 'react';
import { CModal, CModalHeader, CModalBody, CModalFooter, CButton, CFormCheck } from '@coreui/react';
import axios from 'axios';

const GrantAccessModal = ({ visible, onClose, userId }) => {
  const [selectedPermissions, setSelectedPermissions] = useState([]);

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

  useEffect(() => {
    console.log('GrantAccessModal received userId:', userId);
  }, [userId]);

  // Prevent clicks inside the modal from closing it
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  const handleSelect = (route) => {
    setSelectedPermissions((prev) =>
      prev.includes(route) ? prev.filter((r) => r !== route) : [...prev, route]
    );
  };

  // Grant Access API Call
  const handleGrant = async () => {
    if (!userId) {
      console.error("❌ Error: userId is null before making the API request.");
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:5053/hr/user/grant-access', {
        userId,
        newPermissions: selectedPermissions, // Only permission names are sent
      });
  
      console.log("✅ Access granted:", response.data);
      alert('Permissions granted successfully');
      onClose();
    } catch (error) {
      console.error('❌ Error granting access:', error);
      alert("Failed to grant access.");
    }
  };
  

  return (
    <CModal visible={visible} onClose={onClose} onClick={handleModalClick}>
      <CModalHeader onClick={handleModalClick}>Grant Additional Access</CModalHeader>
      <CModalBody onClick={handleModalClick}>
        {allPermissions.map((item) => (
          <CFormCheck
            key={item.to}
            label={item.name}
            checked={selectedPermissions.includes(item.to)}
            onChange={() => handleSelect(item.to)}
          />
        ))}
      </CModalBody>
      <CModalFooter onClick={handleModalClick}>
        <CButton color="secondary" onClick={onClose}>Cancel</CButton>
        <CButton color="primary" onClick={handleGrant}>Grant Access</CButton>
      </CModalFooter>
    </CModal>
  );
};

export default GrantAccessModal;
