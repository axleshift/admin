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
import { useGetDashboardQuery, useGetShippingQuery } from '../../state/api';
import StatBox from '../pages/scene/statbox';
import OverviewChart from '../pages/sales/overviewChart';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import BreakdownChart from '../../views/pages/sales/breakdownchart';
import '../../scss/dashboard.scss';

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

  const handleDownload = async () => {
    if (!shippingData) return;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Transactions');

    worksheet.columns = [
      { header: 'Customer Name', key: 'CustomerName', width: 20 },
      { header: 'Order Volume (kg)', key: 'OrderVolume', width: 15 },
      { header: 'Shipping Type', key: 'ShippingType', width: 15 },
      { header: 'Order Date', key: 'OrderDate', width: 20 },
      { header: 'Status', key: 'Status', width: 15 },
      { header: 'Delivery Date', key: 'DeliveryDate', width: 20 },
    ];

    shippingData.forEach((shipping) => {
      worksheet.addRow({
        CustomerName: shipping.customerName,
        OrderVolume: `${shipping.orderVolume} kg`,
        ShippingType: shipping.shippingType,
        OrderDate: new Date(shipping.orderDate).toLocaleDateString(),
        Status: shipping.status,
        DeliveryDate: shipping.deliveryDate ? new Date(shipping.deliveryDate).toLocaleString() : 'N/A',
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'shipping_transactions.xlsx');
  };

  if (isDashboardLoading || isShippingLoading) {
    return <div>Loading...</div>;
  }

  return (
    <CContainer fluid className="p-3">
      <CRow className="mb-4">
        <CCol xs={12} md={8}>
          <CustomHeader title="Dashboard" subtitle="Welcome to Dashboard" />
        </CCol>
        <CCol xs={12} md={4} className="d-flex justify-content-md-end align-items-center mb-3 mb-md-0">
          <button
            className="download-btn"
            onClick={handleDownload}
          >
            <FontAwesomeIcon icon={faDownload} />
            &nbsp; Download Reports
          </button>
        </CCol>
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
            <h6 className="p-3">Revenue of this year and Sales</h6>
          </CCard>
        </CCol>
      </CRow>

      {/* Access Token Card */}
      <CRow className="my-3">
        <CCol>
          <CCard>
            <h5 className="p-3">Access Token</h5>
            <p className="p-3">{accessToken}</p>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default Employeedash;