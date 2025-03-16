import React, { useState, useEffect } from 'react';
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
  CInputGroup,
  CFormInput,
  CButton,
} from '@coreui/react';
import { useGetCustomersQuery } from '../../../../state/financeApi';
import CustomHeader from '../../../../components/header/customhead';
import { useNavigate } from 'react-router-dom';
import logActivity from '../../../../utils/ActivityLogger'

const Index = () => {
  const { data, isLoading, error } = useGetCustomersQuery();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  // Get user information from sessionStorage
  const userRole = sessionStorage.getItem('role');
  const userDepartment = sessionStorage.getItem('department');
  const userName = sessionStorage.getItem('name');
  
  // Log page visit on component mount
  useEffect(() => {
    logActivity({
      name: userName,
      role: userRole,
      department: userDepartment,
      route: '/customers',
      action: 'Page Visit',
      description: 'User visited the customers page'
    });
  }, [userName, userRole, userDepartment]);

  console.log('Fetched customers:', data);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (error) {
    return <div>Error: {error.message}</div>;
  }

  // Filter data based on search input (name or email)
  const filteredData = data.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handler for viewing customer details
  const handleViewCustomer = (customerId) => {
    // Log the view action
    logActivity({
      name: userName,
      role: userRole,
      department: userDepartment,
      route: `/details/${customerId}`,
      action: 'View Customer',
      description: `User viewed details for customer ID: ${customerId}`
    });
    
    // Navigate to the details page
    navigate(`/details/${customerId}`);
  };

  // Handler for search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Log search activity if the search term is at least 3 characters
    if (value.length >= 3) {
      logActivity({
        name: userName,
        role: userRole,
        department: userDepartment,
        route: '/customers',
        action: 'Search',
        description: `User searched for: ${value}`
      });
    }
  };

  return (
    <>
      <CustomHeader 
        title="Customers" 
        subtitle="Manage and view all customer information" 
      />
      <CContainer>
        <CCard className="mb-4">
          <div className="p-4">
            <CRow className="mb-3">
              <div className="col-md-6">
                <CInputGroup>
                  <CFormInput
                    placeholder="Search by name or email"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </CInputGroup>
              </div>
            </CRow>
            <CTable hover responsive>
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
                {filteredData.map((item) => (
                  <CTableRow key={item._id}>
                    <CTableDataCell>{item._id}</CTableDataCell>
                    <CTableDataCell>{item.name}</CTableDataCell>
                    <CTableDataCell>{item.email}</CTableDataCell>
                    <CTableDataCell>
                      {item.phoneNumber
                        ? item.phoneNumber.replace(/^(\d{3})(\d{3})(\d{4})/, '($1)$2-$3')
                        : 'N/A'}
                    </CTableDataCell>
                    <CTableDataCell>{item.country}</CTableDataCell>
                    <CTableDataCell>{item.occupation}</CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={item.role?.toLowerCase() === 'user' ? 'info' : 'primary'}>
                        {item.role?.toLowerCase() === 'user' ? 'User' : item.role}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CButton 
                        size="sm" 
                        color="primary" 
                        onClick={() => handleViewCustomer(item._id)}
                      >
                        View
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </div>
        </CCard>
      </CContainer>
    </>
  );
};

export default Index;