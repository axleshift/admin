import React, { useState, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useGetSalesQuery } from '../../../state/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Daily = () => {
  const [startDate, setStartDate] = useState(new Date("2024-01-01"));
  const [endDate, setEndDate] = useState(new Date("2024-12-31"));
  const { data } = useGetSalesQuery();

  // Filter and format the data based on start and end dates
  const formattedData = useMemo(() => {
    if (!data || !data.dailyData) return [];

    return data.dailyData
      .filter((entry) => {
        const entryDate = new Date(entry.date);
        return entryDate >= startDate && entryDate <= endDate;
      })
      .map((entry) => ({
        date: entry.date,
        sales: entry.totalSales,
        units: entry.totalUnits,
      }));
  }, [data, startDate, endDate]);

  return (
    <div>
      <h2>Daily Sales and Units</h2>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <div>
          <label>Start Date: </label>
          <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} />
        </div>
        <div>
          <label>End Date: </label>
          <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} />
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          {/* Sales line in green */}
          <Line type="monotone" dataKey="sales" stroke="#4CAF50" name="Daily Sales" />
          {/* Units line in orange */}
          <Line type="monotone" dataKey="units" stroke="#FF9800" name="Daily Units" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Daily;
