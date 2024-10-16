import React, { useState } from 'react';
import { CContainer, CRow, CCard, CCardBody, CCardHeader, CListGroup, CListGroupItem } from '@coreui/react';
import { useGetEmployeesQuery } from '../../../state/api'; // Adjust based on your API hook
import CustomHeader from '../../../components/header/customhead';

const EmployeeManagement = () => {
  const { data: employees, error, isLoading } = useGetEmployeesQuery(); // Fetch all employee data
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null); // State to track selected employee

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error fetching employee data</div>;

  const handleEmployeeClick = (id) => {
    // Toggle the selected employee ID
    setSelectedEmployeeId(prevId => (prevId === id ? null : id));
  };

  return (
    <CContainer m="1.5rem 2.5rem">
      <CRow>
        <CustomHeader title="Employee List" subtitle="Details of all employees" />
        {/* Render employee details here */}
        {employees.map(employee => (
          <CCard key={employee._id} className="mb-3" style={{ cursor: 'pointer' }} onClick={() => handleEmployeeClick(employee._id)}>
            <CCardHeader>
              <h4>{employee.firstName} {employee.lastName}</h4>
            </CCardHeader>
            {selectedEmployeeId === employee._id && (
              <CCardBody>
                <CListGroup>
                  <CListGroupItem>Email: {employee.email}</CListGroupItem>
                  <CListGroupItem>Role: {employee.role}</CListGroupItem>
                  <CListGroupItem>Job Description: {employee.jobDescription}</CListGroupItem>
                  <CListGroupItem>Date of Joining: {new Date(employee.dateOfJoining).toLocaleDateString()}</CListGroupItem>
                </CListGroup>

                {/* Attendance Section */}
                <h5>Attendance:</h5>
                <ul>
                  {employee.attendance.map((entry, index) => (
                    <li key={index} className={entry.status}>
                      Date: {new Date(entry.date).toLocaleDateString()} - Status: {entry.status}
                    </li>
                  ))}
                </ul>

                {/* Performance Section */}
                <h5>Performance:</h5>
                <ul>
                  {employee.performance.map((review, index) => (
                    <li key={index}>
                      Review Date: {new Date(review.reviewDate).toLocaleDateString()} - Rating: {review.rating} 
                      {review.comments && <span> - Comments: {review.comments}</span>}
                    </li>
                  ))}
                </ul>
              </CCardBody>
            )}
          </CCard>
        ))}
      </CRow>
    </CContainer>
  );
};

export default EmployeeManagement;
