import React, { useState, useCallback } from 'react';
import { useGetSecurityIncidentsQuery } from '../../../state/adminApi';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableBody,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CForm,
  CFormInput,
  CFormSelect,
  CButton,
  CRow,
  CCol,
  CSpinner,
  CBadge,
  CPagination,
  CPaginationItem,
  CAlert
} from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faSync, faUndo, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { useDebounce } from 'use-debounce';

const ITEMS_PER_PAGE = 50;

const SecurityIncidentsPage = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    username: '',
    severity: '',
    type: '',
    status: '',
    ipAddress: '',
    startDate: '',
    endDate: new Date().toISOString().split('T')[0]
  });

  // Debounce filters to prevent excessive API calls
  const [debouncedFilters] = useDebounce(filters, 500);

  const {
    data = { incidents: [], total: 0, pages: 0 },
    isLoading,
    isError,
    error,
    isFetching,
    refetch
  } = useGetSecurityIncidentsQuery({
    page,
    limit: ITEMS_PER_PAGE,
    filters: debouncedFilters
  });

  // Memoize filter options based on current data
  const filterOptions = React.useMemo(() => {
    const options = {
      username: new Set(),
      type: new Set(),
      severity: new Set(),
      status: new Set()
    };

    data.incidents.forEach(incident => {
      if (incident.username) options.username.add(incident.username);
      if (incident.type) options.type.add(incident.type);
      if (incident.severity) options.severity.add(incident.severity);
      if (incident.status) options.status.add(incident.status);
    });

    return {
      username: Array.from(options.username).sort(),
      type: Array.from(options.type).sort(),
      severity: Array.from(options.severity).sort(),
      status: Array.from(options.status).sort()
    };
  }, [data.incidents]);

  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1); // Reset to first page when filters change
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      username: '',
      severity: '',
      type: '',
      status: '',
      ipAddress: '',
      startDate: '',
      endDate: new Date().toISOString().split('T')[0]
    });
    setPage(1);
  }, []);

  const renderPagination = (currentPage, totalPages, setPageFn) => {
    const pageNumbers = [];
    
    // Calculate page numbers to show
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }
    
    // Populate pageNumbers array - this was missing in your original code
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return (
      <CPagination className="justify-content-end">
        <CPaginationItem 
          disabled={currentPage === 1}
          onClick={() => setPageFn(p => Math.max(1, p - 1))}
        >
          Previous
        </CPaginationItem>
        
        {startPage > 1 && (
          <>
            <CPaginationItem onClick={() => setPageFn(1)}>1</CPaginationItem>
            {startPage > 2 && <CPaginationItem>...</CPaginationItem>}
          </>
        )}
        
        {pageNumbers.map(num => (
          <CPaginationItem
            key={num}
            active={currentPage === num}
            onClick={() => setPageFn(num)}
          >
            {num}
          </CPaginationItem>
        ))}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <CPaginationItem>...</CPaginationItem>}
            <CPaginationItem onClick={() => setPageFn(totalPages)}>
              {totalPages}
            </CPaginationItem>
          </>
        )}
        
        <CPaginationItem 
          disabled={currentPage === totalPages}
          onClick={() => setPageFn(p => Math.min(totalPages, p + 1))}
        >
          Next
        </CPaginationItem>
      </CPagination>
    );
  };

  if (isLoading) {
    return (
      <CCard>
        <CCardBody className="text-center">
          <CSpinner color="danger" />
          <p>Loading security incidents...</p>
        </CCardBody>
      </CCard>
    );
  }

  if (isError) {
    return (
      <CCard>
        <CCardBody className="text-center text-danger">
          Error loading security incidents: {error.message}
        </CCardBody>
      </CCard>
    );
  }

  return (
    <CCard>
      <CCardHeader className="d-flex justify-content-between align-items-center bg-danger text-white">
        <h3>
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          Security Incidents
        </h3>
        <div>
          {isFetching && <CSpinner size="sm" color="light" className="me-2" />}
          <CButton 
            color="light" 
            onClick={refetch}
            disabled={isFetching}
          >
            <FontAwesomeIcon icon={faSync} className="me-2" />
            Refresh
          </CButton>
        </div>
      </CCardHeader>

      <CCardBody>
        <CAlert color="warning">
          <strong>Warning:</strong> This section displays potential security threats and unauthorized access attempts detected by the system.
        </CAlert>
        
        <CCard className="mb-4">
          <CCardHeader>
            <FontAwesomeIcon icon={faFilter} className="me-2" />
            Filters
          </CCardHeader>
          <CCardBody>
            <CForm>
              <CRow className="g-3">
                <CCol md={4}>
                  <CFormSelect
                    label="Username"
                    name="username"
                    value={filters.username}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Users</option>
                    {filterOptions.username.map(username => (
                      <option key={username} value={username}>{username}</option>
                    ))}
                  </CFormSelect>
                </CCol>

                <CCol md={4}>
                  <CFormSelect
                    label="Severity"
                    name="severity"
                    value={filters.severity}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Severities</option>
                    {["High", "Medium", "Low", ...filterOptions.severity].map(severity => (
                      <option key={severity} value={severity}>{severity}</option>
                    ))}
                  </CFormSelect>
                </CCol>

                <CCol md={4}>
                  <CFormSelect
                    label="Type"
                    name="type"
                    value={filters.type}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Types</option>
                    {["Unauthorized Access", "Brute Force", "SQL Injection", "XSS Attack", ...filterOptions.type].map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </CFormSelect>
                </CCol>

                <CCol md={4}>
                  <CFormSelect
                    label="Status"
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Statuses</option>
                    {["Open", "In Progress", "Resolved", ...filterOptions.status].map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </CFormSelect>
                </CCol>

                <CCol md={4}>
                  <CFormInput
                    type="text"
                    label="IP Address"
                    name="ipAddress"
                    value={filters.ipAddress}
                    onChange={handleFilterChange}
                    placeholder="Filter by IP address"
                  />
                </CCol>

                <CCol md={4}>
                  <CFormInput
                    type="date"
                    label="Start Date"
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                  />
                </CCol>

                <CCol md={4}>
                  <CFormInput
                    type="date"
                    label="End Date"
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleFilterChange}
                  />
                </CCol>

                <CCol xs={12} className="d-flex justify-content-end">
                  <CButton 
                    color="secondary" 
                    onClick={resetFilters}
                    disabled={isFetching}
                  >
                    <FontAwesomeIcon icon={faUndo} className="me-2" />
                    Reset Filters
                  </CButton>
                </CCol>
              </CRow>
            </CForm>
          </CCardBody>
        </CCard>

        <div className="mb-3 d-flex justify-content-between align-items-center">
          <CBadge color="danger" className="py-2">
            Showing {data.incidents.length} of {data.total} security incidents
            {isFetching && <CSpinner size="sm" className="ms-2" color="light" />}
          </CBadge>
          {data.pages > 1 && renderPagination(page, data.pages, setPage)}
        </div>

        <CTable striped hover responsive className="mb-3 border">
          <CTableHead>
            <CTableRow className="bg-danger text-white">
              <CTableHeaderCell>Timestamp</CTableHeaderCell>
              <CTableHeaderCell>Severity</CTableHeaderCell>
              <CTableHeaderCell>Type</CTableHeaderCell>
              <CTableHeaderCell>IP Address</CTableHeaderCell>
              <CTableHeaderCell>Username</CTableHeaderCell>
              <CTableHeaderCell>Location</CTableHeaderCell>
              <CTableHeaderCell>Details</CTableHeaderCell>
              <CTableHeaderCell>Status</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {data.incidents.length === 0 ? (
              <CTableRow>
                <CTableDataCell colSpan="8" className="text-center">
                  No security incidents found matching the current filters.
                </CTableDataCell>
              </CTableRow>
            ) : (
              data.incidents.map((incident) => (
                <CTableRow key={incident._id}>
                  <CTableDataCell>{new Date(incident.timestamp).toLocaleString()}</CTableDataCell>
                  <CTableDataCell>
                    <CBadge color={
                      incident.severity === 'High' ? 'danger' : 
                      incident.severity === 'Medium' ? 'warning' : 'info'
                    }>
                      {incident.severity}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell>{incident.type}</CTableDataCell>
                  <CTableDataCell>{incident.ipAddress}</CTableDataCell>
                  <CTableDataCell>{incident.username || 'Unknown'}</CTableDataCell>
                  <CTableDataCell>{incident.location || 'Unknown'}</CTableDataCell>
                  <CTableDataCell>{incident.details}</CTableDataCell>
                  <CTableDataCell>
                    <CBadge color={
                      incident.status === 'Resolved' ? 'success' : 
                      incident.status === 'In Progress' ? 'warning' : 'danger'
                    }>
                      {incident.status}
                    </CBadge>
                  </CTableDataCell>
                </CTableRow>
              ))
            )}
          </CTableBody>
        </CTable>
        {data.pages > 1 && renderPagination(page, data.pages, setPage)}
      </CCardBody>
    </CCard>
  );
};

export default SecurityIncidentsPage;