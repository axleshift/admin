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
  CProgress
} from "@coreui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faMoneyBillWave, 
  faChartBar, 
  faTable, 
  faExclamationTriangle,
  faCalendarAlt
} from "@fortawesome/free-solid-svg-icons";

const InsightShipment = () => {
  const [shipmentData, setShipmentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchShipmentData = async () => {
      try {
        const response = await axiosInstance.get("/core/insight/shipment");
        setShipmentData(response.data);
      } catch (err) {
        setError(err.response?.data || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchShipmentData();
  }, []);

  // Format data for the chart
  const formatChartData = () => {
    if (!shipmentData) return null;
    
    const parsedData = typeof shipmentData === 'string' ? JSON.parse(shipmentData) : shipmentData;
    return {
      labels: parsedData.labels || [],
      data: parsedData.data || []
    };
  };

  const chartData = formatChartData();
  const totalShipments = chartData ? chartData.data.reduce((sum, value) => sum + value, 0) : 0;
  const maxValue = chartData ? Math.max(...chartData.data, 1) : 1;

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      <div className="py-4">
        <CRow>
          <CCol md={12}>
            <CCard className="mb-4">
              <CCardHeader className="d-flex justify-content-between align-items-center">
                <div>
                  <h3 className="mb-0">
                    <FontAwesomeIcon icon={faMoneyBillWave} className="me-2" /> 
                    Shipment Insights
                  </h3>
                  <small className="text-medium-emphasis">Monthly shipment breakdown</small>
                </div>
              </CCardHeader>
              <CCardBody>
                {loading && (
                  <div className="d-flex justify-content-center align-items-center" style={{ height: "200px" }}>
                    <CSpinner color="success" />
                  </div>
                )}

                {error && (
                  <CAlert color="danger">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                    {error}
                  </CAlert>
                )}

                {chartData && !loading && !error && (
                  <>
                    <CRow className="mb-4">
                      <CCol md={12}>
                        <h4 className="mb-3">
                          <FontAwesomeIcon icon={faChartBar} className="me-2" />
                          Monthly Shipments
                        </h4>
                        <div className="px-3">
                          <CRow className="align-items-end g-0" style={{ height: "250px" }}>
                            {chartData.data.map((value, index) => (
                              <CCol key={index} className="px-1 text-center">
                                <div className="d-flex flex-column align-items-center">
                                  <small className="mb-2 fw-bold">${value.toFixed(2)}</small>
                                  <div style={{ width: "100%", height: `${(value / maxValue) * 80}%`, minHeight: value > 0 ? "20px" : "4px" }}>
                                    <CProgress 
                                      value={100} 
                                      color="success" 
                                      className="h-100" 
                                      style={{ minWidth: "25px" }}
                                    />
                                  </div>
                                  <small className="mt-2 text-medium-emphasis">
                                    <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                                    {chartData.labels[index]}
                                  </small>
                                </div>
                              </CCol>
                            ))}
                          </CRow>
                        </div>
                      </CCol>
                    </CRow>

                    <CRow>
                      <CCol md={12}>
                        <h4 className="mb-3">
                          <FontAwesomeIcon icon={faTable} className="me-2" />
                          Shipment Data
                        </h4>
                        <CTable hover responsive>
                          <CTableHead>
                            <CTableRow>
                              <CTableHeaderCell>Month</CTableHeaderCell>
                              <CTableHeaderCell className="text-end">Shipment </CTableHeaderCell>
                              <CTableHeaderCell className="text-end">% of Total</CTableHeaderCell>
                            </CTableRow>
                          </CTableHead>
                          <CTableBody>
                            {chartData.labels.map((month, index) => (
                              <CTableRow key={index}>
                                <CTableDataCell>
                                  <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-medium-emphasis" />
                                  {month}
                                </CTableDataCell>
                                <CTableDataCell className="text-end">{chartData.data[index].toFixed(2)}</CTableDataCell>
                                <CTableDataCell className="text-end">
                                  {totalShipments > 0 ? `${((chartData.data[index] / totalShipments) * 100).toFixed(1)}%` : '0%'}
                                </CTableDataCell>
                              </CTableRow>
                            ))}
                          </CTableBody>
                          <CTableFoot>
                            <CTableRow>
                              <CTableDataCell className="fw-bold">Total</CTableDataCell>
                              <CTableDataCell className="fw-bold text-end">{totalShipments.toFixed(2)}</CTableDataCell>
                              <CTableDataCell className="fw-bold text-end">100%</CTableDataCell>
                            </CTableRow>
                          </CTableFoot>
                        </CTable>
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