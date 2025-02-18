import React, { useEffect, useState } from 'react';
import axios from 'axios';
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
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
} from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faSearch, faDownload, faSync, faChartBar } from '@fortawesome/free-solid-svg-icons';

const LogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    username: '',
    department: '',
    action: '',
    route: '',
    startDate: '',
    endDate: new Date().toISOString().split('T')[0],
  });
  const [groupBy, setGroupBy] = useState('none');

  // Activity types with associated colors
  const activityTypes = {
    'Chat Opened': 'info',
    'Message Sent': 'primary',
    'Access Request Initiated': 'warning',
    'Page Access Requested': 'danger',
    'Status Check': 'success',
    'Page Navigation': 'dark',
    'Button Click': 'light',
  };

  useEffect(() => {
    fetchLogs();

    // Set up auto-refresh every 5 minutes
    const refreshInterval = setInterval(fetchLogs, 300000);
    return () => clearInterval(refreshInterval);
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5053/try/logs');

      // Filter out logs related to '/logs/activity' to avoid recursion
      const filteredLogs = response.data.filter(log => log.route !== '/logs/activity');
      setLogs(filteredLogs);
      setFilteredLogs(filteredLogs);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching logs:', error);
      setError('Failed to fetch activity logs. Please try again later.');
      setLoading(false);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [filters, logs, groupBy]);

  const applyFilters = () => {
    let result = [...logs];

    // Apply text filters
    if (filters.username) {
      result = result.filter(log => 
        log.username && log.username.toLowerCase().includes(filters.username.toLowerCase())
      );
    }
    if (filters.department) {
      result = result.filter(log => 
        log.department && log.department.toLowerCase().includes(filters.department.toLowerCase())
      );
    }
    if (filters.action) {
      result = result.filter(log => 
        log.action && log.action.toLowerCase().includes(filters.action.toLowerCase())
      );
    }
    if (filters.route) {
      result = result.filter(log => 
        log.route && log.route.toLowerCase().includes(filters.route.toLowerCase())
      );
    }

    // Apply date filters
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      result = result.filter(log => new Date(log.timestamp) >= startDate);
    }
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999); // Set to end of day
      result = result.filter(log => new Date(log.timestamp) <= endDate);
    }

    // Apply grouping if selected
    if (groupBy !== 'none') {
      const grouped = groupLogs(result, groupBy);
      setFilteredLogs(grouped);
    } else {
      setFilteredLogs(result);
    }
  };

  const groupLogs = (logs, groupByField) => {
    // Group logs by the selected field
    const groupedData = {};
    logs.forEach(log => {
      const key = log[groupByField] || 'Unknown';
      if (!groupedData[key]) {
        groupedData[key] = [];
      }
      groupedData[key].push(log);
    });

    // Convert grouped data to array format
    const result = [];
    Object.keys(groupedData).forEach(key => {
      const group = groupedData[key];
      // Create a summary log
      const summary = {
        _id: `group_${key}`,
        username: key,
        name: key,
        department: groupByField === 'department' ? key : group[0].department,
        role: group[0].role,
        route: groupByField === 'route' ? key : 'Multiple',
        action: groupByField === 'action' ? key : 'Multiple Activities',
        description: `${group.length} activities`,
        timestamp: new Date().toISOString(),
        isGroupHeader: true,
        count: group.length,
        activities: group
      };
      result.push(summary);
    });

    return result;
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      username: '',
      department: '',
      action: '',
      route: '',
      startDate: '',
      endDate: new Date().toISOString().split('T')[0],
    });
    setGroupBy('none');
  };

  const exportToCSV = () => {
    // Convert filtered logs to CSV
    const headers = ['Username', 'Name', 'Department', 'Role', 'Route', 'Action', 'Description', 'Timestamp'];
    const csvData = filteredLogs.filter(log => !log.isGroupHeader).map(log => [
      log.username,
      log.name,
      log.department,
      log.role,
      log.route,
      log.action,
      log.description,
      new Date(log.timestamp).toLocaleString()
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell || ''}"`).join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `user_activity_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get unique actions for filter dropdown
  const uniqueActions = [...new Set(logs.map(log => log.action))].filter(Boolean);
  const uniqueDepartments = [...new Set(logs.map(log => log.department))].filter(Boolean);

  const renderLogs = () => {
    if (loading) {
      return (
        <CTableRow>
          <CTableDataCell colSpan="8" className="text-center">
            <CSpinner color="primary" />
            <p>Loading logs...</p>
          </CTableDataCell>
        </CTableRow>
      );
    }

    if (error) {
      return (
        <CTableRow>
          <CTableDataCell colSpan="8" className="text-center text-danger">
            {error}
          </CTableDataCell>
        </CTableRow>
      );
    }

    if (filteredLogs.length === 0) {
      return (
        <CTableRow>
          <CTableDataCell colSpan="8" className="text-center">
            No activity logs found matching the current filters.
          </CTableDataCell>
        </CTableRow>
      );
    }

    return filteredLogs.map((log) => (
      <React.Fragment key={log._id}>
        <CTableRow className={log.isGroupHeader ? 'table-active' : ''}>
          <CTableDataCell>
            {log.isGroupHeader ? (
              <strong>{log.username} ({log.count})</strong>
            ) : (
              log.username
            )}
          </CTableDataCell>
          <CTableDataCell>{log.name}</CTableDataCell>
          <CTableDataCell>{log.department}</CTableDataCell>
          <CTableDataCell>{log.role}</CTableDataCell>
          <CTableDataCell>{log.route}</CTableDataCell>
          <CTableDataCell>
            {log.action && activityTypes[log.action] ? (
              <CBadge color={activityTypes[log.action]}>{log.action}</CBadge>
            ) : (
              log.action
            )}
          </CTableDataCell>
          <CTableDataCell>{log.description}</CTableDataCell>
          <CTableDataCell>
            {log.isGroupHeader ? (
              <strong>Group</strong>
            ) : (
              new Date(log.timestamp).toLocaleString()
            )}
          </CTableDataCell>
        </CTableRow>
        {log.isGroupHeader && log.activities && (
          <CTableRow className="d-none">
            <CTableDataCell colSpan="8">
              <CTable hover size="sm">
                <CTableBody>
                  {log.activities.map((activity, idx) => (
                    <CTableRow key={`${log._id}_activity_${idx}`}>
                      <CTableDataCell>{activity.username}</CTableDataCell>
                      <CTableDataCell>{activity.name}</CTableDataCell>
                      <CTableDataCell>{activity.department}</CTableDataCell>
                      <CTableDataCell>{activity.role}</CTableDataCell>
                      <CTableDataCell>{activity.route}</CTableDataCell>
                      <CTableDataCell>
                        {activity.action && activityTypes[activity.action] ? (
                          <CBadge color={activityTypes[activity.action]}>{activity.action}</CBadge>
                        ) : (
                          activity.action
                        )}
                      </CTableDataCell>
                      <CTableDataCell>{activity.description}</CTableDataCell>
                      <CTableDataCell>{new Date(activity.timestamp).toLocaleString()}</CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CTableDataCell>
          </CTableRow>
        )}
      </React.Fragment>
    ));
  };

  return (
    <CCard>
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <h3>User Activity Logs</h3>
        <div className="d-flex">
          <CButton color="success" size="sm" className="me-2" onClick={fetchLogs}>
            <FontAwesomeIcon icon={faSync} className="me-1" /> Refresh
          </CButton>
          <CButton color="primary" size="sm" onClick={exportToCSV}>
            <FontAwesomeIcon icon={faDownload} className="me-1" /> Export CSV
          </CButton>
        </div>
      </CCardHeader>
      <CCardBody>
        {/* Filters */}
        <CCard className="mb-4">
          <CCardHeader>
            <FontAwesomeIcon icon={faFilter} className="me-2" />
            Filters
          </CCardHeader>
          <CCardBody>
            <CForm className="row g-3">
              <CCol md={4}>
                <CFormInput
                  type="text"
                  id="username"
                  name="username"
                  label="Username"
                  placeholder="Filter by username"
                  value={filters.username}
                  onChange={handleFilterChange}
                />
              </CCol>
              <CCol md={4}>
                <CFormSelect
                  id="department"
                  name="department"
                  label="Department"
                  value={filters.department}
                  onChange={handleFilterChange}
                >
                  <option value="">All Departments</option>
                  {uniqueDepartments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={4}>
                <CFormSelect
                  id="action"
                  name="action"
                  label="Activity Type"
                  value={filters.action}
                  onChange={handleFilterChange}
                >
                  <option value="">All Activities</option>
                  {uniqueActions.map(action => (
                    <option key={action} value={action}>{action}</option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={4}>
                <CFormInput
                  type="text"
                  id="route"
                  name="route"
                  label="Route/Page"
                  placeholder="Filter by route"
                  value={filters.route}
                  onChange={handleFilterChange}
                />
              </CCol>
              <CCol md={3}>
                <CFormInput
                  type="date"
                  id="startDate"
                  name="startDate"
                  label="Start Date"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                />
              </CCol>
              <CCol md={3}>
                <CFormInput
                  type="date"
                  id="endDate"
                  name="endDate"
                  label="End Date"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                />
              </CCol>
              <CCol md={2}>
                <label className="form-label">Group By</label>
                <CFormSelect
                  id="groupBy"
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value)}
                >
                  <option value="none">No Grouping</option>
                  <option value="username">User</option>
                  <option value="department">Department</option>
                  <option value="action">Activity Type</option>
                  <option value="route">Page/Route</option>
                </CFormSelect>
              </CCol>
              <CCol md={12} className="d-flex justify-content-end">
                <CButton color="secondary" onClick={resetFilters}>
                  Reset Filters
                </CButton>
              </CCol>
            </CForm>
          </CCardBody>
        </CCard>

        {/* Stats summary */}
        <CCard className="mb-4">
          <CCardHeader>
            <FontAwesomeIcon icon={faChartBar} className="me-2" />
            Activity Summary
          </CCardHeader>
          <CCardBody>
            <CRow>
              <CCol md={3}>
                <div className="bg-info text-white p-3 rounded">
                  <h5>Total Activities</h5>
                  <h3>{logs.length}</h3>
                </div>
              </CCol>
              <CCol md={3}>
                <div className="bg-primary text-white p-3 rounded">
                  <h5>Unique Users</h5>
                  <h3>{new Set(logs.map(log => log.username)).size}</h3>
                </div>
              </CCol>
              <CCol md={3}>
                <div className="bg-warning text-white p-3 rounded">
                  <h5>Today's Activities</h5>
                  <h3>
                    {logs.filter(log => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return new Date(log.timestamp) >= today;
                    }).length}
                  </h3>
                </div>
              </CCol>
              <CCol md={3}>
                <div className="bg-danger text-white p-3 rounded">
                  <h5>Access Requests</h5>
                  <h3>
                    {logs.filter(log => 
                      log.action && (
                        log.action.includes('Access Request') || 
                        log.action.includes('Page Access')
                      )
                    ).length}
                  </h3>
                </div>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>

        {/* Results count */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6>Showing {filteredLogs.length} of {logs.length} activities</h6>
          <div>
            <CDropdown>
              <CDropdownToggle color="secondary" size="sm">Sort By</CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem onClick={() => {
                  const sorted = [...filteredLogs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                  setFilteredLogs(sorted);
                }}>
                  Newest First
                </CDropdownItem>
                <CDropdownItem onClick={() => {
                  const sorted = [...filteredLogs].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                  setFilteredLogs(sorted);
                }}>
                  Oldest First
                </CDropdownItem>
                <CDropdownItem onClick={() => {
                  const sorted = [...filteredLogs].sort((a, b) => (a.username || '').localeCompare(b.username || ''));
                  setFilteredLogs(sorted);
                }}>
                  Username (A-Z)
                </CDropdownItem>
                <CDropdownItem onClick={() => {
                  const sorted = [...filteredLogs].sort((a, b) => (a.action || '').localeCompare(b.action || ''));
                  setFilteredLogs(sorted);
                }}>
                  Activity Type
                </CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
          </div>
        </div>

        {/* Table of logs */}
        <CTable striped hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>Username</CTableHeaderCell>
              <CTableHeaderCell>Name</CTableHeaderCell>
              <CTableHeaderCell>Department</CTableHeaderCell>
              <CTableHeaderCell>Role</CTableHeaderCell>
              <CTableHeaderCell>Route</CTableHeaderCell> 
              <CTableHeaderCell>Action</CTableHeaderCell>
              <CTableHeaderCell>Description</CTableHeaderCell>
              <CTableHeaderCell>Timestamp</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {renderLogs()}
          </CTableBody>
        </CTable>
      </CCardBody>
    </CCard>
  );
};

export default LogsPage;