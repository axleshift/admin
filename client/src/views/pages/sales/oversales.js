import React, { useState, useEffect } from "react";
import { CCard, CCardBody, CCardHeader, CCol, CRow } from "@coreui/react";
import CustomHeader from "../../../components/header/customhead";
import OverviewChart from "./overviewChart";
import { useGetSalesQuery } from "../../../state/financeApi"; 
import PropTypes from 'prop-types';
import logActivity from './../../../utils/ActivityLogger'; // Import the logActivity function

const Overview = ({isDashboard = false}) => {
  const [view, setView] = useState("units");
  const [userInfo, setUserInfo] = useState({
    name: '',
    role: '',
    department: '',
    userId: ''
  });

  // Fetch data using the Redux Toolkit query hook
  const { data: salesData, isLoading, error } = useGetSalesQuery();

  // Get user information from sessionStorage on component mount
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

    // Log activity when component mounts - user viewed overview page
    logActivity({
      name: userName,
      role: userRole,
      department: userDepartment,
      route: isDashboard ? '/dashboard' : '/overview',
      action: 'View Finance Overview',
      description: `User accessed the finance overview ${isDashboard ? 'on dashboard' : 'page'}`
    });
  }, [isDashboard]);

  // Handle view change with activity logging
  const handleViewChange = (e) => {
    const newView = e.target.value;
    setView(newView);
    
    // Log activity when view changes
    logActivity({
      name: userInfo.name,
      role: userInfo.role,
      department: userInfo.department,
      route: isDashboard ? '/dashboard' : '/overview',
      action: 'Change View',
      description: `User changed finance overview view to: ${newView}`
    });
  };

  if (isLoading) return <div>Loading...</div>;
  
  if (error) {
    // Log error activity
    logActivity({
      name: userInfo.name,
      role: userInfo.role,
      department: userInfo.department,
      route: isDashboard ? '/dashboard' : '/overview',
      action: 'Error',
      description: 'Error occurred while loading finance overview data'
    });
    
    return <div>Error loading data</div>;
  }

  return (
    <CRow>
      <CCol xs={12} md={12}>
        <CCard>
          <CCardHeader>
            <CustomHeader title="Overview" subtitle="Overview of general revenue and profit" />
          </CCardHeader>
          <CCardBody>
            <CRow className="mb-3">
              <CCol xs={12} md={6}>
                <label htmlFor="viewSelect">View</label>
                <select
                  id="viewSelect"
                  value={view}
                  onChange={handleViewChange}
                  className="form-select"
                  aria-label="Select view"
                >
                  <option value="sales">Sales</option>
                  <option value="units">Units</option>
                </select>
              </CCol>
            </CRow>
            <OverviewChart view={view} salesData={salesData} />
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

Overview.propTypes = {
  isDashboard: PropTypes.bool, 
};

export default Overview;