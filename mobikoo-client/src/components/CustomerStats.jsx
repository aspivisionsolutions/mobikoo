import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiTrendingUp, FiTrendingDown, FiUsers } from "react-icons/fi";

const CustomerStats = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL + "/api/customers/daily-customer-change";

  useEffect(() => {
    fetchCustomerChange();
  }, []);

  const fetchCustomerChange = async () => {
  
    try {
      const response = await axios.get(API_URL, {
        headers: { Authorization: `${localStorage.getItem("token")}` },
      });
      setData(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching customer stats:", error);
      setData({
        totalCustomers: 0,
        todayCount: 0,
        yesterdayCount: 0,
        change: 0,
        trend: "no change"
      });
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="animate-pulse flex space-x-4">
        <div className="flex-1 space-y-4 py-1">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <FiUsers className="text-blue-600 mr-2 text-xl" />
          <h3 className="text-sm font-medium text-gray-600">Customers</h3>
        </div>
      </div>
      
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Total Customers</span>
          <span className="text-xl font-bold text-blue-800">
            {data.totalCustomers.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Today's Customers</span>
          <div className="flex items-center">
            <span className="text-xl font-bold text-blue-800 mr-2">
              {data.todayCount.toLocaleString()}
            </span>
            
            <div className="flex items-center">
              {data.change > 0 ? (
                <FiTrendingUp className="text-green-500 mr-1" />
              ) : data.change < 0 ? (
                <FiTrendingDown className="text-red-500 mr-1" />
              ) : null}
              
              <span className={`text-sm font-medium ${
                data.change > 0 
                  ? 'text-green-600' 
                  : data.change < 0 
                    ? 'text-red-600' 
                    : 'text-gray-600'
              }`}>
                {data.change > 0 ? '+' : ''}{data.change} ({data.trend})
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerStats;