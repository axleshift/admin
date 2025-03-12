import React, { useState, useEffect } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CFormSelect,
  CFormInput,
  CButton,
  CPagination,
  CPaginationItem
} from '@coreui/react';
import axiosInstance from '../../../utils/axiosInstance'; 

const ActivityDashboard = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    userId: '',
    actionType: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1
  });
  
  const actionTypes = [
    'PAGE_VIEW',
    'BUTTON_CLICK',
    'FORM_SUBMIT',
    'SEARCH',
    'LOGIN',
    'LOGOUT'
  ];
  
  const fetchActivities = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const response = await axiosInstance.get(`/general/getact?${queryParams.toString()}`);
      
      if (response.data.success) {
        setActivities(response.data.data);
        setPagination({
          total: response.data.total,
          pages: response.data.pages
        });
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchActivities();
  }, [filters.page, filters.limit]);
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1 // Reset to first page when changing filters
    }));
  };
  
  const applyFilters = () => {
    fetchActivities();
  };
  
  const resetFilters = () => {
    setFilters({
      userId: '',
      actionType: '',
      startDate: '',
      endDate: '',
      page: 1,
      limit: 10
    });
  };
  
  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>User Activity Tracker</strong>
          </CCardHeader>
          <CCardBody>
            <CRow className="mb-3">
              <CCol sm={12} md={3}>
                <CFormInput
                  type="text"
                  name="userId"
                  value={filters.userId}
                  onChange={handleFilterChange}
                  placeholder="Filter by User ID"
                  className="mb-2"
                />
              </CCol>
              <CCol sm={12} md={3}>
                <CFormSelect
                  name="actionType"
                  value={filters.actionType}
                  onChange={handleFilterChange}
                  className="mb-2"
                >
                  <option value="">All Action Types</option>
                  {actionTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol sm={12} md={2}>
                <CFormInput
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  placeholder="Start Date"
                  className="mb-2"
                />
              </CCol>
              <CCol sm={12} md={2}>
                <CFormInput
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  placeholder="End Date"
                  className="mb-2"
                />
              </CCol>
              <CCol sm={12} md={2} className="d-flex">
                <CButton color="primary" onClick={applyFilters} className="me-2">
                  Apply
                </CButton>
                <CButton color="secondary" onClick={resetFilters}>
                  Reset
                </CButton>
              </CCol>
            </CRow>
            
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell scope="col">User</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Role</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Department</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Action Type</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Description</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Timestamp</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {loading ? (
                  <CTableRow>
                    <CTableDataCell colSpan="6" className="text-center">
                      Loading...
                    </CTableDataCell>
                  </CTableRow>
                ) : activities.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan="6" className="text-center">
                      No activities found
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  activities.map((activity) => (
                    <CTableRow key={activity._id}>
                      <CTableDataCell>{activity.name}</CTableDataCell>
                      <CTableDataCell>{activity.role}</CTableDataCell>
                      <CTableDataCell>{activity.department}</CTableDataCell>
                      <CTableDataCell>{activity.actionType}</CTableDataCell>
                      <CTableDataCell>{activity.actionDescription}</CTableDataCell>
                      <CTableDataCell>{formatDateTime(activity.timestamp)}</CTableDataCell>
                    </CTableRow>
                  ))
                )}
              </CTableBody>
            </CTable>
            
            <CPagination align="center" className="mt-3">
              <CPaginationItem 
                disabled={filters.page <= 1}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                Previous
              </CPaginationItem>
              
              {[...Array(pagination.pages).keys()].map(page => (
                <CPaginationItem 
                  key={page + 1}
                  active={page + 1 === filters.page}
                  onClick={() => setFilters(prev => ({ ...prev, page: page + 1 }))}
                >
                  {page + 1}
                </CPaginationItem>
              ))}
              
              <CPaginationItem 
                disabled={filters.page >= pagination.pages}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                Next
              </CPaginationItem>
            </CPagination>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default ActivityDashboard;