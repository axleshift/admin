import React from 'react';
import PropTypes from 'prop-types';
import { useGetPerformanceQuery } from '../../state/api';
import {
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
} from 'recharts';

const Perform = () => {
  const { data, isLoading, error } = useGetPerformanceQuery();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error occurred: {error.message}</div>;

  console.log("data", data);

  if (!data || !Array.isArray(data) || data.length === 0) {
    return <div>No performance data available.</div>;
  }

  const chartData = data.map(user => ({
    name: user.name,
    performance: Number(user.performance) || 0,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label">{`Name: ${payload[0].name}`}</p>
          <p className="intro">{`Performance: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  CustomTooltip.propTypes = {
    active: PropTypes.bool,
    payload: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        value: PropTypes.number,
      })
    ),
  };

  return (
    <div>
      <h2>User Performance</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="performance"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Perform;
