import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatBox from '../pages/scene/statbox';
import CustomHeader from '../../components/header/customhead';
import { CContainer, CRow, CCol, CCard } from '@coreui/react';
import Monthly from '../pages/sales/monthly';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faMoneyBillWave } from '@fortawesome/free-solid-svg-icons';
import axiosInstance from '../../utils/axiosInstance';

const FinanceDash = () => {
  const navigate = useNavigate();
  const [isNonMediumScreens, setIsNonMediumScreens] = useState(window.innerWidth > 768);
  const [currentMonthData, setCurrentMonthData] = useState(null);
  const [previousMonthData, setPreviousMonthData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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

    fetchDashboardData();
  }, []);

  // Calculate month-over-month changes
  const calculateChange = (current, previous) => {
    if (!previous || previous === 0) return "0";
    const percentChange = ((current - previous) / previous) * 100;
    return percentChange.toFixed(1);
  };

  return (
   <CContainer fluid className="p-3">
      <CRow>
        <CCol>
          <CustomHeader title="Finance Dashboard" subtitle="Welcome to the Finance Dashboard" />
        </CCol>
      </CRow>
      
      {/* StatBoxes layout */}
      <CRow>
        <CCol xs={12} md={6} lg={3}>
          <StatBox
            title={`Current Sales (${currentMonthData?.month || 'Loading...'})`}
            value={currentMonthData?.totalSales?.toLocaleString() || 0}
            increase={previousMonthData ? 
              `${calculateChange(currentMonthData?.totalSales || 0, previousMonthData?.totalSales || 0) > 0 ? '+' : ''}${calculateChange(currentMonthData?.totalSales || 0, previousMonthData?.totalSales || 0)}%` : 
              "0"}
            description="vs. last month"
            icon={<FontAwesomeIcon icon={faChartLine} style={{ fontSize: '20px', color: '#0d6efd' }} />}
          />
        </CCol>
        
        <CCol xs={12} md={6} lg={3}>
          <StatBox
            title={`Current Revenue (${currentMonthData?.month || 'Loading...'})`}
            value={`$${currentMonthData?.totalRevenue?.toLocaleString() || 0}`}
            increase={previousMonthData ? 
              `${calculateChange(currentMonthData?.totalRevenue || 0, previousMonthData?.totalRevenue || 0) > 0 ? '+' : ''}${calculateChange(currentMonthData?.totalRevenue || 0, previousMonthData?.totalRevenue || 0)}%` : 
              "0"}
            description="vs. last month"
            icon={<FontAwesomeIcon icon={faMoneyBillWave} style={{ fontSize: '20px', color: '#198754' }} />}
          />
        </CCol>
      </CRow>
      
      {/* Monthly chart row */}
      <CRow className="my-3">
        <CCol xs={12}>
          <CCard className="mb-4">
            <div className="p-3">
              <Monthly 
                view="sales" 
                onDataLoaded={(data) => {
                  if (data && Array.isArray(data) && data.length > 0) {
                    // This callback can be used to update other state if needed
                    // But we already have the current month data from our initial fetch
                  }
                }} 
              />
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