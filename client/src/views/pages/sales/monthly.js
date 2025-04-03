import React, { useState, useEffect } from 'react';
import { 
  CRow, 
  CCol, 
  CCard, 
  CCardHeader, 
  CCardBody, 
  CSpinner,
  CAlert,
  CCardFooter,
  CButton
} from '@coreui/react';
import { CChartLine } from '@coreui/react-chartjs';
import CustomHeader from '../../../components/header/customhead';
import logActivity from './../../../utils/activityLogger';
import axiosInstance from '../../../utils/axiosInstance';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faMoneyBillWave, faExclamationTriangle, faCalendarAlt, faSync } from '@fortawesome/free-solid-svg-icons';

const Monthly = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSystemStatus(null);
      setErrorMessage('');
      
      const response = await axiosInstance.get('/finance/monthlysalesrevenue');
      setData(response.data);
      setIsLoading(false);
    } catch (err) {
      // Check if the response has our custom system status
      if (err.response && err.response.data) {
        const { status, message } = err.response.data;
        if (status === 'unavailable') {
          setSystemStatus('unavailable');
          setErrorMessage(message || 'The financial reporting system is currently unavailable');
        } else {
          setError(err.response.data.error || err.message || 'Failed to fetch monthly sales revenue data');
        }
      } else {
        setError(err.message || 'Failed to fetch monthly sales revenue data');
      }
      setIsLoading(false);
      
      // Log the system unavailability
      const userName = sessionStorage.getItem('name');
      const userRole = sessionStorage.getItem('role');
      const userDepartment = sessionStorage.getItem('department');
      
      logActivity({
        name: userName,
        role: userRole,
        department: userDepartment,
        route: '/monthly',
        action: systemStatus === 'unavailable' ? 'System Unavailable' : 'Error',
        description: systemStatus === 'unavailable' 
          ? `External finance system unavailable: ${errorMessage}`
          : `Error occurred while loading monthly sales data: ${err.message}`
      });
    }
  };

  useEffect(() => {
    fetchData();

    // Log activity when component mounts
    const userName = sessionStorage.getItem('name');
    const userRole = sessionStorage.getItem('role');
    const userDepartment = sessionStorage.getItem('department');
    
    logActivity({
      name: userName,
      role: userRole,
      department: userDepartment,
      route: '/monthly',
      action: 'View Monthly Sales',
      description: 'User accessed the monthly sales and revenue report'
    });
  }, []);

  // Format data for the chart (same as your original code)
  const formattedData = React.useMemo(() => {
    // Your existing formattedData code
    if (!data || !Array.isArray(data) || data.length === 0) return {
      labels: [],
      salesData: [],
      revenueData: []
    };

    const labels = data.map(entry => `${entry.month.substr(0, 3)} ${entry.year}`);
    const salesData = data.map(entry => entry.totalSales);
    const revenueData = data.map(entry => entry.totalRevenue);

    return {
      labels,
      salesData,
      revenueData
    };
  }, [data]);

  // Calculate totals for summary (same as your original code)
  const totals = React.useMemo(() => {
    // Your existing totals code
    if (!data || !Array.isArray(data) || data.length === 0) return { sales: 0, revenue: 0 };
    
    return data.reduce((acc, entry) => {
      return {
        sales: acc.sales + entry.totalSales,
        revenue: acc.revenue + entry.totalRevenue
      };
    }, { sales: 0, revenue: 0 });
  }, [data]);

  // Get highest values for highlight (same as your original code)
  const highlights = React.useMemo(() => {
    // Your existing highlights code
    if (!data || !Array.isArray(data) || data.length === 0) 
      return { highestSales: { value: 0, month: 'N/A' }, highestRevenue: { value: 0, month: 'N/A' } };
    
    let highestSales = { value: 0, month: '' };
    let highestRevenue = { value: 0, month: '' };
    
    data.forEach(entry => {
      if (entry.totalSales > highestSales.value) {
        highestSales = { 
          value: entry.totalSales, 
          month: `${entry.month} ${entry.year}` 
        };
      }
      if (entry.totalRevenue > highestRevenue.value) {
        highestRevenue = { 
          value: entry.totalRevenue, 
          month: `${entry.month} ${entry.year}` 
        };
      }
    });
    
    return { highestSales, highestRevenue };
  }, [data]);

  // New function to render system unavailability message
  const renderSystemUnavailable = () => {
    return (
      <CCardBody>
        <CAlert color="warning" className="d-flex align-items-center">
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" size="lg" />
          <div className="flex-grow-1">
            <h4>External Finance System Unavailable</h4>
            <p>{errorMessage || 'The financial reporting system is currently unavailable. Please try again later.'}</p>
          </div>
          <CButton color="warning" variant="outline" onClick={fetchData}>
            <FontAwesomeIcon icon={faSync} className="me-2" />
            Retry
          </CButton>
        </CAlert>
        
        <div className="text-center my-5 py-5">
          <img 
            src="/assets/images/system-unavailable.svg" 
            alt="System Unavailable" 
            style={{ maxWidth: '250px', opacity: '0.7' }}
          />
          <h3 className="mt-4 text-muted">Financial Data Cannot Be Retrieved</h3>
          <p className="text-muted">
            We&apos;re experiencing technical difficulties connecting to the financial reporting system.
            Our team has been notified and is working on resolving this issue.
          </p>
        </div>
      </CCardBody>
    );
  };

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4 shadow-sm">
          <CCardHeader className="d-flex justify-content-between align-items-center bg-primary text-white">
            <div className="d-flex align-items-center">
              <FontAwesomeIcon icon={faChartLine} className="me-2" size="lg" />
              <CustomHeader title="Monthly Analysis" subtitle="Sales & Revenue Performance" />
            </div>
            <div className="small text-white">
              <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
              {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
            </div>
          </CCardHeader>
          
          {isLoading ? (
            <CCardBody className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
              <div className="text-center">
                <CSpinner color="primary" />
                <p className="mt-3">Loading financial data...</p>
              </div>
            </CCardBody>
          ) : systemStatus === 'unavailable' ? (
            renderSystemUnavailable()
          ) : error ? (
            <CCardBody>
              <CAlert color="danger" className="d-flex align-items-center">
                <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" size="lg" />
                <div className="flex-grow-1">Error loading monthly data: {error}</div>
                <CButton color="danger" variant="outline" onClick={fetchData}>
                  <FontAwesomeIcon icon={faSync} className="me-2" />
                  Retry
                </CButton>
              </CAlert>
            </CCardBody>
          ) : (
            // Rest of your original rendering code for successful data fetch
            <>
              <CCardBody>
                {/* Your cards and chart components remain unchanged */}
                {/* ... */}
              </CCardBody>
            </>
          )}
        </CCard>
      </CCol>
    </CRow>
  );
};

export default Monthly;