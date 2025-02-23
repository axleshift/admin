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
  CInputGroup,
  CFormInput,
  CButton,
} from '@coreui/react';
import { useGetCustomersQuery } from '../../state/adminApi';
import CustomHeader from '../../components/header/customhead';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { data, isLoading, error } = useGetCustomersQuery();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
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

  return (
    <CContainer m="1.5rem 2.5rem">
      <CRow>
        <CustomHeader title="Customers" subtitle="List of Customers" />

  

        <CInputGroup className="mb-3">
          <CFormInput
            placeholder="Search by Name or Email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CInputGroup>

        <CCard mt="40px" height="75vh">
          <CTable striped bordered>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>ID</CTableHeaderCell>
                <CTableHeaderCell>Name</CTableHeaderCell>
                <CTableHeaderCell>Email</CTableHeaderCell>
                <CTableHeaderCell>Phone Number</CTableHeaderCell>
                <CTableHeaderCell>Country</CTableHeaderCell>
        
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
                    <CBadge color="primary">
                    
                      {item.role?.toLowerCase() === 'user' ? 'User' : item.role}
                    </CBadge>
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

export default Index;
