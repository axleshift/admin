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
  faChartPie,
  faSync
} from "@fortawesome/free-solid-svg-icons";

const InsightCost = () => {
  const [costData, setCostData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState("6months");

  useEffect(() => {
    const fetchCostData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/core/insight/cost?timeframe=${timeframe}`);
        setCostData(response.data);
      } catch (err) {
        setError(err.response?.data || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchCostData();
  }, [timeframe]);

  // Format data for the chart
  const formatChartData = () => {
    if (!costData) return null;
    
    const parsedData = typeof costData === 'string' ? JSON.parse(costData) : costData;
    return {
      labels: parsedData.labels || [],
      data: parsedData.data || []
    };
  };

  const chartData = formatChartData();
  const totalCosts = chartData ? chartData.data.reduce((sum, value) => sum + value, 0) : 0;
  const maxValue = chartData ? Math.max(...chartData.data, 1) : 1;

  // Calculate month-over-month changes
  const calculateChange = (index) => {
    if (!chartData || index === 0) return null;
    const currentValue = chartData.data[index];
    const previousValue = chartData.data[index - 1];
    if (previousValue === 0) return null;
    
    return ((currentValue - previousValue) / previousValue) * 100;
  };

  // Get color based on change direction
  const getChangeColor = (change) => {
    if (change === null) return "secondary";
    if (change > 0) return "danger";
    if (change < 0) return "success";
    return "info";
  };

  // Get icon based on change direction
  const getChangeIcon = (change) => {
    if (change === null) return faEquals;
    if (change > 0) return faArrowUp;
    if (change < 0) return faArrowDown;
    return faEquals;
  };

  // Function to refresh data
  const refreshData = () => {
    const fetchCostData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/core/insight/cost?timeframe=${timeframe}`);
        setCostData(response.data);
      } catch (err) {
        setError(err.response?.data || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchCostData();
  };

  return (
    <div className="bg-body min-vh-100 d-flex flex-column">
      <div className="py-4">
        <CRow>
          <CCol md={12}>
            <CCard className="mb-4 shadow-sm">
              <CCardHeader className="d-flex justify-content-between align-items-center py-3 border-bottom text-body-emphasis">
              <div>
  <h3 className="mb-0 text-body-emphasis">
    <FontAwesomeIcon icon={faMoneyBillWave} className="me-2 text-success" />
    Cost Insights
  </h3>
  <small className="text-body-secondary">
    Track and analyze your monthly expenditures
  </small>
</div>


                <div className="d-flex gap-2">
            
                  <CButton 
                      color="primary" 
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
                      <p className="mt-3 text-body-secondary">Loading cost data...</p>
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

                {chartData && !loading && !error && (
                  <>
                    <CRow className="mb-4">
                      <CCol lg={4} md={6} className="mb-4">
                        <CCallout color="info" className="h-100">
                          <div className="d-flex align-items-center">
                            <div className="p-3 bg-info bg-opacity-25 rounded-circle me-3">
                              <FontAwesomeIcon icon={faMoneyBillWave} size="2x" className="text-info" />
                            </div>
                            <div>
                              <div className="text-body-secondary small">Total Cost</div>
                              <div className="fs-3 fw-bold text-body-emphasis">₱{totalCosts.toFixed(2)}</div>
                            </div>
                          </div>
                        </CCallout>
                      </CCol>
                      
                      <CCol lg={4} md={6} className="mb-4">
                        <CCallout color="primary" className="h-100">
                          <div className="d-flex align-items-center">
                            <div className="p-3 bg-primary bg-opacity-25 rounded-circle me-3">
                              <FontAwesomeIcon icon={faChartPie} size="2x" className="text-primary" />
                            </div>
                            <div>
                              <div className="text-body-secondary small">Average Monthly Cost</div>
                              <div className="fs-3 fw-bold text-body-emphasis">
                              ₱{chartData.data.length > 0 ? (totalCosts / chartData.data.length).toFixed(2) : "0.00"}
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
                                <div className="text-body-secondary small">Month-over-Month Change</div>
                                <div className="fs-3 fw-bold text-body-emphasis">
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
                        <CCard className="shadow-sm">
                          <CCardHeader className="border-bottom d-flex justify-content-between align-items-center py-3 text-body-emphasis">
                            <h4 className="mb-0">
                              <FontAwesomeIcon icon={faChartBar} className="me-2 text-primary" />
                              Monthly Cost Breakdown
                            </h4>
                          
                          </CCardHeader>
                          <CCardBody className="p-4">
                            <div className="px-3">
                              <CRow className="align-items-end g-0" style={{ height: "250px" }}>
                                {chartData.data.map((value, index) => (
                                  <CCol key={index} className="px-1 text-center">
                                    <div className="d-flex flex-column align-items-center">
                                      <small className="mb-2 fw-bold text-body-emphasis">${value.toFixed(2)}</small>
                                      <div style={{ width: "100%", height: `${(value / maxValue) * 80}%`, minHeight: value > 0 ? "20px" : "4px" }}>
                                        <CProgress 
                                          value={100} 
                                          color={index === chartData.data.length - 1 ? "primary" : "success"} 
                                          className="h-100 shadow-sm" 
                                          style={{ minWidth: "30px", borderRadius: "4px" }}
                                        />
                                      </div>
                                      <small className="mt-2 text-body-secondary">
                                        <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                                        {chartData.labels[index]}
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
                        <CCard className="shadow-sm">
                          <CCardHeader className="border-bottom d-flex justify-content-between align-items-center py-3 text-body-emphasis">
                            <h4 className="mb-0">
                              <FontAwesomeIcon icon={faTable} className="me-2 text-primary" />
                              Cost Details
                            </h4>
                            
                          </CCardHeader>
                          <CCardBody className="p-0">
                            <CTable hover responsive className="mb-0 border-0">
                              <CTableHead>
                                <CTableRow>
                                  <CTableHeaderCell>Month</CTableHeaderCell>
                                  <CTableHeaderCell className="text-end">Cost (₱)</CTableHeaderCell>
                                  <CTableHeaderCell className="text-end">% of Total</CTableHeaderCell>
                                  <CTableHeaderCell className="text-end">Change</CTableHeaderCell>
                                </CTableRow>
                              </CTableHead>
                              <CTableBody>
                                {chartData.labels.map((month, index) => (
                                  <CTableRow key={index}>
                                    <CTableDataCell>
                                      <div className="d-flex align-items-center">
                                        <div className="p-2 me-2 bg-body-tertiary rounded">
                                          <FontAwesomeIcon icon={faCalendarAlt} className="text-primary" />
                                        </div>
                                        <span className="fw-medium text-body-emphasis">{month}</span>
                                      </div>
                                    </CTableDataCell>
                                    <CTableDataCell className="text-end fw-bold text-body-emphasis">₱{chartData.data[index].toFixed(2)}</CTableDataCell>
                                    <CTableDataCell className="text-end">
                                      <div className="d-flex align-items-center justify-content-end">
                                        <span className="me-2 text-body-emphasis">
                                          {totalCosts > 0 ? `${((chartData.data[index] / totalCosts) * 100).toFixed(1)}%` : '0%'}
                                        </span>
                                        <CProgress 
                                          value={totalCosts > 0 ? ((chartData.data[index] / totalCosts) * 100) : 0} 
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
                                          {calculateChange(index) !== null ? `${calculateChange(index).toFixed(1)}%` : ""}
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
                              <CTableFoot>
                                <CTableRow>
                                  <CTableDataCell className="fw-bold text-body-emphasis">Total</CTableDataCell>
                                  <CTableDataCell className="fw-bold text-end text-body-emphasis">₱{totalCosts.toFixed(2)}</CTableDataCell>
                                  <CTableDataCell className="fw-bold text-end text-body-emphasis">100%</CTableDataCell>
                                  <CTableDataCell className="text-end">
                                    {chartData.data.length >= 2 && (
                                      <CBadge 
                                        color={
                                          chartData.data[chartData.data.length - 1] > chartData.data[0] ? "danger" :
                                          chartData.data[chartData.data.length - 1] < chartData.data[0] ? "success" : "info"
                                        }
                                        shape="rounded-pill"
                                      >
                                        <FontAwesomeIcon 
                                          icon={
                                            chartData.data[chartData.data.length - 1] > chartData.data[0] ? faArrowUp :
                                            chartData.data[chartData.data.length - 1] < chartData.data[0] ? faArrowDown : faEquals
                                          } 
                                          className="me-1" 
                                        />
                                        {chartData.data[0] !== 0 ? 
                                          `${(((chartData.data[chartData.data.length - 1] - chartData.data[0]) / chartData.data[0]) * 100).toFixed(1)}%` : 
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

export default InsightCost;