import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { FiShield, FiCheckSquare, FiDollarSign, FiPlus } from 'react-icons/fi';
import InspectionReports from './InspectionReports';
import Warranties from './Warranties';
import CreateInspectionRequestModal from './CreateInspectionRequestModal';

const ShopOwnerDashboard = () => {
  const [activeTab, setActiveTab] = useState('inspections');
  const [stats, setStats] = useState({
    totalWarranties: 0,
    totalInspections: 0,
    totalSpent: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/shop-owner/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to fetch dashboard statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestSuccess = (newRequest) => {
    toast.success('Inspection request created successfully');
    // Optionally refresh stats or data
    fetchStats();
  };

  const renderStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Warranties</p>
            <p className="text-2xl font-semibold text-gray-900">
              {stats.totalWarranties}
            </p>
          </div>
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <FiShield className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Inspections</p>
            <p className="text-2xl font-semibold text-gray-900">
              {stats.totalInspections}
            </p>
          </div>
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
            <FiCheckSquare className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Spent</p>
            <p className="text-2xl font-semibold text-gray-900">
              ₹{stats.totalSpent.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
            <FiDollarSign className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex">
      <main className="flex-1 ml-64 bg-gray-50 min-h-screen">
        <div className="max-w-full">
          <Toaster position="top-right" />
          
          {/* Header with Stats */}
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Shop Dashboard</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Monitor your inspections and warranties
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
              >
                <FiPlus className="mr-2" />
                New Inspection Request
              </button>
            </div>

            {/* Stats Cards */}
            {renderStats()}
          </div>

          {/* Tabs */}
          <div className="px-4 border-b border-gray-200">
            <nav className="flex space-x-4" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('inspections')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'inspections'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Inspection Reports
              </button>
              <button
                onClick={() => setActiveTab('warranties')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'warranties'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Warranties
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow">
                {activeTab === 'inspections' ? (
                  <InspectionReports />
                ) : (
                  <Warranties />
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create Inspection Request Modal */}
      <CreateInspectionRequestModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleRequestSuccess}
      />
    </div>
  );
};

export default ShopOwnerDashboard; 