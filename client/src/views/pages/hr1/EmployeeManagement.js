import React, { useState } from 'react';
import {
  CContainer,
  CRow,
  CCard,
  CCardBody,
  CCardHeader,
  CListGroup,
  CListGroupItem,
  CButton,
} from '@coreui/react';
import { useGetEmployeesQuery } from '../../../state/api'; // Adjust based on your API hook
import CustomHeader from '../../../components/header/customhead';
import ExcelJS from 'exceljs'; // Import the ExcelJS library
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';

const EmployeeManagement = () => {
  const { data: employees, error, isLoading } = useGetEmployeesQuery(); // Fetch all employee data
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null); // State to track selected employee

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error fetching employee data</div>;

  const handleEmployeeClick = (id) => {
    // Toggle the selected employee ID
    setSelectedEmployeeId((prevId) => (prevId === id ? null : id));
  };

  const handleDownloadAllAttendance = async () => {
    // Create a new workbook and a worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('All Employees Attendance');

    // Define column headers
    worksheet.columns = [
      { header: 'Employee Name', key: 'EmployeeName', width: 30 },
      { header: 'Email', key: 'Email', width: 30 },
      { header: 'Date', key: 'Date', width: 15 },
      { header: 'Status', key: 'Status', width: 15 },
    ];

    // Add attendance data
    employees.forEach((employee) => {
      employee.attendance.forEach((entry) => {
        worksheet.addRow({
          EmployeeName: `${employee.firstName} ${employee.lastName}`,
          Email: employee.email,
          Date: new Date(entry.date).toLocaleDateString(),
          Status: entry.status,
        });
      });
    });

    // Create a buffer and save the workbook
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    
    // Trigger the file download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'All_Employees_Attendance.xlsx';
    a.click();
    URL.revokeObjectURL(url); // Clean up
  };

  return (
    <CContainer m="1.5rem 2.5rem">
      <CRow>
        <CustomHeader title="Employee List" subtitle="Details of all employees" />

        {/* Download All Attendance Button */}
        <CButton
          color="info"
          onClick={handleDownloadAllAttendance}
          className="mb-3"
          size="sm"
          style={{
            width: '40px',
            height: '40px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <FontAwesomeIcon icon={faDownload} />
        </CButton>

        {employees.map((employee) => (
          <CCard
            key={employee._id}
            className="mb-3"
            style={{ cursor: 'pointer' }}
            onClick={() => handleEmployeeClick(employee._id)}
          >
            <CCardHeader>
              <h4>
                {employee.firstName} {employee.lastName}
              </h4>
            </CCardHeader>
            {selectedEmployeeId === employee._id && (
              <CCardBody>
                <CListGroup>
                  <CListGroupItem>Email: {employee.email}</CListGroupItem>
                  <CListGroupItem>Role: {employee.role}</CListGroupItem>
                  <CListGroupItem>Job Description: {employee.jobDescription}</CListGroupItem>
                  <CListGroupItem>
                    Date of Joining: {new Date(employee.dateOfJoining).toLocaleDateString()}
                  </CListGroupItem>
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
                      Review Date: {new Date(review.reviewDate).toLocaleDateString()} - Rating:{' '}
                      {review.rating}
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
