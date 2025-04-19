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

  // Get user information from session storage
  const userName = sessionStorage.getItem('name');
  const userRole = sessionStorage.getItem('role');
  const userDepartment = sessionStorage.getItem('department');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSystemStatus(null);
      setErrorMessage('');
      
      const response = await axiosInstance.get('/finance/monthlysalesrevenue');
      setData(response.data);
      
      // Log successful data fetch
      logActivity({
        name: userName,
        role: userRole,
        department: userDepartment,
        route: '/monthly',
        action: 'Data Fetch',
        description: 'Successfully retrieved monthly sales and revenue data'
      });
      
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
      
      // Log the system unavailability or error
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
    logActivity({
      name: userName,
      role: userRole,
      department: userDepartment,
      route: '/monthly',
      action: 'View Monthly Sales',
      description: 'User accessed the monthly sales and revenue report'
    });
  }, []);

  // Handle refresh button click with activity logging
  const handleRefresh = async () => {
    // Log the refresh action
    logActivity({
      name: userName,
      role: userRole,
      department: userDepartment,
      route: '/monthly',
      action: 'Refresh Data',
      description: 'User manually refreshed the monthly sales data'
    });
    
    // Fetch fresh data
    await fetchData();
  };

  // Format data for the chart
  const formattedData = React.useMemo(() => {
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

  // Calculate totals for summary
  const totals = React.useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return { sales: 0, revenue: 0 };
    
    return data.reduce((acc, entry) => {
      return {
        sales: acc.sales + entry.totalSales,
        revenue: acc.revenue + entry.totalRevenue
      };
    }, { sales: 0, revenue: 0 });
  }, [data]);

  // Get highest values for highlight
  const highlights = React.useMemo(() => {
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

  // Log when user views details by card selection
  const logCardView = (cardType) => {
    logActivity({
      name: userName,
      role: userRole,
      department: userDepartment,
      route: '/monthly',
      action: 'View Detail',
      description: `User viewed ${cardType} details in monthly report`
    });
  };

  // Render system unavailability message
  const renderSystemUnavailable = () => {
    return (
      <CCardBody>
        <CAlert color="warning" className="d-flex align-items-center">
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" size="lg" />
          <div className="flex-grow-1">
            <h4>External Finance System Unavailable</h4>
            <p>{errorMessage || 'The financial reporting system is currently unavailable. Please try again later.'}</p>
          </div>
          <CButton color="warning" variant="outline" onClick={handleRefresh}>
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
                <CButton color="danger" variant="outline" onClick={handleRefresh}>
                  <FontAwesomeIcon icon={faSync} className="me-2" />
                  Retry
                </CButton>
              </CAlert>
            </CCardBody>
          ) : (
            <>
              <CCardBody>
                {/* Summary Cards */}
                <CRow className="mb-4">
                  {/* Total Sales Card */}
                  <CCol md={6} xl={3} className="mb-3 mb-xl-0">
                    <CCard className="border-0 shadow-sm h-100" onClick={() => logCardView('Total Sales')}>
                      <CCardBody className="d-flex align-items-center">
                        <div className="bg-light p-3 rounded me-3">
                          <FontAwesomeIcon icon={faChartLine} size="lg" className="text-primary" />
                        </div>
                        <div>
                          <div className="text-muted small">Total Sales</div>
                          <div className="fs-5 fw-bold">{totals.sales.toLocaleString()}</div>
                        </div>
                      </CCardBody>
                    </CCard>
                  </CCol>
                  
                  {/* Total Revenue Card */}
                  <CCol md={6} xl={3} className="mb-3 mb-xl-0">
                    <CCard className="border-0 shadow-sm h-100" onClick={() => logCardView('Total Revenue')}>
                      <CCardBody className="d-flex align-items-center">
                        <div className="bg-light p-3 rounded me-3">
                          <FontAwesomeIcon icon={faMoneyBillWave} size="lg" className="text-success" />
                        </div>
                        <div>
                          <div className="text-muted small">Total Revenue</div>
                          <div className="fs-5 fw-bold">${totals.revenue.toLocaleString()}</div>
                        </div>
                      </CCardBody>
                    </CCard>
                  </CCol>
                  
                  {/* Highest Sales Card */}
                  <CCol md={6} xl={3} className="mb-3 mb-xl-0">
                    <CCard className="border-0 shadow-sm h-100" onClick={() => logCardView('Highest Sales')}>
                      <CCardBody className="d-flex align-items-center">
                        <div className="bg-light p-3 rounded me-3">
                          <FontAwesomeIcon icon={faChartLine} size="lg" className="text-info" />
                        </div>
                        <div>
                          <div className="text-muted small">Highest Sales</div>
                          <div className="fs-5 fw-bold">{highlights.highestSales.value.toLocaleString()}</div>
                          <div className="text-muted small">{highlights.highestSales.month}</div>
                        </div>
                      </CCardBody>
                    </CCard>
                  </CCol>
                  
                  {/* Highest Revenue Card */}
                  <CCol md={6} xl={3} className="mb-3 mb-xl-0">
                    <CCard className="border-0 shadow-sm h-100" onClick={() => logCardView('Highest Revenue')}>
                      <CCardBody className="d-flex align-items-center">
                        <div className="bg-light p-3 rounded me-3">
                          <FontAwesomeIcon icon={faMoneyBillWave} size="lg" className="text-warning" />
                        </div>
                        <div>
                          <div className="text-muted small">Highest Revenue</div>
                          <div className="fs-5 fw-bold">${highlights.highestRevenue.value.toLocaleString()}</div>
                          <div className="text-muted small">{highlights.highestRevenue.month}</div>
                        </div>
                      </CCardBody>
                    </CCard>
                  </CCol>
                </CRow>
                
                {/* Chart */}
                <CCard className="border-0 shadow-sm">
                  <CCardBody>
                    <h4 className="mb-3">Monthly Sales & Revenue Trend</h4>
                    <div style={{ height: '300px' }}>
                      <CChartLine
                        data={{
                          labels: formattedData.labels,
                          datasets: [
                            {
                              label: 'Sales',
                              backgroundColor: 'rgba(0, 123, 255, 0.1)',
                              borderColor: 'rgba(0, 123, 255, 1)',
                              pointBackgroundColor: 'rgba(0, 123, 255, 1)',
                              pointBorderColor: '#fff',
                              tension: 0.4,
                              fill: true,
                              data: formattedData.salesData
                            },
                            {
                              label: 'Revenue',
                              backgroundColor: 'rgba(40, 167, 69, 0.1)',
                              borderColor: 'rgba(40, 167, 69, 1)',
                              pointBackgroundColor: 'rgba(40, 167, 69, 1)',
                              pointBorderColor: '#fff',
                              tension: 0.4,
                              fill: true,
                              data: formattedData.revenueData
                            }
                          ],
                        }}
                        options={{
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              display: true,
                            },
                            tooltip: {
                              callbacks: {
                                label: function(context) {
                                  let label = context.dataset.label || '';
                                  if (label) {
                                    label += ': ';
                                  }
                                  if (context.parsed.y !== null) {
                                    label += context.dataset.label === 'Revenue' 
                                      ? `$${context.parsed.y.toLocaleString()}` 
                                      : context.parsed.y.toLocaleString();
                                  }
                                  return label;
                                }
                              }
                            }
                          },
                          scales: {
                            x: {
                              grid: {
                                drawOnChartArea: false,
                              },
                            },
                            y: {
                              beginAtZero: true,
                              ticks: {
                                callback: function(value) {
                                  return value.toLocaleString();
                                }
                              }
                            },
                          },
                          // Log chart interactions
                          onClick: () => {
                            logActivity({
                              name: userName,
                              role: userRole,
                              department: userDepartment,
                              route: '/monthly',
                              action: 'Chart Interaction',
                              description: 'User interacted with the monthly sales chart'
                            });
                          }
                        }}
                      />
                    </div>
                  </CCardBody>
                </CCard>
              </CCardBody>
              <CCardFooter className="bg-light d-flex justify-content-between align-items-center">
                <div className="small text-muted">
                  Data last updated: {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                <CButton color="primary" size="sm" onClick={handleRefresh}>
                  <FontAwesomeIcon icon={faSync} className="me-1" />
                  Refresh Data
                </CButton>
              </CCardFooter>
            </>
          )}
        </CCard>
      </CCol>
    </CRow>
  );
};

export default Monthly;