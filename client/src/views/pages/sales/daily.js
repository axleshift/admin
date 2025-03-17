import React, { useState, useMemo, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useGetSalesQuery } from '../../../state/financeApi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CCard, CCardHeader, CCardBody, CRow, CCol } from '@coreui/react';
import CustomHeader from '../../../components/header/customhead';
import logActivity from './../../../utils/activityLogger'; // Import the logActivity function

const Daily = () => {
  const [startDate, setStartDate] = useState(new Date("2024-01-01"));
  const [endDate, setEndDate] = useState(new Date("2024-12-31"));
  const { data, isLoading, error } = useGetSalesQuery();
  
  // User information state
  const [userInfo, setUserInfo] = useState({
    name: '',
    role: '',
    department: '',
    userId: ''
  });

  // Retrieve user information on component mount and log activity
  useEffect(() => {
    const userName = sessionStorage.getItem('name');
    const userRole = sessionStorage.getItem('role');
    const userDepartment = sessionStorage.getItem('department');
    const userId = sessionStorage.getItem('userId');
    
    setUserInfo({
      name: userName,
      role: userRole,
      department: userDepartment,
      userId: userId
    });
    
    // Log activity when component mounts - user viewed daily sales page
    logActivity({
      name: userName,
      role: userRole,
      department: userDepartment,
      route: '/daily',
      action: 'View Daily Sales',
      description: 'User accessed the daily sales and units report'
    });
    
    // Log errors if they occur
    if (error) {
      logActivity({
        name: userName,
        role: userRole,
        department: userDepartment,
        route: '/daily',
        action: 'Error',
        description: 'Error occurred while loading daily sales data'
      });
    }
  }, [error]);

  // Handler for start date change with activity logging
  const handleStartDateChange = (date) => {
    setStartDate(date);
    
    // Log activity when date range changes
    logActivity({
      name: userInfo.name,
      role: userInfo.role,
      department: userInfo.department,
      route: 'daily',
      action: 'Filter Change',
      description: `User changed start date to ${date.toISOString().split('T')[0]}`
    });
  };

  // Handler for end date change with activity logging
  const handleEndDateChange = (date) => {
    setEndDate(date);
    
    // Log activity when date range changes
    logActivity({
      name: userInfo.name,
      role: userInfo.role,
      department: userInfo.department,
      route: '/daily',
      action: 'Filter Change',
      description: `User changed end date to ${date.toISOString().split('T')[0]}`
    });
  };

  // Filter and format the data based on start and end dates
  const formattedData = useMemo(() => {
    if (!data || !data.dailyData) return [];

    return data.dailyData
      .filter((entry) => {
        const entryDate = new Date(entry.date);
        return entryDate >= startDate && entryDate <= endDate;
      })
      .map((entry) => ({
        date: entry.date,
        sales: entry.totalSales,
        units: entry.totalUnits,
      }));
  }, [data, startDate, endDate]);

  return (
    <CRow>
      <CCol xs={12} md={12}>
        <CCard>
          <CCardHeader>
            <CustomHeader title="Daily" subtitle="Daily Sales and Units" />
          </CCardHeader>
          <CCardBody>
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <label>Start Date: </label>
                <DatePicker 
                  selected={startDate} 
                  onChange={handleStartDateChange} 
                  className="form-control"
                />
              </div>
              <div>
                <label>End Date: </label>
                <DatePicker 
                  selected={endDate} 
                  onChange={handleEndDateChange}
                  className="form-control"
                />
              </div>
            </div>

            {isLoading ? (
              <div>Loading data...</div>
            ) : error ? (
              <div>Error loading daily data</div>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={formattedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  {/* Sales line in green */}
                  <Line type="monotone" dataKey="sales" stroke="#4CAF50" name="Daily Sales" />
                  {/* Units line in orange */}
                  <Line type="monotone" dataKey="units" stroke="#FF9800" name="Daily Units" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default Daily;