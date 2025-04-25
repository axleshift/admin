import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { CCard, CCardBody, CCardHeader } from '@coreui/react';
import axiosInstance from '../../../../../utils/axiosInstance';

const MonthlySalesChart = () => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMonthlySalesData = async () => {
      try {
        setLoading(true);
        
        // Fetch monthly sales data
        const salesResponse = await axiosInstance.get('/finance/monthlysalesrevenue');
        
        if (salesResponse.data && Array.isArray(salesResponse.data)) {
          // Sort data by date for proper chronological display
          const sortedData = [...salesResponse.data].sort((a, b) => {
            const monthOrder = {
              'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
              'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11
            };
            
            if (a.year !== b.year) {
              return a.year - b.year;
            }
            return monthOrder[a.month] - monthOrder[b.month];
          });
          
          // Format data for chart display - include all months
          const formattedData = sortedData.map(item => ({
            name: `${item.month.substr(0, 3)} ${item.year}`,
            sales: item.totalSales
          }));
          
          setSalesData(formattedData);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch monthly sales data:', err);
        setError('An error occurred while fetching sales data');
        setLoading(false);
      }
    };
    
    fetchMonthlySalesData();
  }, []);

  if (loading) {
    return (
      <CCard className="mb-4">
        <CCardHeader>Monthly Sales</CCardHeader>
        <CCardBody className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </CCardBody>
      </CCard>
    );
  }

  if (error) {
    return (
      <CCard className="mb-4">
        <CCardHeader>Monthly Sales</CCardHeader>
        <CCardBody className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
          <div className="alert alert-danger">{error}</div>
        </CCardBody>
      </CCard>
    );
  }

  return (
    <CCard className="mb-4">
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <div>Monthly Sales</div>
        <div className="small text-medium-emphasis">{new Date().getFullYear()}</div>
      </CCardHeader>
      <CCardBody>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart
            data={salesData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              formatter={(value) => [`$${value.toLocaleString()}`, undefined]}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="sales"
              name="Total Sales"
              stroke="#0d6efd"
              activeDot={{ r: 8 }}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CCardBody>
    </CCard>
  );
};

export default MonthlySalesChart;