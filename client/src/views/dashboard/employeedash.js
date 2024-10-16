import React from 'react';
import { useParams } from 'react-router-dom'; 
import { useGetEmployeeDetailsQuery } from '../../state/api';
import CustomHeader from '../../components/header/customhead';
import { CCard, CCardBody, CRow } from '@coreui/react';

const EmployeeDashboard = () => {
  const { employeeId } = useParams(); // Fetch employeeId from URL
  const { data, isLoading, error } = useGetEmployeeDetailsQuery(employeeId); // Call API with employeeId

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading employee details.</div>;

  return (
    <CCard>
      <CRow>
        <CustomHeader title="Performance Dashboard" subtitle="Employee Performance Dashboard" />
      </CRow>
      <CCardBody>
        {data ? (
          <div>
            <h2>{data.name}</h2>
            <p>{data.position}</p>
          </div>
        ) : (
          <div>No employee data available.</div>
        )}
      </CCardBody>
    </CCard>
  );
};

export default EmployeeDashboard;
