import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import {
  CRow,
  CCol,
  CDropdown,
  CDropdownMenu,
  CDropdownItem,
  CDropdownToggle,
  CWidgetStatsA,
} from '@coreui/react'
import { getStyle } from '@coreui/utils'
import { CChartLine } from '@coreui/react-chartjs'
import CIcon from '@coreui/icons-react'
import { cilOptions } from '@coreui/icons'
import { useGetLogisticsQuery, useGetEmployeesQuery } from '../../state/api'

const WidgetsDropdown = (props) => {
  const widgetChartRef1 = useRef(null)
  const widgetChartRef2 = useRef(null)

  const {
    data: logistics,
    isLoading: loadingLogistics,
    isError: errorLogistics,
  } = useGetLogisticsQuery()
  const {
    data: employees,
    isLoading: loadingEmployees,
    isError: errorEmployees,
  } = useGetEmployeesQuery()

  const cargoCounts = logistics
    ? calculateCargoCounts(logistics)
    : { delivered: 0, inTransit: 0, pending: 0 }
  const totalEmployees = employees ? employees.length : 0
  const attritionRate = calculateAttritionRate(employees)

  useEffect(() => {
    const handleColorSchemeChange = () => {
      if (widgetChartRef1.current) {
        setTimeout(() => {
          widgetChartRef1.current.data.datasets[0].pointBackgroundColor = getStyle('--cui-success')
          widgetChartRef1.current.update()
        })
      }

      if (widgetChartRef2.current) {
        setTimeout(() => {
          widgetChartRef2.current.data.datasets[0].pointBackgroundColor = getStyle('--cui-warning')
          widgetChartRef2.current.update()
        })
      }
    }

    document.documentElement.addEventListener('ColorSchemeChange', handleColorSchemeChange)

    return () => {
      document.documentElement.removeEventListener('ColorSchemeChange', handleColorSchemeChange)
    }
  }, [widgetChartRef1, widgetChartRef2])

  return (
    <CRow className={props.className} xs={{ gutter: 4 }}>
      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsA
          color="success"
          value={loadingLogistics ? 'Loading...' : cargoCounts.delivered}
          title="Delivered Cargo"
          action={renderDropdown()}
          chart={renderCargoChart(widgetChartRef1, cargoCounts)}
        />
      </CCol>

      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsA
          color="warning"
          value={
            loadingLogistics
              ? 'Loading...'
              : `${((cargoCounts.pending / logistics.length) * 100).toFixed(2)}%`
          }
          title="Pending Cargo"
          action={renderDropdown()}
          chart={renderPendingCargoChart(widgetChartRef2, cargoCounts)}
        />
      </CCol>

      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsA
          color="primary"
          value={loadingEmployees ? 'Loading...' : totalEmployees}
          title="Total Employees"
          action={renderDropdown()}
          chart={renderEmployeeGrowthChart()}
        />
      </CCol>

      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsA
          color="info"
          value={loadingEmployees ? 'Loading...' : `${attritionRate}%`}
          title="Attrition Rate"
          action={renderDropdown()}
          chart={renderAttritionChart()}
        />
      </CCol>
    </CRow>
  )

  function renderDropdown() {
    return (
      <CDropdown alignment="end">
        <CDropdownToggle color="transparent" caret={false} className="text-white p-0">
          <CIcon icon={cilOptions} />
        </CDropdownToggle>
        <CDropdownMenu>
          <CDropdownItem>Action</CDropdownItem>
          <CDropdownItem>Another action</CDropdownItem>
          <CDropdownItem>Something else here...</CDropdownItem>
          <CDropdownItem disabled>Disabled action</CDropdownItem>
        </CDropdownMenu>
      </CDropdown>
    )
  }

  function renderCargoChart(ref, cargoCounts) {
    return (
      <CChartLine
        ref={ref}
        className="mt-3 mx-3"
        style={{ height: '70px' }}
        data={{
          labels: ['Delivered', 'In Transit', 'Pending'],
          datasets: [
            {
              label: 'Cargo Status',
              backgroundColor: 'transparent',
              borderColor: 'rgba(255,255,255,.55)',
              pointBackgroundColor: getStyle('--cui-success'),
              data: [cargoCounts.delivered, cargoCounts.inTransit, cargoCounts.pending],
            },
          ],
        }}
        options={chartOptions()}
      />
    )
  }

  function renderPendingCargoChart(ref, cargoCounts) {
    return (
      <CChartLine
        ref={ref}
        className="mt-3 mx-3"
        style={{ height: '70px' }}
        data={{
          labels: ['Pending', 'In Transit'],
          datasets: [
            {
              label: 'Cargo Status',
              backgroundColor: 'transparent',
              borderColor: 'rgba(255,255,255,.55)',
              pointBackgroundColor: getStyle('--cui-warning'),
              data: [cargoCounts.pending, cargoCounts.inTransit],
            },
          ],
        }}
        options={chartOptions()}
      />
    )
  }

  function renderEmployeeGrowthChart() {
    return (
      <CChartLine
        className="mt-3 mx-3"
        style={{ height: '70px' }}
        data={{
          labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
          datasets: [
            {
              label: 'Employee Growth',
              backgroundColor: 'transparent',
              borderColor: 'rgba(255,255,255,.55)',
              pointBackgroundColor: getStyle('--cui-primary'),
              data: [65, 59, 84, 84, 51, 55, 40],
            },
          ],
        }}
        options={chartOptions()}
      />
    )
  }

  function renderAttritionChart() {
    return (
      <CChartLine
        className="mt-3 mx-3"
        style={{ height: '70px' }}
        data={{
          labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
          datasets: [
            {
              label: 'Attrition',
              backgroundColor: 'transparent',
              borderColor: 'rgba(255,255,255,.55)',
              pointBackgroundColor: getStyle('--cui-info'),
              data: [1, 18, 9, 17, 34, 22, 11],
            },
          ],
        }}
        options={chartOptions()}
      />
    )
  }

  function chartOptions() {
    return {
      plugins: {
        legend: {
          display: false,
        },
      },
      maintainAspectRatio: false,
      scales: {
        x: {
          border: { display: false },
          grid: { display: false, drawBorder: false },
          ticks: { display: false },
        },
        y: {
          display: true,
          grid: { display: false },
        },
      },
      elements: {
        line: { borderWidth: 1, tension: 0.4 },
        point: { radius: 4, hitRadius: 10, hoverRadius: 4 },
      },
    }
  }
}

const calculateCargoCounts = (data) => {
  const counts = { delivered: 0, inTransit: 0, pending: 0 }
  data.forEach((logistics) => {
    if (logistics.status === 'delivered') counts.delivered++
    else if (logistics.status === 'in transit') counts.inTransit++
    else counts.pending++
  })
  return counts
}

const calculateAttritionRate = (employees) => {
  return 10 // Placeholder for actual calculation logic
}

WidgetsDropdown.propTypes = {
  className: PropTypes.string,
}

export default WidgetsDropdown
