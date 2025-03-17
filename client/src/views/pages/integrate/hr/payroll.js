import React, { useState, useEffect } from 'react';
import { useGetpayrollQuery } from '../../../../state/hrApi'; 
import { CCard, CCardBody, CCardHeader, CCol, CRow, CFormSelect } from '@coreui/react';
import logActivity from '../../../../utils/activityLogger'; 

const Payroll = () => {
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const { data, error, isLoading, isSuccess } = useGetpayrollQuery();
  const [userInfo, setUserInfo] = useState({
    name: '',
    role: '',
    department: '',
    userId: ''
  });

  
  useEffect(() => {
    setUserInfo({
      name: sessionStorage.getItem('name'),
      role: sessionStorage.getItem('role'),
      department: sessionStorage.getItem('department'),
      userId: sessionStorage.getItem('userId')
    });

    
    logActivity({
      name: sessionStorage.getItem('name'),
      role: sessionStorage.getItem('role'),
      department: sessionStorage.getItem('department'),
      route: '/payroll',
      action: 'View Payroll',
      description: 'User accessed the payroll information page'
    });
  }, []);

  if (isLoading) {
    return <div>Loading payroll data...</div>;
  }

  if (error) {
    
    logActivity({
      name: userInfo.name,
      role: userInfo.role,
      department: userInfo.department,
      route: '/payroll',
      action: 'Error',
      description: 'Error occurred while fetching payroll data'
    });
    
    return <div>Error fetching payroll data</div>;
  }

  const handleDepartmentChange = (event) => {
    const newDepartment = event.target.value;
    setSelectedDepartment(newDepartment);
    
    
    logActivity({
      name: userInfo.name,
      role: userInfo.role,
      department: userInfo.department,
      route: '/payroll',
      action: 'Filter Change',
      description: `User filtered payroll by department: ${newDepartment}`
    });
  };

  
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
              <CCard className="mb-4">
                <CCardHeader>Payroll Information - {user.name}</CCardHeader>
                <CCardBody>
                  {/* Add safe checks to prevent errors when payroll data is missing */}
                  <div><strong>Salary:</strong> ${user.payroll?.salary ?? 'N/A'}</div>
                  <div><strong>Bonus:</strong> ${user.payroll?.bonus ?? 'N/A'}</div>
                  <div><strong>Deductions:</strong> ${user.payroll?.deductions ?? 'N/A'}</div>
                  <div><strong>Department:</strong> {user.department}</div>
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