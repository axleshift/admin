import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import PropTypes from 'prop-types';
const OverviewChart = ({ view, salesData }) => {
  const chartData = salesData?.monthlyData?.map((month) => ({
    month: month.month,
    value: view === "sales" ? month.totalSales : month.totalUnits,
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis domain={[0, 'dataMax + 50']} />
        <Tooltip formatter={(value) => [`${value}`, view === "sales" ? "Total Sales" : "Total Units"]} />
        <Legend />
        <Line
          type="monotone"
          dataKey="value"
          stroke={view === "sales" ? "#8884d8" : "#82ca9d"}
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
          name={view === "sales" ? "Total Sales" : "Total Units"}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

OverviewChart.propTypes = {
  view: PropTypes.string.isRequired,
  salesData: PropTypes.shape({
    monthlyData: PropTypes.arrayOf(
      PropTypes.shape({
        month: PropTypes.string.isRequired,
        totalSales: PropTypes.number,
        totalUnits: PropTypes.number,
      })
    ),
  }),
};
export default OverviewChart;
