import React, { useEffect, useState } from "react";
import axiosInstance from "../../../../../utils/axiosInstance";
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CSpinner,
  CAlert,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CTableFoot,
  CProgress,
  CBadge,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CButton,
  CCallout
} from "@coreui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faMoneyBillWave, 
  faChartBar, 
  faTable, 
  faExclamationTriangle,
  faCalendarAlt,
  faArrowUp,
  faArrowDown,
  faEquals,
  faDownload,
  faFilter,
  faInfoCircle,
  faChartLine,
  faSync,
  faShippingFast
} from "@fortawesome/free-solid-svg-icons";

const InsightShipment = () => {
  const [shipmentData, setShipmentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState("6months");
  // Add a state to detect if dark mode is active
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect dark mode on component mount and when theme changes
  useEffect(() => {
    const checkDarkMode = () => {
      const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const isDark = darkModeMediaQuery.matches || 
                    document.body.classList.contains('dark-mode') || 
                    document.body.classList.contains('dark-theme') ||
                    document.documentElement.getAttribute('data-coreui-theme') === 'dark';
      setIsDarkMode(isDark);
    };

    // Initial check
    checkDarkMode();

    // Listen for system theme changes
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeMediaQuery.addEventListener('change', checkDarkMode);

    // Listen for DOM changes that might indicate theme toggle
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    return () => {
      darkModeMediaQuery.removeEventListener('change', checkDarkMode);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchShipmentData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/core/insight/shipment?timeframe=${timeframe}`);
        console.log("API Response:", response.data); // Debug log
        setShipmentData(response.data);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.response?.data?.error || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchShipmentData();
  }, [timeframe]);

  // Format data for the chart with more flexible handling
  const formatChartData = () => {
    if (!shipmentData) return null;
    
    // Handle the actual structure returned by the API
    if (shipmentData.labels && shipmentData.data) {
      return {
        labels: shipmentData.labels,
        data: shipmentData.data
      };
    }
    
    // Keep the existing fallback approaches
    let months = [];
    let shipments = [];
    
    // Case 1: Direct structure with months and shipments arrays
    if (Array.isArray(shipmentData.months) && Array.isArray(shipmentData.shipments)) {
      months = shipmentData.months;
      shipments = shipmentData.shipments;
    }
    // Case 2: Array of objects with month and shipment properties
    else if (Array.isArray(shipmentData)) {
      shipmentData.forEach(item => {
        if (item.month) months.push(item.month);
        if (item.shipment !== undefined) shipments.push(item.shipment);
      });
    }
    // Case 3: Data is in a nested property
    else if (shipmentData.data) {
      if (Array.isArray(shipmentData.data.months) && Array.isArray(shipmentData.data.shipments)) {
        months = shipmentData.data.months;
        shipments = shipmentData.data.shipments;
      } else if (Array.isArray(shipmentData.data)) {
        shipmentData.data.forEach(item => {
          if (item.month) months.push(item.month);
          if (item.shipment !== undefined) shipments.push(item.shipment);
        });
      }
    }
    
    return {
      labels: months,
      data: shipments
    };
  };

  const chartData = formatChartData();
  const totalShipments = chartData && chartData.data.length > 0 
    ? chartData.data.reduce((sum, value) => sum + Number(value), 0) 
    : 0;
  const maxValue = chartData && chartData.data.length > 0 
    ? Math.max(...chartData.data.map(v => Number(v)), 1) 
    : 1;

  // Calculate month-over-month changes
  const calculateChange = (index) => {
    if (!chartData || index === 0 || !chartData.data[index] || !chartData.data[index-1]) return null;
    const currentValue = Number(chartData.data[index]);
    const previousValue = Number(chartData.data[index - 1]);
    if (previousValue === 0) return null;
    
    return ((currentValue - previousValue) / previousValue) * 100;
  };

  // Get color based on change direction
  const getChangeColor = (change) => {
    if (change === null) return "secondary";
    if (change > 0) return "success";
    if (change < 0) return "danger";
    return "info";
  };

  // Get icon based on change direction
  const getChangeIcon = (change) => {
    if (change === null) return faEquals;
    if (change > 0) return faArrowUp;
    if (change < 0) return faArrowDown;
    return faEquals;
  };

  // Calculate average shipments
  const calculateAverageShipments = () => {
    if (!chartData || chartData.data.length === 0) return 0;
    return totalShipments / chartData.data.length;
  };

  // Function to refresh data
  const refreshData = () => {
    const fetchShipmentData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/core/insight/shipment?timeframe=${timeframe}`);
        setShipmentData(response.data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchShipmentData();
  };

  // Dark mode adaptive styles
  const cardStyle = isDarkMode ? 
    "mb-4 shadow-sm border-0 text-light" : 
    "mb-4 shadow-sm border-0";
  
  const headerStyle = isDarkMode ? 
    "d-flex justify-content-between align-items-center py-3 border-bottom text-light" : 
    "bg-white d-flex justify-content-between align-items-center py-3 border-bottom";
  
  const containerStyle = isDarkMode ? 
    "min-vh-100 d-flex flex-column" : 
    "bg-light min-vh-100 d-flex flex-column";
  
  const tableHeaderStyle = isDarkMode ? 
    "border-bottom" : 
    "bg-light";
  
  const iconTextClass = isDarkMode ? "text-light" : "text-body-emphasis";
  
  const chartBackgroundClass = isDarkMode ? "" : "bg-white";
  
  const badgeTextClass = isDarkMode ? "text-dark" : "";

  return (
    <div className={containerStyle}>
      <div className="py-4">
        <CRow>
          <CCol md={12}>
            <CCard className={cardStyle}>
              <CCardHeader className={headerStyle}>
                <div>
                  <h3 className="mb-0">
                    <FontAwesomeIcon icon={faMoneyBillWave} className="me-2 text-success" /> 
                    Shipment Insights
                  </h3>
                  <small className={isDarkMode ? "text-light-emphasis" : "text-body-secondary"}>Track and analyze your monthly shipment distribution</small>
                </div>
                <div className="d-flex gap-2">
                
                  <CButton 
                    color={isDarkMode ? "dark" : "light"} 
                    onClick={refreshData}
                    disabled={loading}
                  >
                    <FontAwesomeIcon icon={faSync} className={loading ? "fa-spin me-2" : "me-2"} />
                    Refresh
                  </CButton>
                 
                </div>
              </CCardHeader>
              <CCardBody className="p-4">
                {loading && (
                  <div className="d-flex justify-content-center align-items-center" style={{ height: "300px" }}>
                    <div className="text-center">
                      <CSpinner color="primary" style={{ width: "3rem", height: "3rem" }} />
                      <p className={`mt-3 ${isDarkMode ? "text-light-emphasis" : "text-medium-emphasis"}`}>Loading shipment data...</p>
                    </div>
                  </div>
                )}

                {error && (
                  <CAlert color="danger" className="d-flex align-items-center">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="me-3 fs-4" />
                    <div>
                      <h4 className="alert-heading">Data Fetch Error</h4>
                      <p className="mb-0">{error}</p>
                      <CButton color="danger" variant="ghost" size="sm" className="mt-2" onClick={refreshData}>
                        <FontAwesomeIcon icon={faSync} className="me-1" /> Try Again
                      </CButton>
                    </div>
                  </CAlert>
                )}

                {!loading && !error && (!chartData || chartData.data.length === 0) && (
                  <CAlert color="warning" className="d-flex align-items-center">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="me-3 fs-4" />
                    <div>
                      <h4 className="alert-heading">No Data Available</h4>
                      <p className="mb-0">No shipment data available for the selected time period.</p>
                      <CButton color="warning" variant="ghost" size="sm" className="mt-2" onClick={() => setTimeframe("12months")}>
                        <FontAwesomeIcon icon={faFilter} className="me-1" /> Try Different Time Period
                      </CButton>
                    </div>
                  </CAlert>
                )}

                {chartData && chartData.data.length > 0 && !loading && !error && (
                  <>
                    <CRow className="mb-4">
                      <CCol lg={4} md={6} className="mb-4">
                        <CCallout color="primary" className="h-100">
                          <div className="d-flex align-items-center">
                            <div className="p-3 bg-primary bg-opacity-25 rounded-circle me-3">
                              <FontAwesomeIcon icon={faShippingFast} size="2x" className="text-primary" />
                            </div>
                            <div>
                              <div className={isDarkMode ? "text-light-emphasis small" : "text-medium-emphasis small"}>Total Shipments</div>
                              <div className="fs-3 fw-bold">{totalShipments.toFixed(0)}</div>
                            </div>
                          </div>
                        </CCallout>
                      </CCol>
                      
                      <CCol lg={4} md={6} className="mb-4">
                        <CCallout color="info" className="h-100">
                          <div className="d-flex align-items-center">
                            <div className="p-3 bg-info bg-opacity-25 rounded-circle me-3">
                              <FontAwesomeIcon icon={faChartLine} size="2x" className="text-info" />
                            </div>
                            <div>
                              <div className={isDarkMode ? "text-light-emphasis small" : "text-medium-emphasis small"}>Average Monthly Shipments</div>
                              <div className="fs-3 fw-bold">
                                {calculateAverageShipments().toFixed(1)}
                              </div>
                            </div>
                          </div>
                        </CCallout>
                      </CCol>
                      
                      <CCol lg={4} md={12} className="mb-4">
                        {chartData.data.length >= 2 && (
                          <CCallout 
                            color={getChangeColor(calculateChange(chartData.data.length - 1))} 
                            className="h-100"
                          >
                            <div className="d-flex align-items-center">
                              <div className={`p-3 bg-${getChangeColor(calculateChange(chartData.data.length - 1))} bg-opacity-25 rounded-circle me-3`}>
                                <FontAwesomeIcon 
                                  icon={getChangeIcon(calculateChange(chartData.data.length - 1))} 
                                  size="2x" 
                                  className={`text-${getChangeColor(calculateChange(chartData.data.length - 1))}`} 
                                />
                              </div>
                              <div>
                                <div className={isDarkMode ? "text-light-emphasis small" : "text-medium-emphasis small"}>Month-over-Month Change</div>
                                <div className="fs-3 fw-bold">
                                  {calculateChange(chartData.data.length - 1) !== null 
                                    ? `${calculateChange(chartData.data.length - 1) > 0 ? '+' : ''}${calculateChange(chartData.data.length - 1).toFixed(1)}%` 
                                    : ""}
                                </div>
                              </div>
                            </div>
                          </CCallout>
                        )}
                      </CCol>
                    </CRow>

                    <CRow className="mb-4">
                      <CCol md={12}>
                        <CCard className="border-0 shadow-sm">
                          <CCardHeader className={`${chartBackgroundClass} border-bottom d-flex justify-content-between align-items-center py-3 ${isDarkMode ? "text-light" : ""}`}>
                            <h4 className="mb-0">
                              <FontAwesomeIcon icon={faChartBar} className="me-2 text-primary" />
                              Monthly Shipment Distribution
                            </h4>
                            <CButton color={isDarkMode ? "dark" : "light"} size="sm">
                              <FontAwesomeIcon icon={faInfoCircle} className="me-1" /> Shipment Analysis
                            </CButton>
                          </CCardHeader>
                          <CCardBody className="p-4">
                            <div className="px-3">
                              <CRow className="align-items-end g-0" style={{ height: "250px" }}>
                                {chartData.data.map((value, index) => (
                                  <CCol key={index} className="px-1 text-center">
                                    <div className="d-flex flex-column align-items-center">
                                      <small className="mb-2 fw-bold">{Number(value).toFixed(0)}</small>
                                      <div style={{ width: "100%", height: `${(Number(value) / maxValue) * 80}%`, minHeight: Number(value) > 0 ? "20px" : "4px" }}>
                                        <CProgress 
                                          value={100} 
                                          color={index === chartData.data.length - 1 ? "primary" : "success"} 
                                          className="h-100 shadow-sm" 
                                          style={{ minWidth: "30px", borderRadius: "4px" }}
                                        />
                                      </div>
                                      <small className={`mt-2 ${isDarkMode ? "text-light-emphasis" : "text-medium-emphasis"}`}>
                                        <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                                        {chartData.labels[index] || `Month ${index + 1}`}
                                      </small>
                                      
                                      {/* Display change percentage */}
                                      {index > 0 && (
                                        <CBadge 
                                          color={getChangeColor(calculateChange(index))}
                                          shape="rounded-pill" 
                                          className={`mt-1 ${badgeTextClass}`}
                                        >
                                          <FontAwesomeIcon 
                                            icon={getChangeIcon(calculateChange(index))} 
                                            className="me-1" 
                                            size="xs" 
                                          />
                                          {calculateChange(index) !== null ? `${calculateChange(index).toFixed(1)}%` : ""}
                                        </CBadge>
                                      )}
                                    </div>
                                  </CCol>
                                ))}
                              </CRow>
                            </div>
                          </CCardBody>
                        </CCard>
                      </CCol>
                    </CRow>

                    <CRow>
                      <CCol md={12}>
                        <CCard className="border-0 shadow-sm">
                          <CCardHeader className={`${chartBackgroundClass} border-bottom d-flex justify-content-between align-items-center py-3 ${isDarkMode ? "text-light" : ""}`}>
                            <h4 className="mb-0">
                              <FontAwesomeIcon icon={faTable} className="me-2 text-primary" />
                              Shipment Details
                            </h4>
                            
                          </CCardHeader>
                          <CCardBody className="p-0">
                            <CTable hover responsive className="mb-0 border-0">
                              <CTableHead className={tableHeaderStyle}>
                                <CTableRow>
                                  <CTableHeaderCell>Month</CTableHeaderCell>
                                  <CTableHeaderCell className="text-end">Shipments</CTableHeaderCell>
                                  <CTableHeaderCell className="text-end">% of Total</CTableHeaderCell>
                                  <CTableHeaderCell className="text-end">Change</CTableHeaderCell>
                                </CTableRow>
                              </CTableHead>
                              <CTableBody>
                                {chartData.data.map((value, index) => (
                                  <CTableRow key={index}>
                                    <CTableDataCell>
                                      <div className="d-flex align-items-center">
                                        <div className={`p-2 me-2 ${isDarkMode ? "bg-dark" : "bg-light"} rounded`}>
                                          <FontAwesomeIcon icon={faCalendarAlt} className="text-primary" />
                                        </div>
                                        <span className="fw-medium">{chartData.labels[index] || `Month ${index + 1}`}</span>
                                      </div>
                                    </CTableDataCell>
                                    <CTableDataCell className="text-end fw-bold">{Number(value).toFixed(0)}</CTableDataCell>
                                    <CTableDataCell className="text-end">
                                      <div className="d-flex align-items-center justify-content-end">
                                        <span className="me-2">
                                          {totalShipments > 0 ? `${((Number(value) / totalShipments) * 100).toFixed(1)}%` : '0%'}
                                        </span>
                                        <CProgress 
                                          value={totalShipments > 0 ? ((Number(value) / totalShipments) * 100) : 0} 
                                          color="success" 
                                          className="flex-grow-1" 
                                          style={{ maxWidth: "100px", height: "8px" }}
                                        />
                                      </div>
                                    </CTableDataCell>
                                    <CTableDataCell className="text-end">
                                      {index > 0 ? (
                                        <CBadge 
                                          color={getChangeColor(calculateChange(index))}
                                          shape="rounded-pill"
                                          className={badgeTextClass}
                                        >
                                          <FontAwesomeIcon 
                                            icon={getChangeIcon(calculateChange(index))} 
                                            className="me-1" 
                                          />
                                          {calculateChange(index) !== null ? `${calculateChange(index).toFixed(1)}%` : ""}
                                        </CBadge>
                                      ) : (
                                        <CBadge color="secondary" shape="rounded-pill" className={badgeTextClass}>
                                          <FontAwesomeIcon icon={faEquals} className="me-1" /> Base
                                        </CBadge>
                                      )}
                                    </CTableDataCell>
                                  </CTableRow>
                                ))}
                              </CTableBody>
                              <CTableFoot className={tableHeaderStyle}>
                                <CTableRow>
                                  <CTableDataCell className="fw-bold">Total</CTableDataCell>
                                  <CTableDataCell className="fw-bold text-end">{totalShipments.toFixed(0)}</CTableDataCell>
                                  <CTableDataCell className="fw-bold text-end">100%</CTableDataCell>
                                  <CTableDataCell className="text-end">
                                    {chartData.data.length >= 2 && (
                                      <CBadge 
                                        color={
                                          Number(chartData.data[chartData.data.length - 1]) > Number(chartData.data[0]) ? "success" :
                                          Number(chartData.data[chartData.data.length - 1]) < Number(chartData.data[0]) ? "danger" : "info"
                                        }
                                        shape="rounded-pill"
                                        className={badgeTextClass}
                                      >
                                        <FontAwesomeIcon 
                                          icon={
                                            Number(chartData.data[chartData.data.length - 1]) > Number(chartData.data[0]) ? faArrowUp :
                                            Number(chartData.data[chartData.data.length - 1]) < Number(chartData.data[0]) ? faArrowDown : faEquals
                                          } 
                                          className="me-1" 
                                        />
                                        {Number(chartData.data[0]) !== 0 ? 
                                          `${(((Number(chartData.data[chartData.data.length - 1]) - Number(chartData.data[0])) / Number(chartData.data[0])) * 100).toFixed(1)}%` : 
                                          ""
                                        }
                                      </CBadge>
                                    )}
                                  </CTableDataCell>
                                </CTableRow>
                              </CTableFoot>
                            </CTable>
                          </CCardBody>
                        </CCard>
                      </CCol>
                    </CRow>
                  </>
                )}
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </div>
    </div>
  );
};

export default InsightShipment;