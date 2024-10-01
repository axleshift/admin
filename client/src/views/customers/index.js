import React from 'react';
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
} from '@coreui/react';
import { useGetCustomersQuery } from '../../state/api';
import CustomHeader from '../../components/header/customhead';

const Index = () => {
  const { data, isLoading, error } = useGetCustomersQuery(); // Call the hook here

  // Check for loading state
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Check for errors
  if (error) {
    return <div>Error: {error.message}</div>; // Display the error message
  }

  console.log("data", data);

  return (
    <CContainer m="1.5rem 2.5rem">
      <CRow>
        <CustomHeader title="Customers" subtitle="List of Customers" />
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
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {data.map((item) => (
                <CTableRow key={item._id}>
                  <CTableDataCell>{item._id}</CTableDataCell>
                  <CTableDataCell>{item.name}</CTableDataCell>
                  <CTableDataCell>{item.email}</CTableDataCell>
                  <CTableDataCell>
                    {item.phoneNumber ? item.phoneNumber.replace(/^(\d{3})(\d{3})(\d{4})/, "($1)$2-$3") : 'N/A'}
                  </CTableDataCell>
                  <CTableDataCell>{item.country}</CTableDataCell>
                  <CTableDataCell>{item.occupation}</CTableDataCell>
                  <CTableDataCell>
                    <CBadge color="primary">{item.role}</CBadge>
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
