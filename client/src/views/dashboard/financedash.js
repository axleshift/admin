import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatBox from '../pages/scene/statbox';
import CustomHeader from '../../components/header/customhead';
import { CContainer, CRow, CCol, CCard } from '@coreui/react';
import MonthlySalesChart from '../pages/integrate/finance/scene/monthchart';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faMoneyBillWave, faCalendarAlt, faUsers, faFileInvoice } from '@fortawesome/free-solid-svg-icons';
import axiosInstance from '../../utils/axiosInstance';
import logActivity from '../../utils/activityLogger'
import InvoiceList from '../pages/integrate/finance/scene/invoicelist';

const FinanceDash = () => {
  const navigate = useNavigate();
  const [isNonMediumScreens, setIsNonMediumScreens] = useState(window.innerWidth > 768);
  const [currentMonthData, setCurrentMonthData] = useState(null);
  const [previousMonthData, setPreviousMonthData] = useState(null);
  const [yearlyData, setYearlyData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isYearlyLoading, setIsYearlyLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isError, setIsError] = useState(false);
  const [isInvoice, setIsInvoiceLoading] = useState(true);
  const [invoiceData, setInvoiceData] = useState([]);
  const [userData, setUsers] = useState([]);
  const userName = localStorage.getItem('name'); 
  const userRole = localStorage.getItem('role');
  const userDepartment = localStorage.getItem('department');
  const userUsername = localStorage.getItem('username');

  logActivity({
    name: userName,
    role: userRole,
    department: userDepartment,
    route: 'Finance Dashboard',
    action: 'Navigate',
    description: `${userName} Navigate to Finance Dashboard`
  }).catch(console.warn);
  
  useEffect(() => {
    const handleResize = () => setIsNonMediumScreens(window.innerWidth > 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Fetch the monthly data for the StatBoxes
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch monthly sales/revenue data
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
        
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError(err.message || 'An error occurred while fetching data');
        setIsLoading(false);
      }
    };

    // Fetch yearly sales/revenue data
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
        setError(err.message || 'An error occurred while fetching yearly data');
        setIsYearlyLoading(false);
      }
    };

    const fetchFinanceDepartmentUsers = async () => {
      try {
        const response = await axiosInstance.get('/hr/worker');
        
        // Filter for Finance department users only
        const financeUsers = response.data.filter(user => 
          user.department === 'Finance' 
        );
        
        setUsers(financeUsers);
      } catch (err) {
        setError(err.message || 'Failed to fetch Finance department users');
        console.error('Error fetching Finance users:', err);
      }
    };

    const fetchInvoice = async () => {
      try {
        const invoiceResponse = await axiosInstance.get('/finance/invoice');
        
        if (invoiceResponse.data) {
          setInvoiceData(invoiceResponse.data);
        }
        setIsInvoiceLoading(false);
      } catch (err) {
        console.error('Failed to fetch invoice data:', err);
        setError(err.message || 'An error occurred while fetching invoice data');
        setIsInvoiceLoading(false);
      }
    }
    
    fetchInvoice();
    fetchDashboardData();
    fetchYearlyData();
    fetchFinanceDepartmentUsers();
  }, []);

  // Calculate month-over-month changes
  const calculateChange = (current, previous) => {
    if (!previous || previous === 0) return "0";
    const percentChange = ((current - previous) / previous) * 100;
    return percentChange.toFixed(1);
  };

  // Get the current year
  const currentYear = new Date().getFullYear();

  return (
   <CContainer fluid className="p-3">
      <CRow>
        <CCol>
          <CustomHeader title="Finance Dashboard" subtitle="Welcome to the Finance Dashboard" />
        </CCol>
      </CRow>
      
      {/* New layout: StatBoxes on left, Invoice list on right */}
      <CRow className="mb-4">
        {/* Left side - Stat Boxes */}
        <CCol xs={12} md={6}>
          <CRow className="h-100">
            <CCol xs={12} md={6} className="mb-3">
              <StatBox
                title="Finance Department Employees"
                value={userData.length}
                icon={<FontAwesomeIcon icon={faUsers} style={{ fontSize: '20px', color: '#0d6efd' }} />}
                description="Total Finance personnel"
              />
            </CCol>
            <CCol xs={12} md={6} className="mb-3">
              <StatBox
                title={`Current Sales (${currentMonthData?.month || 'Loading...'})`}
                value={currentMonthData?.totalSales?.toLocaleString() || 0}
                increase={previousMonthData ? 
                  `${calculateChange(currentMonthData?.totalSales || 0, previousMonthData?.totalSales || 0) > 0 ? '+' : ''}${calculateChange(currentMonthData?.totalSales || 0, previousMonthData?.totalSales || 0)}%` : 
                  "0"}
                icon={<FontAwesomeIcon icon={faChartLine} style={{ fontSize: '20px', color: '#0d6efd' }} />}
              />
            </CCol>
            <CCol xs={12} md={6} className="mb-3">
              <StatBox
                title={`Current Revenue (${currentMonthData?.month || 'Loading...'})`}
                value={`$${currentMonthData?.totalRevenue?.toLocaleString() || 0}`}
                increase={previousMonthData ? 
                  `${calculateChange(currentMonthData?.totalRevenue || 0, previousMonthData?.totalRevenue || 0) > 0 ? '+' : ''}${calculateChange(currentMonthData?.totalRevenue || 0, previousMonthData?.totalRevenue || 0)}%` : 
                  "0"}
                icon={<FontAwesomeIcon icon={faMoneyBillWave} style={{ fontSize: '20px', color: '#198754' }} />}
              />
            </CCol>
            <CCol xs={12} md={6} className="mb-3">
              <StatBox
                title="Total Invoices"
                value={invoiceData.length}
                description="Total invoices generated"
                icon={<FontAwesomeIcon icon={faFileInvoice} style={{ fontSize: '20px', color: '#dc3545' }} />}
                loading={isInvoice}
              />
            </CCol>
            <CCol xs={12} className="mb-3">
              <StatBox
                title={`Yearly Sales (${currentYear})`}
                value={yearlyData ? yearlyData.totalSales.toLocaleString() : 'Loading...'}
                description="Annual performance"
                icon={<FontAwesomeIcon icon={faCalendarAlt} style={{ fontSize: '20px', color: '#dc3545' }} />}
                loading={isYearlyLoading}
              />
            </CCol>
          </CRow>
        </CCol>
        
        {/* Right side - Invoice List */}
        <CCol xs={12} md={6}>
          <CCard className="h-100">
            <div className="p-3 h-100">
              <InvoiceList/>
            </div>
          </CCard>
        </CCol>
      </CRow>

      {/* Monthly chart row - underneath both */}
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <div className="p-3">
              <MonthlySalesChart />
            </div>
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
    </CContainer>
  );
};

export default FinanceDash;