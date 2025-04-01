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
  faWeightHanging, 
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
  faBalanceScale,
  faSync,
  faChartLine
} from "@fortawesome/free-solid-svg-icons";

const InsightWeight = () => {
  const [weightData, setWeightData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState("6months");

  useEffect(() => {
    const fetchWeightData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/core/insight/weight?timeframe=${timeframe}`);
        console.log("API Response:", response.data); // Debug log
        setWeightData(response.data);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.response?.data?.error || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchWeightData();
  }, [timeframe]);

  // Format data for the chart with more flexible handling
  const formatChartData = () => {
    if (!weightData) return null;
    
    // Handle the actual structure returned by the API
    if (weightData.labels && weightData.data) {
      return {
        labels: weightData.labels,
        data: weightData.data
      };
    }
    
    // Keep the existing fallback approaches
    let months = [];
    let weights = [];
    
    // Case 1: Direct structure with months and weights arrays
    if (Array.isArray(weightData.months) && Array.isArray(weightData.weights)) {
      months = weightData.months;
      weights = weightData.weights;
    }
    // Case 2: Array of objects with month and weight properties
    else if (Array.isArray(weightData)) {
      weightData.forEach(item => {
        if (item.month) months.push(item.month);
        if (item.weight !== undefined) weights.push(item.weight);
      });
    }
    // Case 3: Data is in a nested property
    else if (weightData.data) {
      if (Array.isArray(weightData.data.months) && Array.isArray(weightData.data.weights)) {
        months = weightData.data.months;
        weights = weightData.data.weights;
      } else if (Array.isArray(weightData.data)) {
        weightData.data.forEach(item => {
          if (item.month) months.push(item.month);
          if (item.weight !== undefined) weights.push(item.weight);
        });
      }
    }
    
    return {
      labels: months,
      data: weights
    };
  };

  const chartData = formatChartData();
  const totalWeight = chartData && chartData.data.length > 0 
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

  // Calculate average weight
  const calculateAverageWeight = () => {
    if (!chartData || chartData.data.length === 0) return 0;
    return totalWeight / chartData.data.length;
  };

  // Function to refresh data
  const refreshData = () => {
    const fetchWeightData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/core/insight/weight?timeframe=${timeframe}`);
        setWeightData(response.data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchWeightData();
  };

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      <div className="py-4">
        <CRow>
          <CCol md={12}>
            <CCard className="mb-4 shadow-sm border-0">
              <CCardHeader className="bg-white d-flex justify-content-between align-items-center py-3 border-bottom">
                <div>
                  <h3 className="mb-0 text-primary">
                    <FontAwesomeIcon icon={faWeightHanging} className="me-2" /> 
                    Shipment Weight Insights
                  </h3>
                  <small className="text-medium-emphasis">Track and analyze your monthly weight distribution</small>
                </div>
                <div className="d-flex gap-2">
                  <CDropdown>
                    <CDropdownToggle color="light" className="d-flex align-items-center">
                      <FontAwesomeIcon icon={faFilter} className="me-2" />
                      {timeframe === "6months" && "Last 6 Months"}
                      {timeframe === "12months" && "Last 12 Months"}
                      {timeframe === "ytd" && "Year to Date"}
                    </CDropdownToggle>
                    <CDropdownMenu>
                      <CDropdownItem onClick={() => setTimeframe("6months")}>Last 6 Months</CDropdownItem>
                      <CDropdownItem onClick={() => setTimeframe("12months")}>Last 12 Months</CDropdownItem>
                      <CDropdownItem onClick={() => setTimeframe("ytd")}>Year to Date</CDropdownItem>
                    </CDropdownMenu>
                  </CDropdown>
                  <CButton 
                    color="light" 
                    onClick={refreshData}
                    disabled={loading}
                  >
                    <FontAwesomeIcon icon={faSync} className={loading ? "fa-spin me-2" : "me-2"} />
                    Refresh
                  </CButton>
                  <CButton color="light">
                    <FontAwesomeIcon icon={faDownload} className="me-2" />
                    Export
                  </CButton>
                </div>
              </CCardHeader>
              <CCardBody className="p-4">
                {loading && (
                  <div className="d-flex justify-content-center align-items-center" style={{ height: "300px" }}>
                    <div className="text-center">
                      <CSpinner color="primary" style={{ width: "3rem", height: "3rem" }} />
                      <p className="mt-3 text-medium-emphasis">Loading weight data...</p>
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
                      <p className="mb-0">No weight data available for the selected time period.</p>
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
                              <FontAwesomeIcon icon={faWeightHanging} size="2x" className="text-primary" />
                            </div>
                            <div>
                              <div className="text-medium-emphasis small">Total Weight</div>
                              <div className="fs-3 fw-bold">{totalWeight.toFixed(2)} kg</div>
                            </div>
                          </div>
                        </CCallout>
                      </CCol>
                      
                      <CCol lg={4} md={6} className="mb-4">
                        <CCallout color="info" className="h-100">
                          <div className="d-flex align-items-center">
                            <div className="p-3 bg-info bg-opacity-25 rounded-circle me-3">
                              <FontAwesomeIcon icon={faBalanceScale} size="2x" className="text-info" />
                            </div>
                            <div>
                              <div className="text-medium-emphasis small">Average Monthly Weight</div>
                              <div className="fs-3 fw-bold">
                                {calculateAverageWeight().toFixed(2)} kg
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
                                <div className="text-medium-emphasis small">Month-over-Month Change</div>
                                <div className="fs-3 fw-bold">
                                  {calculateChange(chartData.data.length - 1) !== null 
                                    ? `${calculateChange(chartData.data.length - 1) > 0 ? '+' : ''}${calculateChange(chartData.data.length - 1).toFixed(1)}%` 
                                    : "N/A"}
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
                          <CCardHeader className="bg-white border-bottom d-flex justify-content-between align-items-center py-3">
                            <h4 className="mb-0">
                              <FontAwesomeIcon icon={faChartBar} className="me-2 text-primary" />
                              Monthly Weight Distribution
                            </h4>
                            <CButton color="light" size="sm">
                              <FontAwesomeIcon icon={faInfoCircle} className="me-1" /> Weight Analysis
                            </CButton>
                          </CCardHeader>
                          <CCardBody className="p-4">
                            <div className="px-3">
                              <CRow className="align-items-end g-0" style={{ height: "250px" }}>
                                {chartData.data.map((value, index) => (
                                  <CCol key={index} className="px-1 text-center">
                                    <div className="d-flex flex-column align-items-center">
                                      <small className="mb-2 fw-bold">{Number(value).toFixed(2)} kg</small>
                                      <div style={{ width: "100%", height: `${(Number(value) / maxValue) * 80}%`, minHeight: Number(value) > 0 ? "20px" : "4px" }}>
                                        <CProgress 
                                          value={100} 
                                          color={index === chartData.data.length - 1 ? "primary" : "success"} 
                                          className="h-100 shadow-sm" 
                                          style={{ minWidth: "30px", borderRadius: "4px" }}
                                        />
                                      </div>
                                      <small className="mt-2 text-medium-emphasis">
                                        <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                                        {chartData.labels[index] || `Month ${index + 1}`}
                                      </small>
                                      
                                      {/* Display change percentage */}
                                      {index > 0 && (
                                        <CBadge 
                                          color={getChangeColor(calculateChange(index))}
                                          shape="rounded-pill" 
                                          className="mt-1"
                                        >
                                          <FontAwesomeIcon 
                                            icon={getChangeIcon(calculateChange(index))} 
                                            className="me-1" 
                                            size="xs" 
                                          />
                                          {calculateChange(index) !== null ? `${calculateChange(index).toFixed(1)}%` : "N/A"}
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
                          <CCardHeader className="bg-white border-bottom d-flex justify-content-between align-items-center py-3">
                            <h4 className="mb-0">
                              <FontAwesomeIcon icon={faTable} className="me-2 text-primary" />
                              Weight Details
                            </h4>
                            <CButton color="primary" size="sm" variant="outline">
                              <FontAwesomeIcon icon={faDownload} className="me-1" /> Export Data
                            </CButton>
                          </CCardHeader>
                          <CCardBody className="p-0">
                            <CTable hover responsive className="mb-0 border-0">
                              <CTableHead className="bg-light">
                                <CTableRow>
                                  <CTableHeaderCell>Month</CTableHeaderCell>
                                  <CTableHeaderCell className="text-end">Weight (kg)</CTableHeaderCell>
                                  <CTableHeaderCell className="text-end">% of Total</CTableHeaderCell>
                                  <CTableHeaderCell className="text-end">Change</CTableHeaderCell>
                                </CTableRow>
                              </CTableHead>
                              <CTableBody>
                                {chartData.data.map((value, index) => (
                                  <CTableRow key={index}>
                                    <CTableDataCell>
                                      <div className="d-flex align-items-center">
                                        <div className="p-2 me-2 bg-light rounded">
                                          <FontAwesomeIcon icon={faCalendarAlt} className="text-primary" />
                                        </div>
                                        <span className="fw-medium">{chartData.labels[index] || `Month ${index + 1}`}</span>
                                      </div>
                                    </CTableDataCell>
                                    <CTableDataCell className="text-end fw-bold">{Number(value).toFixed(2)}</CTableDataCell>
                                    <CTableDataCell className="text-end">
                                      <div className="d-flex align-items-center justify-content-end">
                                        <span className="me-2">
                                          {totalWeight > 0 ? `${((Number(value) / totalWeight) * 100).toFixed(1)}%` : '0%'}
                                        </span>
                                        <CProgress 
                                          value={totalWeight > 0 ? ((Number(value) / totalWeight) * 100) : 0} 
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
                                        >
                                          <FontAwesomeIcon 
                                            icon={getChangeIcon(calculateChange(index))} 
                                            className="me-1" 
                                          />
                                          {calculateChange(index) !== null ? `${calculateChange(index).toFixed(1)}%` : "N/A"}
                                        </CBadge>
                                      ) : (
                                        <CBadge color="secondary" shape="rounded-pill">
                                          <FontAwesomeIcon icon={faEquals} className="me-1" /> Base
                                        </CBadge>
                                      )}
                                    </CTableDataCell>
                                  </CTableRow>
                                ))}
                              </CTableBody>
                              <CTableFoot className="bg-light">
                                <CTableRow>
                                  <CTableDataCell className="fw-bold">Total</CTableDataCell>
                                  <CTableDataCell className="fw-bold text-end">{totalWeight.toFixed(2)}</CTableDataCell>
                                  <CTableDataCell className="fw-bold text-end">100%</CTableDataCell>
                                  <CTableDataCell className="text-end">
                                    {chartData.data.length >= 2 && (
                                      <CBadge 
                                        color={
                                          Number(chartData.data[chartData.data.length - 1]) > Number(chartData.data[0]) ? "success" :
                                          Number(chartData.data[chartData.data.length - 1]) < Number(chartData.data[0]) ? "danger" : "info"
                                        }
                                        shape="rounded-pill"
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
                                          "N/A"
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

export default InsightWeight;