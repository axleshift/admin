import React, { useMemo, useEffect } from 'react';
import { CRow, CCol, CCard, CCardHeader, CCardBody } from '@coreui/react';
import CustomHeader from '../../../components/header/customhead';
import { useGetSalesQuery } from '../../../state/financeApi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import logActivity from './../../../utils/ActivityLogger'; // Import the logActivity function

const Monthly = () => {
  const { data, isLoading, error } = useGetSalesQuery();

  // Retrieve user information on component mount and log activity
  useEffect(() => {
    const userName = sessionStorage.getItem('name');
    const userRole = sessionStorage.getItem('role');
    const userDepartment = sessionStorage.getItem('department');
    
    // Log activity when component mounts - user viewed monthly sales page
    logActivity({
      name: userName,
      role: userRole,
      department: userDepartment,
      route: '/monthly',
      action: 'View Monthly Sales',
      description: 'User accessed the monthly sales and units report'
    });
    
    // Log errors if they occur
    if (error) {
      logActivity({
        name: userName,
        role: userRole,
        department: userDepartment,
        route: '/monthly',
        action: 'Error',
        description: 'Error occurred while loading monthly sales data'
      });
    }
  }, [error]);

  // Memoize the monthly data processing
  const formattedData = useMemo(() => {
    if (!data || !data.monthlyData) return [];

    return data.monthlyData.map((entry) => ({
      month: entry.month,
      sales: entry.totalSales,
      units: entry.totalUnits,
    }));
  }, [data]);

  return (
    <CRow>
      <CCol xs={12} md={12}>
        <CCard>
          <CCardHeader>
            <CustomHeader title="Monthly" subtitle="Monthly Sales and Units" />
          </CCardHeader>
          <CCardBody>
            {isLoading ? (
              <div>Loading data...</div>
            ) : error ? (
              <div>Error loading monthly data</div>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={formattedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  {/* Sales line in green */}
                  <Line type="monotone" dataKey="sales" stroke="#4CAF50" name="Monthly Sales" />
                  {/* Units line in orange */}
                  <Line type="monotone" dataKey="units" stroke="#FF9800" name="Monthly Units" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default Monthly;