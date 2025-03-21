import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import axios from 'axios';

const SalesGraph = () => {
  const [chartData, setChartData] = useState([]);
  const [warranties, setWarranties] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalSales, setTotalSales] = useState(0);

  const fetchWarranties = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('http://localhost:5000/api/warranty/issued-warranties', {
        headers: { Authorization: `${localStorage.getItem('token')}` }
      });
      setWarranties(response.data.data);
    } catch (error) {
      console.error('Error fetching warranties:', error);
      setError(`Failed to load issued warranties: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarranties();
  }, []);

  useEffect(() => {
    const calculateMonthlySales = () => {
      const monthlySales = {};

      warranties.forEach(warranty => {
        const issueDate = new Date(warranty.issueDate);
        const month = issueDate.toLocaleString('default', { month: 'short', year: 'numeric' });
        const price = warranty.warrantyPlanId?.price || 0; // Safe access to price
        monthlySales[month] = (monthlySales[month] || 0) + price;
      });

      const formattedData = Object.entries(monthlySales)
        .map(([month, sales]) => ({ month, sales, timestamp: Date.parse(`01 ${month}`) }))
        .sort((a, b) => a.timestamp - b.timestamp)
        .map(({ month, sales }) => ({ month, sales }));

      setChartData(formattedData);
    };

    const calculateTotalSales = () => {
      let total = 0;
      if (warranties && warranties.length > 0) {
        total = warranties.reduce((sum, warranty) => sum + (warranty.warrantyPlanId?.price || 0), 0);
      }
      setTotalSales(total);
    };

    if (warranties.length > 0) {
      calculateMonthlySales();
      calculateTotalSales();
    }
  }, [warranties]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ width: "100%", height: 400 }}>
      <h2>Warranties Sales Per Month</h2> {/* Removed "Last 12 Months" */}
      <p>Total Sales: {totalSales}</p>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="sales" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesGraph;
