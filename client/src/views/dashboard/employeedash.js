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
import { faCartShopping, faChartLine, faDownload, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { useGetDashboardQuery, useGetShippingQuery } from '../../state/adminApi';
import StatBox from '../pages/scene/statbox';
import OverviewChart from '../pages/sales/overviewChart';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import BreakdownChart from '../pages/sales/breakdownchart';
import '../../scss/dashboard.scss';

import Loader from '../../components/Loader';  

const Employeedash = () => {
  const navigate = useNavigate();
  const [isNonMediumScreens, setIsNonMediumScreens] = useState(window.innerWidth > 768);
  const [accessToken, setAccessToken] = useState('');

  const { data: dashboardData, isLoading: isDashboardLoading } = useGetDashboardQuery();
  const { data: shippingData, isLoading: isShippingLoading } = useGetShippingQuery();

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
            title="Total Customers"
            value={dashboardData && dashboardData.totalCustomers}
            increase="+14%"
            description="Since last month"
            icon={<FontAwesomeIcon icon={faEnvelope} style={{ fontSize: '20px', color: '#ffc107' }} />}
          />
        </CCol>
        <CCol xs={12} md={6} lg={3}>
          <StatBox
            title="Sales Today"
            value={dashboardData?.todayStats?.totalSales || 'N/A'}
            increase="+21%"
            description="Since last month"
            icon={<FontAwesomeIcon icon={faCartShopping} style={{ fontSize: '20px' }} />}
          />
        </CCol>
        <CCol xs={12} md={6} lg={3}>
          <StatBox
            title="Monthly Sales"
            value={dashboardData && dashboardData.thisMonthStats.totalSales}
            increase="+5%"
            description="Since last month"
            icon={<FontAwesomeIcon icon={faChartLine} style={{ fontSize: '20px' }} />}
          />
        </CCol>
        <CCol xs={12} md={6} lg={3}>
          <StatBox
            title="Yearly Sales"
            value={dashboardData && dashboardData.yearlySalesTotal}
            increase="+43%"
            description="Since last month"
            icon={<FontAwesomeIcon icon={faChartLine} style={{ fontSize: '20px' }} />}
          />
        </CCol>
      </CRow>

      {/* Chart Row */}
      <CRow className="my-3">
        <CCol xs={12}>
          <CCard className="mb-4">
            <div className="p-3">
              <OverviewChart view="sales" salesData={dashboardData} />
            </div>
          </CCard>
        </CCol>
      </CRow>

      {/* Transactions and Breakdown Row */}
      <CRow className="my-3 g-3">
        <CCol xs={12} lg={8}>
          <CCard>
            <h5 className="p-3">Transactions</h5>
            <div className="table-responsive">
              <CTable striped bordered hover responsive className="mb-0">
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Customer Name</CTableHeaderCell>
                    <CTableHeaderCell>Order Volume (kg)</CTableHeaderCell>
                    <CTableHeaderCell>Shipping Type</CTableHeaderCell>
                    <CTableHeaderCell>Order Date</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell>Delivery Date</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {shippingData &&
                    shippingData.map((shipping) => (
                      <CTableRow key={shipping._id}>
                        <CTableDataCell>{shipping.customerName}</CTableDataCell>
                        <CTableDataCell>{shipping.orderVolume}</CTableDataCell>
                        <CTableDataCell>{shipping.shippingType}</CTableDataCell>
                        <CTableDataCell>{new Date(shipping.orderDate).toLocaleDateString()}</CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={shipping.status === 'Delivered' ? 'success' : 'warning'}>
                            {shipping.status}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          {shipping.deliveryDate ? new Date(shipping.deliveryDate).toLocaleDateString() : 'N/A'}
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                </CTableBody>
              </CTable>
            </div>
          </CCard>
        </CCol>

        <CCol xs={12} lg={4}>
          <CCard>
            <h5 className="p-3">Sales By Category</h5>
            <div className="p-3">
              <BreakdownChart />
            </div>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default Employeedash;
