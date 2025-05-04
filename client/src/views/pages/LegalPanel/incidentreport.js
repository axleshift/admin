import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../utils/axiosInstance';
// Import CoreUI components
import {
  CCard,
  CCardBody,
  CCardHeader,
  CContainer,
  CSpinner,
  CBadge,
  CAlert
} from '@coreui/react';
// Import FontAwesome icons
import { 
  faExclamationTriangle, 
  faMapMarkerAlt, 
  faCalendarAlt, 
  faInfoCircle 
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function IncidentReportUpload() {
  const [incidentReports, setIncidentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIncidentReports = async () => {
      try {
        const response = await axiosInstance.get('/incidentreport/incidentall');
        console.log('API Response:', response.data);

        const data = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.data)
            ? response.data.data
            : [];

        setIncidentReports(data);
      } catch (err) {
        setError('Failed to fetch incident reports');
      } finally {
        setLoading(false);
      }
    };

    fetchIncidentReports();
  }, []);

  // Function to determine badge color based on severity
  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'secondary';
    }
  };

  // Function to determine status badge color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'danger';
      case 'in progress':
        return 'warning';
      case 'resolved':
        return 'success';
      case 'closed':
        return 'secondary';
      default:
        return 'primary';
    }
  };

  return (
    <div className="bg-light min-h-screen py-4">
      <CContainer>
        <CCard className="shadow">
          <CCardHeader className="bg-primary text-white">
            <h2 className="mb-0 d-flex align-items-center">
              <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
              Incident Reports
            </h2>
          </CCardHeader>
          <CCardBody>
            {loading && (
              <div className="text-center py-5">
                <CSpinner color="primary" />
                <p className="mt-3">Loading incident reports...</p>
              </div>
            )}
            
            {error && (
              <CAlert color="danger">
                <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                {error}
              </CAlert>
            )}

            {!loading && !error && Array.isArray(incidentReports) && incidentReports.length === 0 && (
              <CAlert color="info">
                <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                No incident reports found.
              </CAlert>
            )}

            {!loading && !error && Array.isArray(incidentReports) && incidentReports.length > 0 && (
              <div className="incident-list">
                {incidentReports.map((report, index) => (
                  <div key={index} className="border-bottom py-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h4 className="mb-0">{report.title || 'Untitled Report'}</h4>
                      <div>
                        <CBadge color={getSeverityColor(report.severity)} className="me-2">
                          Severity: {report.severity || 'N/A'}
                        </CBadge>
                        <CBadge color={getStatusColor(report.status)}>
                          {report.status || 'Unknown Status'}
                        </CBadge>
                      </div>
                    </div>
                    
                    <p className="text-secondary mb-2">{report.description || 'No description provided.'}</p>
                    
                    <div className="d-flex flex-wrap gap-3 text-muted small">
                      <div>
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" />
                        {report.location || 'Unknown Location'}
                      </div>
                      <div>
                        <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                        {report.reportDate ? new Date(report.reportDate).toLocaleDateString() : 'Unknown Date'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CCardBody>
        </CCard>
      </CContainer>
    </div>
  );
}