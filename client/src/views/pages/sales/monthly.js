import React, { useMemo } from 'react';
import { CRow, CCol, CCard, CCardHeader, CCardBody } from '@coreui/react';
import CustomHeader from '../../../components/header/customhead';
import { useGetSalesQuery } from '../../../state/financeApi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Monthly = () => {
  const { data } = useGetSalesQuery();

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
            {/* Add a chart to display monthly sales and units */}
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
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default Monthly;
