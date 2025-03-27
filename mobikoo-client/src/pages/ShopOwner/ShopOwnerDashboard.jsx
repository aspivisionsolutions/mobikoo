import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { FiShield, FiCheckSquare, FiDollarSign, FiPlus, FiAlertCircle } from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';
import InspectionReports from './InspectionReports';
import Warranties from './Warranties';
import CreateInspectionRequestModal from './CreateInspectionRequestModal';
import Claims from './Claims';
import customersData from "../../assets/customers.json"
import SalesChart from '../../components/SalesChart';
import CustomerStats from '../../components/CustomerStats';
const API_URL = import.meta.env.VITE_API_URL;

const ShopOwnerDashboard = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/');
  const currentTab = pathSegments[pathSegments.length - 1];

  const [activeTab, setActiveTab] = useState(currentTab || 'inspections');
  const [stats, setStats] = useState({
    totalWarranties: 0,
    totalInspections: 0,
    totalSpent: 0
  });
  const [shopDetails, setShopDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [customers,setCustomers] = useState(customersData)
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchShopDetails();
  }, []);

  useEffect(() => {
    setActiveTab(currentTab);
  }, [location.pathname]);
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/user/shop-owner/customers`,
          { headers: { Authorization: `${localStorage.getItem("token")}` } }
        );
        // setCustomers(response.data);
      } catch (error) {
        console.error("Error fetching customers: ", error);
      }
    };

    fetchCustomers();
  }, []);
  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/stats/shop-owner`, {
        headers: { Authorization: `${localStorage.getItem('token')}` }
      });
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to fetch dashboard statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchShopDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/user/shop-owner`, {
        headers: { Authorization: `${localStorage.getItem('token')}` }
      });
      
      if (response.data.shopprofile && response.data.shopprofile.length > 0) {
        const profile = response.data.shopprofile[0];
        setShopDetails({
          shopName: profile.shopDetails?.shopName,
          address: profile.shopDetails?.address,
          mobileNumber: profile.phoneNumber
        });
      } else {
        setShopDetails(null);
      }
    } catch (error) {
      console.error('Error fetching shop details:', error);
      setShopDetails(null);
    }
  };
  const isShopDetailsComplete = () => {
    return shopDetails && 
           shopDetails.shopName && 
           shopDetails.mobileNumber && 
           shopDetails.address;
  };

  const handleRequestSuccess = (newRequest) => {
    toast.success('Inspection request created successfully');
    fetchStats();
  };

  const renderStats = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Warranties</p>
            <p className="text-xl sm:text-2xl font-semibold text-gray-900">
              {stats.totalIssuedWarranties}
            </p>
          </div>
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-green-100 flex items-center justify-center">
            <FiShield className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Inspections</p>
            <p className="text-xl sm:text-2xl font-semibold text-gray-900">
              {stats.totalInspectionReports}
            </p>
          </div>
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-blue-100 flex items-center justify-center">
            <FiCheckSquare className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Claims</p>
            <p className="text-xl sm:text-2xl font-semibold text-gray-900">
              {stats.totalClaims}
            </p>
          </div>
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-purple-100 flex items-center justify-center">
            <FiDollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
          </div>
        </div>
      </div>
      <div className="col-span-1 border-l pl-4">
          <CustomerStats />
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full">
        <Toaster position="top-right" />
        
        {/* Header with Stats */}
        {activeTab === 'dashboard' && (
          <div className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Shop Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">
                Monitor your inspections and warranties
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {!isShopDetailsComplete() && (
                <div className="flex items-center text-amber-600 bg-amber-50 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm">
                  <FiAlertCircle className="mr-2 flex-shrink-0" />
                  <span>
                    Please <Link to="/shop-owner/profile" className="underline font-medium">complete your shop profile</Link> to create inspection requests
                  </span>
                </div>
              )}
              <button
                onClick={() => setShowCreateModal(true)}
                disabled={!isShopDetailsComplete()}
                className={`w-full sm:w-auto px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center
                  ${!isShopDetailsComplete()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  }`}
              >
                <FiPlus className="mr-2" />
                New Inspection Request
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          {renderStats()}
          <SalesChart/>
        </div>
        )}
        

        {/* Create Inspection Request Modal */}
        {showCreateModal && (
          <CreateInspectionRequestModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSuccess={handleRequestSuccess}
          />
        )}
        {/* Content based on active tab */}
        <div className="px-4">
          {activeTab === 'inspections' && <InspectionReports />}
          {activeTab === 'warranties' && <Warranties />}
          {activeTab === 'claims' && <Claims />}
        </div>
      </div>
    </div>
  );
};

export default ShopOwnerDashboard; 