import React from 'react';
import { useGetpayrollQuery } from '../../../state/api'; // Correct API hook import
import { CCard, CCardBody, CCardHeader, CCol, CRow } from '@coreui/react';

const Payroll = () => {
  // Use the query to get all payroll data
  const { data, error, isLoading, isSuccess } = useGetpayrollQuery();

  if (isLoading) {
    return <div>Loading payroll data...</div>;
  }

  if (error) {
    return <div>Error fetching payroll data</div>;
  }

  if (isSuccess && data) {
    return (
      <CRow>
        {data.map((user, index) => (
          <CCol xs="12" sm="6" lg="4" key={index}>
            <CCard>
              <CCardHeader>Payroll Information - {user.name}</CCardHeader>
              <CCardBody>
                {/* Add safe checks to prevent errors when payroll data is missing */}
                <div><strong>Salary:</strong> ${user.payroll?.salary ?? 'N/A'}</div>
                <div><strong>Bonus:</strong> ${user.payroll?.bonus ?? 'N/A'}</div>
                <div><strong>Deductions:</strong> ${user.payroll?.deductions ?? 'N/A'}</div>
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>
    );
  }

  return <div>No payroll information available.</div>;
};

export default Payroll;
