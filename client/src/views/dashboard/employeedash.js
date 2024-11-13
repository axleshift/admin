import React, { useEffect, useState } from 'react'
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
} from '@coreui/react'
import CustomHeader from '../../components/header/customhead'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCartShopping, faChartLine, faDownload, faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { useGetDashboardQuery, useGetShippingQuery } from '../../state/api'
import StatBox from '../pages/scene/statbox'
import OverviewChart from '../pages/sales/overviewChart'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import BreakdownChart from '../../views/pages/sales/breakdownchart'; 
import '../../scss/_custom.scss'

const Employeedash = () => {
  const { data, isLoading } = useGetDashboardQuery()
  const { data: shippingData, error, isLoading: isShippingLoading } = useGetShippingQuery()
  const [isNonMediumScreens, setIsNonMediumScreens] = useState(window.innerWidth > 768)

  useEffect(() => {
    const handleResize = () => setIsNonMediumScreens(window.innerWidth > 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleDownload = async () => {
    if (!shippingData) return
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Transactions')

    worksheet.columns = [
      { header: 'Customer Name', key: 'CustomerName', width: 20 },
      { header: 'Order Volume (kg)', key: 'OrderVolume', width: 15 },
      { header: 'Shipping Type', key: 'ShippingType', width: 15 },
      { header: 'Order Date', key: 'OrderDate', width: 20 },
      { header: 'Status', key: 'Status', width: 15 },
      { header: 'Delivery Date', key: 'DeliveryDate', width: 20 },
    ]

    shippingData.forEach((shipping) => {
      worksheet.addRow({
        CustomerName: shipping.customerName,
        OrderVolume: `${shipping.orderVolume} kg`,
        ShippingType: shipping.shippingType,
        OrderDate: new Date(shipping.orderDate).toLocaleDateString(),
        Status: shipping.status,
        DeliveryDate: shipping.deliveryDate ? new Date(shipping.deliveryDate).toLocaleString() : 'N/A',
      })
    })

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(blob, 'shipping_transactions.xlsx')
  }

  return (
    <CContainer>
      <CRow className="mb-4" style={{ margin: '1.5rem 2.5rem' }}>
        <CustomHeader title="Dashboard" subtitle="Welcome to Dashboard" />
        <CCol className="d-flex justify-content-end align-items-center">
          <button
            style={{
              backgroundColor: 'green',
              fontSize: '10px',
              fontWeight: 'bold',
              padding: '10px 20px',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
            onClick={handleDownload}
          >
            <FontAwesomeIcon icon={faDownload} />
            &nbsp; Download Reports
          </button>
        </CCol>
      </CRow>

      <CRow
        style={{
          display: isNonMediumScreens ? 'grid' : 'flex',
          flexDirection: isNonMediumScreens ? 'none' : 'column',
          gridTemplateColumns: isNonMediumScreens ? 'repeat(12, 1fr)' : '1fr',
          gridAutoRows: '160px',
          gap: '20px',
        }}
      >
        <CCol style={{ gridColumn: isNonMediumScreens ? 'span 3' : 'span 1' }}>
          <StatBox
            title="Total Customers"
            value={data && data.totalCustomers}
            increase="+14%"
            description="Since last month"
            icon={<FontAwesomeIcon icon={faEnvelope} style={{ fontSize: '20px', color: '#ffc107' }} />}
          />
        </CCol>
        <CCol style={{ gridColumn: isNonMediumScreens ? 'span 3' : 'span 1' }}>
            <StatBox
              title="Sales Today"
              value={data?.todayStats?.totalSales || 'N/A'}
              increase="+21%"
              description="Since last month"
              icon={<FontAwesomeIcon icon={faCartShopping} style={{ fontSize: '20px' }} />}
            />
          </CCol>
        <CCol style={{ gridColumn: isNonMediumScreens ? 'span 6' : 'span 1' }}>
          <OverviewChart view="sales" salesData={data} />
        </CCol>
        <CCol style={{ gridColumn: isNonMediumScreens ? 'span 3' : 'span 1' }}>
          <StatBox
            title="Monthly Sales"
            value={data && data.thisMonthStats.totalSales}
            increase="+5%"
            description="Since last month"
            icon={<FontAwesomeIcon icon={faChartLine} style={{ fontSize: '20px' }} />}
          />
        </CCol>
        <CCol style={{ gridColumn: isNonMediumScreens ? 'span 3' : 'span 1' }}>
          <StatBox
            title="Yearly Sales"
            value={data && data.yearlySalesTotal}
            increase="+43%"
            description="Since last month"
            icon={<FontAwesomeIcon icon={faChartLine} style={{ fontSize: '20px' }} />}
          />
        </CCol>
      </CRow>


      <CRow className="custom-container custom-margin-top">
  <CCol xs={12} md={8}>
    <CCard>
      <h5 className="p-3">Transactions</h5>
      <CTable striped bordered hover responsive>
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
    </CCard>
  </CCol>

  <CCol xs={12} md={4}>
    <CCard>
      <h5 className="p-3">Sales By Category</h5>
      <BreakdownChart />
      <h6 className="p-3">Revenue of this year and Sales</h6>
    </CCard>
  </CCol>
</CRow>
    </CContainer>
  )
}

export default Employeedash
