import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CContainer,
  CRow,
  CCol,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CBadge,
  CCard,
} from '@coreui/react';
import CustomHeader from '../../components/header/customhead';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCartShopping, 
  faChartLine, 
  faDownload, 
  faShippingFast,
  faCalendarAlt,
  faUser
 } from '@fortawesome/free-solid-svg-icons';
import { useGetDashboardQuery, useGetShippingQuery } from '../../state/adminApi';
import StatBox from '../pages/scene/statbox';
import OverviewChart from '../pages/sales/overviewChart';
import MonthlySalesChart from '../pages/integrate/finance/scene/monthchart';

import Papa from 'papaparse';
import '../../scss/dashboard.scss';
import Loader from '../../components/Loader';  
import FreightTable from '../pages/integrate/core/shipment';
import axiosInstance from '../../utils/axiosInstance';
import logActivity from '../../utils/activityLogger'

const Employeedash = () => {
  const navigate = useNavigate();
  const [isNonMediumScreens, setIsNonMediumScreens] = useState(window.innerWidth > 768);
  const [accessToken, setAccessToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [shipmentData, setShipmentData] = useState([]);
  const [error, setError] = useState(null);
  const [currentMonthData, setCurrentMonthData] = useState(null);
  const [previousMonthData, setPreviousMonthData] = useState(null);
  const [salesLoading, setSalesLoading] = useState(true);
  const { data: dashboardData, isLoading: isDashboardLoading } = useGetDashboardQuery();
  const { data: shippingData, isLoading: isShippingLoading } = useGetShippingQuery();
  const userName = localStorage.getItem('name'); 
  const userRole = localStorage.getItem('role');
 const userDepartment = localStorage.getItem('department');
  const userUsername = localStorage.getItem('username');
  // Added missing state variables
  const [userData, setUsers] = useState([]);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState(null);
  
  const [yearlyData, setYearlyData] = useState(null);
  const [isYearlyLoading, setIsYearlyLoading] = useState(true);

  logActivity({
    name: userName,
    role: userRole,
    department: userDepartment,
    route: 'Admin Dashboard',
    action: 'Navigate',
    description: `${userName} Navigate to Admin Dashboard`
  }).catch(console.warn);
  
  useEffect(() => {
    const handleResize = () => setIsNonMediumScreens(window.innerWidth > 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
    } else {
      setAccessToken(token);
    }
  }, [navigate]);


  useEffect(() => {
    const fetchMonthlySalesData = async () => {
      try {
        setSalesLoading(true);
        
        // Fetch monthly sales data
        const salesResponse = await axiosInstance.get('/finance/monthlysalesrevenue');
        
        if (salesResponse.data && Array.isArray(salesResponse.data) && salesResponse.data.length > 0) {
          // Get current month and year
          const now = new Date();
          const currentMonth = now.toLocaleString('en-US', { month: 'long' });
          const currentYear = now.getFullYear();
          
          // Find the current month's data
          const current = salesResponse.data.find(item => 
            item.month === currentMonth && item.year === currentYear
          );
          
          // Get previous month data
          const prevDate = new Date(now);
          prevDate.setMonth(prevDate.getMonth() - 1);
          const prevMonth = prevDate.toLocaleString('en-US', { month: 'long' });
          const prevYear = prevDate.getFullYear();
          
          const previous = salesResponse.data.find(item => 
            item.month === prevMonth && item.year === prevYear
          );
          
          // If we found the current month's data, use it
          if (current) {
            setCurrentMonthData(current);
          } else {
            // If current month not found, get the most recent data as fallback
            const sortedData = [...salesResponse.data].sort((a, b) => {
              const dateA = new Date(`${a.month} 1, ${a.year}`);
              const dateB = new Date(`${b.month} 1, ${b.year}`);
              return dateB - dateA;
            });
            
            setCurrentMonthData(sortedData[0]);
            console.log('Current month data not found, using most recent:', sortedData[0]);
          }
          
          if (previous) {
            setPreviousMonthData(previous);
          }
        }
        
        setSalesLoading(false);
      } catch (err) {
        console.error('Failed to fetch monthly sales data:', err);
        setError(prev => prev || 'An error occurred while fetching sales data');
        setSalesLoading(false);
      }
    };
    
    const fetchYearlyData = async () => {
      try {
        setIsYearlyLoading(true);
        
        const yearlyResponse = await axiosInstance.get('/finance/yearlysalesrevenue');
        
        if (yearlyResponse.data) {
          setYearlyData(yearlyResponse.data);
        }
        
        setIsYearlyLoading(false);
      } catch (err) {
        console.error('Failed to fetch yearly data:', err);
        // Handle the error as needed for your dashboard
        setIsYearlyLoading(false);
      }
    };
    
    const fetchFreightData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/core/fetch-core');
        const fetchedData = response.data?.data || [];
        setShipmentData(fetchedData);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to fetch shipment data');
        setLoading(false);
      }
    };
    
    const fetchAllUsers = async () => {
      try {
        setUserLoading(true);
        const response = await axiosInstance.get('/hr/worker');
        const userData = response.data || [];
        setUsers(userData);
        setUserLoading(false);
      } catch (err) {
        setUserError(err.message || 'Failed to fetch user data');
        setUserLoading(false);
        console.error('Error fetching users:', err);
      }
    };
    
    // Call all functions
    fetchAllUsers();
    fetchFreightData();
    fetchYearlyData();
    fetchMonthlySalesData();
  }, []);
  
  const totalShipments = shipmentData.length;
  const currentYear = new Date().getFullYear();
  const totalEmployees = userData.length;

  // Calculate month-over-month changes
  const calculateChange = (current, previous) => {
    if (!previous || previous === 0) return "0";
    const percentChange = ((current - previous) / previous) * 100;
    return percentChange.toFixed(1);
  };

  const handleDownload = () => {
    if (!shippingData) return;
  
    // Define the columns and data
    const columns = ['Customer Name', 'Order Volume (kg)', 'Shipping Type', 'Order Date', 'Status', 'Delivery Date'];
    const data = shippingData.map(shipping => [
      shipping.customerName,
      `${shipping.orderVolume} kg`,
      shipping.shippingType,
      new Date(shipping.orderDate).toLocaleDateString(),
      shipping.status,
      shipping.deliveryDate ? new Date(shipping.deliveryDate).toLocaleString() : 'N/A'
    ]);
  
    // Combine columns and data
    const csvContent = Papa.unparse([columns, ...data]);
  
    // Create a Blob from the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
  
    // Create a temporary link element for downloading the file
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shipping_transactions.csv';
    a.click();
  
    // Release the URL object
    URL.revokeObjectURL(url);
  };

  
  if (isDashboardLoading || isShippingLoading) {
    return <Loader />;
  }

  return (
    <CContainer fluid className="p-3">
      <CRow className="mb-4">
        <CCol xs={12} md={8}>
          <CustomHeader title="Dashboard" subtitle="Welcome to Dashboard" />
        </CCol>
        <CCol xs={12} md={4} className="d-flex justify-content-md-end align-items-center mb-3 mb-md-0">
        </CCol>
      </CRow>

      <CRow>
        <button className="download-btn" onClick={handleDownload}>
          <FontAwesomeIcon icon={faDownload} />
          &nbsp; Download Reports
        </button>
      </CRow>

      {/* StatBox Row */}
      <CRow className="my-3 g-3">
        <CCol xs={12} md={6} lg={3}>
           <StatBox 
             title="Total Employees"
             value={totalEmployees}
             icon={<FontAwesomeIcon icon={faShippingFast} />}
             color="primary"
             loading={userLoading}
             description="Total registered employees"
           />
        </CCol>
        <CCol xs={12} md={6} lg={3}>
           <StatBox 
             title="Total Shipments"
             value={totalShipments}
             icon={<FontAwesomeIcon icon={faShippingFast} />}
             color="primary"
             loading={loading}
             description="Total shipments tracked"
           />
        </CCol>
       
        <CCol xs={12} md={6} lg={3}>
          {/* Current Sales StatBox from FinanceDash */}
          <StatBox
            title={`Current Sales (${currentMonthData?.month || 'Loading...'})`}
            value={currentMonthData?.totalSales?.toLocaleString() || 0}
            increase={previousMonthData ? 
              `${calculateChange(currentMonthData?.totalSales || 0, previousMonthData?.totalSales || 0) > 0 ? '+' : ''}${calculateChange(currentMonthData?.totalSales || 0, previousMonthData?.totalSales || 0)}%` : 
              "0"}

            icon={<FontAwesomeIcon icon={faChartLine} style={{ fontSize: '20px', color: '#0d6efd' }} />}
            loading={salesLoading}
          />
        </CCol>
        <CCol xs={12} md={6} lg={3}> {/* Adjust sizing as needed for your layout */}
          <StatBox
            title={`Yearly Sales (${currentYear})`}
            value={yearlyData ? yearlyData.totalSales.toLocaleString() : 'Loading...'}
            description="Annual performance"
            icon={<FontAwesomeIcon icon={faCalendarAlt} style={{ fontSize: '20px', color: '#dc3545' }} />}
            loading={isYearlyLoading}
          />
        </CCol>
      </CRow>

      {/* Chart Row */}
      <CRow className="my-3">
        <CCol xs={12}>
          <CCard className="mb-4">
            <div className="p-3">
            <MonthlySalesChart />
            </div>
          </CCard>
        </CCol>
      </CRow>

      {/* Shipment Table Row */}
      <CRow className="my-3">
        <CCol xs={12}>
          <CCard className="mb-4">
            {/* FreightTable could be placed here if needed */}
          </CCard>
        </CCol>
      </CRow>

      {/* Display error message if there was an error fetching data */}
      {error && (
        <CRow className="my-3">
          <CCol xs={12}>
            <div className="alert alert-danger">{error}</div>
          </CCol>
        </CRow>
      )}
      
      {/* Display user error if there was an error fetching user data */}
      {userError && (
        <CRow className="my-3">
          <CCol xs={12}>
            <div className="alert alert-danger">{userError}</div>
          </CCol>
        </CRow>
      )}
    </CContainer>
  );
};

export default Employeedash;