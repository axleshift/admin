import React, { useState, useCallback, useMemo } from 'react';
import { useGetLogsQuery } from '../../../state/adminApi';
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
  CPaginationItem
} from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faSync, faUndo } from '@fortawesome/free-solid-svg-icons';
import { useDebounce } from 'use-debounce';

const ITEMS_PER_PAGE = 50;

const LogsPage = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    username: '',
    name: '',
    department: '',
    role: '',
    action: '',
    route: '',
    startDate: '',
    endDate: new Date().toISOString().split('T')[0]
  });

  // Debounce filters to prevent excessive API calls
  const [debouncedFilters] = useDebounce(filters, 500);

  const {
    data = { logs: [], total: 0, pages: 0 },
    isLoading,
    isError,
    error,
    isFetching,
    refetch
  } = useGetLogsQuery({
    page,
    limit: ITEMS_PER_PAGE,
    filters: debouncedFilters
  });

  // Memoize the filter options
  const filterOptions = useMemo(() => {
    const options = {
      username: new Set(),
      department: new Set(),
      role: new Set(),
      action: new Set()
    };

    data.logs.forEach(log => {
      if (log.username) options.username.add(log.username);
      if (log.department) options.department.add(log.department);
      if (log.role) options.role.add(log.role);
      if (log.action) options.action.add(log.action);
    });

    return {
      username: Array.from(options.username).sort(),
      department: Array.from(options.department).sort(),
      role: Array.from(options.role).sort(),
      action: Array.from(options.action).sort()
    };
  }, [data.logs]);

  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1); // Reset to first page when filters change
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      username: '',
      name: '',
      department: '',
      role: '',
      action: '',
      route: '',
      startDate: '',
      endDate: new Date().toISOString().split('T')[0]
    });
    setPage(1);
  }, []);

  const renderPagination = () => {
    const totalPages = data.pages;
    const currentPage = page;
    const pageNumbers = [];

    // Calculate page numbers to show
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);

    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <CPagination className="justify-content-end">
        <CPaginationItem 
          disabled={currentPage === 1}
          onClick={() => setPage(p => Math.max(1, p - 1))}
        >
          Previous
        </CPaginationItem>

        {startPage > 1 && (
          <>
            <CPaginationItem onClick={() => setPage(1)}>1</CPaginationItem>
            {startPage > 2 && <CPaginationItem>...</CPaginationItem>}
          </>
        )}

        {pageNumbers.map(num => (
          <CPaginationItem
            key={num}
            active={currentPage === num}
            onClick={() => setPage(num)}
          >
            {num}
          </CPaginationItem>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <CPaginationItem>...</CPaginationItem>}
            <CPaginationItem onClick={() => setPage(totalPages)}>
              {totalPages}
            </CPaginationItem>
          </>
        )}

        <CPaginationItem 
          disabled={currentPage === totalPages}
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
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
          <CSpinner color="primary" />
          <p>Loading logs...</p>
        </CCardBody>
      </CCard>
    );
  }

  if (isError) {
    return (
      <CCard>
        <CCardBody className="text-center text-danger">
          Error loading logs: {error.message}
        </CCardBody>
      </CCard>
    );
  }

  return (
    <CCard>
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <h3>Activity Logs</h3>
        <div className="d-flex align-items-center">
          {isFetching && <CSpinner size="sm" className="me-2" />}
          <CButton 
            color="primary" 
            onClick={refetch}
            disabled={isFetching}
          >
            <FontAwesomeIcon icon={faSync} className="me-2" />
            Refresh
          </CButton>
        </div>
      </CCardHeader>

      <CCardBody>
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
                  <CFormInput
                    type="text"
                    label="Name"
                    name="name"
                    value={filters.name}
                    onChange={handleFilterChange}
                    placeholder="Filter by name"
                  />
                </CCol>

                <CCol md={4}>
                  <CFormSelect
                    label="Department"
                    name="department"
                    value={filters.department}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Departments</option>
                    {["HR", "Logistics", "Core", "Finance", "Administrative", ...filterOptions.department].map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </CFormSelect>
                </CCol>


                <CCol md={4}>
                <CFormSelect
                  label="Role"
                  name="role"
                  value={filters.role}
                  onChange={handleFilterChange}
                >
                  <option value="">All Roles</option>
                  {["Superadmin", "Admin", "Manager", ...filterOptions.role].map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </CFormSelect>
              </CCol>

                <CCol md={4}>
                  <CFormSelect
                    label="Action"
                    name="action"
                    value={filters.action}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Actions</option>
                    {filterOptions.action.map(action => (
                      <option key={action} value={action}>{action}</option>
                    ))}
                  </CFormSelect>
                </CCol>

                <CCol md={4}>
                  <CFormInput
                    type="text"
                    label="Route"
                    name="route"
                    value={filters.route}
                    onChange={handleFilterChange}
                    placeholder="Filter by route"
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
          <CBadge color="info" className="py-2">
            Showing {data.logs.length} of {data.total} logs
            {isFetching && <CSpinner size="sm" className="ms-2" />}
          </CBadge>
          {renderPagination()}
        </div>

        <CTable striped hover responsive className="mb-3">
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>Timestamp</CTableHeaderCell>
              <CTableHeaderCell>Username</CTableHeaderCell>
              <CTableHeaderCell>Name</CTableHeaderCell>
              <CTableHeaderCell>Department</CTableHeaderCell>
              <CTableHeaderCell>Role</CTableHeaderCell>
              <CTableHeaderCell>Action</CTableHeaderCell>
              <CTableHeaderCell>Route</CTableHeaderCell>
              <CTableHeaderCell>Description</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {data.logs.length === 0 ? (
              <CTableRow>
                <CTableDataCell colSpan="8" className="text-center">
                  No logs found matching the current filters.
                </CTableDataCell>
              </CTableRow>
            ) : (
              data.logs.map((log) => (
                <CTableRow key={log._id}>
                  <CTableDataCell>{new Date(log.timestamp).toLocaleString()}</CTableDataCell>
                  <CTableDataCell>{log.username}</CTableDataCell>
                  <CTableDataCell>{log.name}</CTableDataCell>
                  <CTableDataCell>{log.department}</CTableDataCell>
                  <CTableDataCell>{log.role}</CTableDataCell>
                  <CTableDataCell>
                    <CBadge color="primary">{log.action}</CBadge>
                  </CTableDataCell>
                  <CTableDataCell>{log.route}</CTableDataCell>
                  <CTableDataCell>{log.description}</CTableDataCell>
                </CTableRow>
              ))
            )}
          </CTableBody>
        </CTable>
        {data.pages > 1 && renderPagination()}
      </CCardBody>
    </CCard>
  );
};

export default LogsPage;