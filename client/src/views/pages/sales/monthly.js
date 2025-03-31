import React, { useState, useEffect } from 'react';
import { 
  CRow, 
  CCol, 
  CCard, 
  CCardHeader, 
  CCardBody, 
  CSpinner,
  CAlert,
  CCardFooter
} from '@coreui/react';
import { CChartLine } from '@coreui/react-chartjs';
import CustomHeader from '../../../components/header/customhead';
import logActivity from './../../../utils/activityLogger';
import axiosInstance from '../../../utils/axiosInstance';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faMoneyBillWave, faExclamationTriangle, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

const Monthly = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get('/finance/monthlysalesrevenue');
        setData(response.data);
        setIsLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to fetch monthly sales revenue data');
        setIsLoading(false);
      }
    };

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

  // Log errors if they occur
  useEffect(() => {
    if (error) {
      const userName = sessionStorage.getItem('name');
      const userRole = sessionStorage.getItem('role');
      const userDepartment = sessionStorage.getItem('department');
      
      logActivity({
        name: userName,
        role: userRole,
        department: userDepartment,
        route: '/monthly',
        action: 'Error',
        description: `Error occurred while loading monthly sales data: ${error}`
      });
    }
  }, [error]);

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
          ) : error ? (
            <CCardBody>
              <CAlert color="danger" className="d-flex align-items-center">
                <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" size="lg" />
                <div>Error loading monthly data: {error}</div>
              </CAlert>
            </CCardBody>
          ) : (
            <>
              <CCardBody>
                <CRow className="mb-4">
                  <CCol md={3} sm={6}>
                    <CCard className="mb-3 border-success shadow-sm h-100">
                      <CCardHeader className="bg-success text-white d-flex align-items-center">
                        <FontAwesomeIcon icon={faChartLine} className="me-2" />
                        <span>Total Sales</span>
                      </CCardHeader>
                      <CCardBody className="text-center">
                        <h3 className="mb-0">${totals.sales.toLocaleString()}</h3>
                      </CCardBody>
                    </CCard>
                  </CCol>
                  
                  <CCol md={3} sm={6}>
                    <CCard className="mb-3 border-warning shadow-sm h-100">
                      <CCardHeader className="bg-warning text-white d-flex align-items-center">
                        <FontAwesomeIcon icon={faMoneyBillWave} className="me-2" />
                        <span>Total Revenue</span>
                      </CCardHeader>
                      <CCardBody className="text-center">
                        <h3 className="mb-0">${totals.revenue.toLocaleString()}</h3>
                      </CCardBody>
                    </CCard>
                  </CCol>
                  
                  <CCol md={3} sm={6}>
                    <CCard className="mb-3 border-info shadow-sm h-100">
                      <CCardHeader className="bg-info text-white d-flex align-items-center">
                        <FontAwesomeIcon icon={faChartLine} className="me-2" />
                        <span>Best Sales Month</span>
                      </CCardHeader>
                      <CCardBody className="text-center">
                        <h5 className="mb-1">{highlights.highestSales.month}</h5>
                        <p className="mb-0 text-success">${highlights.highestSales.value.toLocaleString()}</p>
                      </CCardBody>
                    </CCard>
                  </CCol>
                  
                  <CCol md={3} sm={6}>
                    <CCard className="mb-3 border-primary shadow-sm h-100">
                      <CCardHeader className="bg-primary text-white d-flex align-items-center">
                        <FontAwesomeIcon icon={faMoneyBillWave} className="me-2" />
                        <span>Best Revenue Month</span>
                      </CCardHeader>
                      <CCardBody className="text-center">
                        <h5 className="mb-1">{highlights.highestRevenue.month}</h5>
                        <p className="mb-0 text-warning">${highlights.highestRevenue.value.toLocaleString()}</p>
                      </CCardBody>
                    </CCard>
                  </CCol>
                </CRow>
                
                <CCard className="border-0 shadow-sm">
                  <CCardBody>
                    <div className="chart-wrapper" style={{ height: '400px' }}>
                      <CChartLine
                        style={{ height: '400px' }}
                        data={{
                          labels: formattedData.labels,
                          datasets: [
                            {
                              label: 'Monthly Sales',
                              backgroundColor: 'rgba(76, 175, 80, 0.1)',
                              borderColor: '#4CAF50',
                              pointBackgroundColor: '#4CAF50',
                              pointBorderColor: '#fff',
                              tension: 0.4,
                              borderWidth: 3,
                              pointRadius: 4,
                              pointHoverRadius: 6,
                              data: formattedData.salesData,
                              fill: true,
                            },
                            {
                              label: 'Monthly Revenue',
                              backgroundColor: 'rgba(255, 152, 0, 0.1)',
                              borderColor: '#FF9800',
                              pointBackgroundColor: '#FF9800',
                              pointBorderColor: '#fff',
                              tension: 0.4,
                              borderWidth: 3,
                              pointRadius: 4,
                              pointHoverRadius: 6,
                              data: formattedData.revenueData,
                              fill: true,
                            },
                          ],
                        }}
                        options={{
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              display: true,
                              position: 'bottom',
                              labels: {
                                boxWidth: 12,
                                font: {
                                  size: 12,
                                },
                              },
                            },
                            tooltip: {
                              callbacks: {
                                label: function(context) {
                                  let label = context.dataset.label || '';
                                  if (label) {
                                    label += ': ';
                                  }
                                  if (context.parsed.y !== null) {
                                    label += new Intl.NumberFormat('en-US', {
                                      style: 'currency',
                                      currency: 'USD'
                                    }).format(context.parsed.y);
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
                              ticks: {
                                font: {
                                  size: 12,
                                }
                              }
                            },
                            y: {
                              grid: {
                                color: '#f0f0f0',
                              },
                              ticks: {
                                font: {
                                  size: 12,
                                },
                                callback: function(value) {
                                  return '$' + value.toLocaleString();
                                }
                              }
                            },
                          },
                        }}
                      />
                    </div>
                  </CCardBody>
                </CCard>
              </CCardBody>
           
            </>
          )}
        </CCard>
      </CCol>
    </CRow>
  );
};

export default Monthly;