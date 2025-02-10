import React, { useState } from 'react';
import { useGetpayrollQuery } from '../../../../state/api'; // Correct API hook import
import { CCard, CCardBody, CCardHeader, CCol, CRow, CFormSelect } from '@coreui/react';

const Payroll = () => {
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const { data, error, isLoading, isSuccess } = useGetpayrollQuery();

  if (isLoading) {
    return <div>Loading payroll data...</div>;
  }

  if (error) {
    return <div>Error fetching payroll data</div>;
  }

  const handleDepartmentChange = (event) => {
    setSelectedDepartment(event.target.value);
  };

  // Filter data based on the selected department
  const filteredData = selectedDepartment === 'all' 
    ? data 
    : data.filter(user => user.department === selectedDepartment);

  if (isSuccess && data) {
    return (
      <>
        {/* Department Filter Dropdown */}
        <CFormSelect value={selectedDepartment} onChange={handleDepartmentChange} className="mb-3">
          <option value="all">All Departments</option>
          <option value="HR">HR</option>
          <option value="Core">Core</option>
          <option value="Finance">Finance</option>
          <option value="Administrative">Administrative</option>
          <option value="Logistics">Logistics</option>
        </CFormSelect>

        {/* Payroll Cards */}
        <CRow>
          {filteredData.map((user, index) => (
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
      </>
    );
  }

  return <div>No payroll information available.</div>;
};

export default Payroll;