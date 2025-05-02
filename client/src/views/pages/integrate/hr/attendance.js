// AttendanceDashboard.jsx
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../../utils/axiosInstance';
import '../../../../scss/attendance.scss'; // Import your custom styles for the component

const AttendanceDashboard = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [filterActive, setFilterActive] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);
  const [showingAbsences, setShowingAbsences] = useState(false);

  // Fetch all attendance data when component mounts
  useEffect(() => {
    fetchAllAttendance();
  }, []);

  // Function to fetch all attendance
  const fetchAllAttendance = async () => {
    try {
      setLoading(true);
      setFilterActive(false);
      setShowingAbsences(false);
      const response = await axiosInstance.get('/hr/attendance');
      setAttendanceData(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch attendance data');
      setLoading(false);
      console.error('Error fetching attendance data:', err);
    }
  };

  // Function to fetch attendance by employee ID
  const fetchEmployeeAttendance = async () => {
    if (!employeeId.trim()) {
      setError('Please enter a valid employee ID');
      return;
    }

    try {
      setLoading(true);
      setFilterActive(true);
      setShowingAbsences(false);

      const response = await axiosInstance.get(`/hr/attendance/employee/${employeeId}`);
      setAttendanceData(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch employee attendance data');
      setLoading(false);
      console.error('Error fetching employee attendance data:', err);
    }
  };

  // Function to fetch attendance by date range
  const fetchAttendanceByDateRange = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    try {
      setLoading(true);
      setFilterActive(true);
      setShowingAbsences(false);
      const response = await axiosInstance.get('/hr/attendance/daterange', {
        params: { startDate, endDate }
      });
      setAttendanceData(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch attendance data for selected dates');
      setLoading(false);
      console.error('Error fetching attendance by date range:', err);
    }
  };

  // Function to filter and show only absences
  const showOnlyAbsences = () => {
    setLoading(true);
    setShowingAbsences(true);
    
    // Filter the current data to show only absences
    // This avoids making another API call if we already have the data
    const filteredData = attendanceData.filter(record => 
      record.status === 'Absent'
    );
    
    setAttendanceData(filteredData);
    setCurrentPage(1); // Reset to first page
    setLoading(false);
  };

  // Function to reset filters
  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setEmployeeId('');
    setError(null);
    setShowingAbsences(false);
    fetchAllAttendance();
  };

  // Function to format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Function to format time for display
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString;
  };

  // Function to generate pagination numbers with ellipses
  const getPaginationNumbers = (currentPage, totalPages) => {
    // Always show first page, last page, current page, and pages adjacent to current page
    const pageNumbers = [];
    
    if (totalPages <= 7) {
      // If we have 7 or fewer pages, show all page numbers
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always add first page
      pageNumbers.push(1);
      
      // Determine start and end of page numbers around current page
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Add ellipsis if needed before the middle pages
      if (startPage > 2) {
        pageNumbers.push('ellipsis-start');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis if needed after the middle pages
      if (endPage < totalPages - 1) {
        pageNumbers.push('ellipsis-end');
      }
      
      // Always add last page
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  // Pagination calculation
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = attendanceData.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(attendanceData.length / recordsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Go to next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  // Go to previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="attendance-dashboard">
      <header className="dashboard-header">
        <h1>Attendance Dashboard</h1>
        <div className="action-buttons">
          <button 
            className={`absence-button ${showingAbsences ? 'active' : ''}`}
            onClick={showOnlyAbsences}
            disabled={loading || attendanceData.length === 0}
          >
            Show Absences Only
          </button>
        </div>
      </header>

      <div className="filter-section">
        <div className="date-filter">
          <h3>Filter by Date Range</h3>
          <div className="date-inputs">
            <div className="input-group">
              <label htmlFor="start-date">Start Date:</label>
              <input
                type="date"
                id="start-date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label htmlFor="end-date">End Date:</label>
              <input
                type="date"
                id="end-date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <button 
              className="filter-button"
              onClick={fetchAttendanceByDateRange}
              disabled={!startDate || !endDate}
            >
              Apply Date Filter
            </button>
          </div>
        </div>

        <div className="employee-filter">
          <h3>Filter by Employee</h3>
          <div className="employee-inputs">
            <div className="input-group">
              <label htmlFor="employee-id">Employee ID:</label>
              <input
                type="text"
                id="employee-id"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="Enter employee ID"
              />
            </div>
            <button 
              className="filter-button"
              onClick={fetchEmployeeAttendance}
              disabled={!employeeId.trim()}
            >
              Find Employee
            </button>
          </div>
        </div>

        {(filterActive || showingAbsences) && (
          <button className="reset-button" onClick={resetFilters}>
            Reset Filters
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="attendance-data">
        <h2>
          {showingAbsences 
            ? 'Absence Records' 
            : 'Attendance Records'}
          {showingAbsences && <span className="record-count"> ({attendanceData.length})</span>}
        </h2>
        
        {loading ? (
          <div className="loading">Loading attendance data...</div>
        ) : attendanceData.length === 0 ? (
          <div className="no-data">
            {showingAbsences 
              ? 'No absence records found' 
              : 'No attendance records found'}
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>Employee Name</th>
                    <th>Employee ID</th>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Status</th>
                    <th>Department</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.map((record, index) => (
                    <tr key={index} className={record.status === 'Absent' ? 'absent-row' : ''}>
                      <td>{record.employee?.name || 'N/A'}</td>
                      <td>{record.employee?.id || record.employeeId || 'N/A'}</td>
                      <td>{formatDate(record.date)}</td>
                      <td className={record.checkIn ? 'check-in' : 'no-check'}>
                        {formatTime(record.checkIn)}
                      </td>
                      <td className={record.checkOut ? 'check-out' : 'no-check'}>
                        {formatTime(record.checkOut)}
                      </td>
                      <td className={`status-${record.status?.toLowerCase() || 'unknown'}`}>
                        {record.status || 'Unknown'}
                      </td>
                      <td>{record.employee?.department || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="pagination-container">
              <div className="pagination-info">
                Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, attendanceData.length)} of {attendanceData.length} records
              </div>
              <div className="pagination-controls">
                <button 
                  className="pagination-button" 
                  onClick={prevPage} 
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <div className="pagination-pages">
                  {getPaginationNumbers(currentPage, totalPages).map((number, index) => (
                    number === 'ellipsis-start' || number === 'ellipsis-end' ? (
                      <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                        …
                      </span>
                    ) : (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`pagination-number ${currentPage === number ? 'active' : ''}`}
                      >
                        {number}
                      </button>
                    )
                  ))}
                </div>
                <button 
                  className="pagination-button" 
                  onClick={nextPage} 
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AttendanceDashboard;