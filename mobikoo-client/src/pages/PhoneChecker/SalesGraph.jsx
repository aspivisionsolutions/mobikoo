import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import axios from 'axios';

const SalesGraph = () => {
  const [chartData, setChartData] = useState([]);
  const [reports, setReports] = useState([]); // Using 'reports' instead of 'warranties'
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalInspections, setTotalInspections] = useState(0); // Total inspections


  const fetchReports = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('http://localhost:5000/api/inspection/phoneChecker/reports', {
        headers: { Authorization: `${localStorage.getItem('token')}` }
      });
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError(`Failed to load reports: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    const calculateMonthlyInspections = () => {
      const monthlyInspections = {};

      reports.forEach(report => {
        const inspectionDate = new Date(report.inspectionDate); // Assuming 'inspectionDate' exists
        const month = inspectionDate.toLocaleString('default', { month: 'short', year: 'numeric' });
        monthlyInspections[month] = (monthlyInspections[month] || 0) + 1;
      });

      const formattedData = Object.entries(monthlyInspections)
        .map(([month, count]) => ({ month, count, timestamp: Date.parse(`01 ${month}`) }))
        .sort((a, b) => a.timestamp - b.timestamp)
        .map(({ month, count }) => ({ month, count }));

      setChartData(formattedData);
    };

    const calculateTotalInspections = () => {
      setTotalInspections(reports.length);
    };

    if (reports.length > 0) {
      calculateMonthlyInspections();
      calculateTotalInspections();
    }
  }, [reports]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ width: "100%", height: 400 }}>
      <h2>Phone Checker Inspections Per Month</h2>
      <p>Total Inspections: {totalInspections}</p>
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

export default SalesGraph;
