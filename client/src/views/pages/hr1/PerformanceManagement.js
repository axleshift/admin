import React from 'react';
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardHeader,
  CListGroup,
  CListGroupItem,
  CBadge,
  CSpinner,
  CAlert,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilUser, cilCheckCircle, cilChartLine } from '@coreui/icons';
import { useGetPerformanceReportQuery, useGetAttendanceReportQuery } from '../../../state/api'; 

const Reports = () => {
  const { data: performanceReport, error: performanceError, isLoading: performanceLoading } = useGetPerformanceReportQuery();
  const { data: attendanceReport, error: attendanceError, isLoading: attendanceLoading } = useGetAttendanceReportQuery();

  if (performanceLoading || attendanceLoading) {
    return (
      <CContainer>
        <CSpinner color="primary" />
      </CContainer>
    );
  }
  if (performanceError || attendanceError) {
    return (
      <CContainer>
        <CAlert color="danger">Error fetching report data. Please try again later.</CAlert>
      </CContainer>
    );
  }

  return (
    <CContainer>
      <CRow className="my-4">
        <CCol>
          <h2 className="text-center">Employee Reports</h2>
          <hr className="mt-0" />
        </CCol>
      </CRow>

      <CRow>
        <CCol md={6}>
          <CCard className="mb-4 shadow-sm">
            <CCardHeader className="bg-primary text-white">
              <CIcon icon={cilChartLine} className="me-2" />
              Performance Report
            </CCardHeader>
            <CCardBody>
              <CListGroup>
                {performanceReport.map((item, index) => (
                  <CListGroupItem key={index} className="d-flex justify-content-between align-items-center">
                    <div>
                      <CIcon icon={cilUser} className="me-2 text-info" />
                      {item.employeeName}
                    </div>
                    <div>
                      <CBadge color="success" className="me-2">
                        {item.averageRating}/5
                      </CBadge>
                      <span>Total Reviews: {item.totalReviews}</span>
                    </div>
                  </CListGroupItem>
                ))}
              </CListGroup>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol md={6}>
          <CCard className="mb-4 shadow-sm">
            <CCardHeader className="bg-primary text-white">
              <CIcon icon={cilCheckCircle} className="me-2" />
              Attendance Report
            </CCardHeader>
            <CCardBody>
              <CListGroup>
                {attendanceReport.map((item, index) => (
                  <CListGroupItem key={index} className="d-flex justify-content-between align-items-center">
                    <div>
                      <CIcon icon={cilUser} className="me-2 text-info" />
                      {item.employeeName}
                    </div>
                    <div>
                      <CBadge color="info" className="me-2">
                        {item.attendanceRate}%
                      </CBadge>
                      <span>
                        {item.presentDays}/{item.totalDays} days
                      </span>
                    </div>
                  </CListGroupItem>
                ))}
              </CListGroup>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default Reports;
