import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import customers from "../assets/customers.json"; // Import JSON file

const SalesChart = () => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const countWarrantiesByMonth = () => {
      const monthlyData = {};

      customers.forEach((customer) => {
        const issueDate = new Date(customer.warrantyDetails.issueDate);
        const month = issueDate.toLocaleString("default", { month: "short", year: "numeric" });

        if (!monthlyData[month]) {
          monthlyData[month] = 0;
        }
        monthlyData[month]++;
      });

      const formattedData = Object.entries(monthlyData)
        .map(([month, count]) => ({
          month,
          count,
          timestamp: Date.parse(`01 ${month}`), // Convert month string to timestamp for sorting
        }))
        .sort((a, b) => a.timestamp - b.timestamp) // Sort months chronologically
        .map(({ month, count }) => ({ month, count })); // Remove timestamp after sorting

      setChartData(formattedData);
    };

    countWarrantiesByMonth();
  }, []);

  return (
    <div style={{ width: "100%", height: 400 }}>
      <h2>Devices Sold Per Month</h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;
