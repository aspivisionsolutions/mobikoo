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
import Invoices from './Invoices';
const API_URL = import.meta.env.VITE_API_URL;

const ShopOwnerDashboard = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/');
  const currentTab = pathSegments[pathSegments.length - 1];
  const [showWarrantyModal, setShowWarrantyModal] = useState(false);
  const [warrantyPlan, setWarrantyPlan] = useState(null);
  const [showInspectionForm, setShowInspectionForm] = useState(false);
  const [reportForWarranty, setReportForWarranty] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Add state for submission status
  const [activeTab, setActiveTab] = useState(currentTab || 'inspections');
  const [stats, setStats] = useState({
    totalWarranties: 0,
    totalInspections: 0,
    totalSpent: 0
  });
  const [shopDetails, setShopDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [customers, setCustomers] = useState(customersData)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    shopOwnerId: '',
    imeiNumber: '',
    deviceModel: '',
    serialNumber: '',
    operatingSystem: '',
    screenCondition: '',
    bodyCondition: '',
    batteryHealth: '',
    chargingPortFunctionality: '',
    cameraFunctionality: '',
    buttonsSensors: '',
    osFunctionality: '',
    performanceBenchmark: '',
    photos: [],
    comments: '',
    digitalSignature: false,
    grade: '',
    photoPreviews: []
  });
  useEffect(() => {
    fetchStats();
    fetchShopDetails();
  }, []);
  const handleFormClose = () => {
    setShowInspectionForm(false);
    setFormData({
      shopOwnerId: '',
      imeiNumber: '',
      deviceModel: '',
      serialNumber: '',
      operatingSystem: '',
      screenCondition: '',
      bodyCondition: '',
      batteryHealth: '',
      chargingPortFunctionality: '',
      cameraFunctionality: '',
      buttonsSensors: '',
      osFunctionality: '',
      performanceBenchmark: '',
      photos: [],
      comments: '',
      digitalSignature: false,
      grade: '',
      photoPreviews: []
    });
  };
  const handleInspectClick = () => {
    setShowInspectionForm(true);
  };
  const handleInputChange = (e) => {
    const { name, type, checked, files } = e.target;

    if (type === 'file') {
      const newFiles = Array.from(files);
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));

      setFormData(prev => ({
        ...prev,
        [name]: prev[name] ? [...prev[name], ...newFiles] : newFiles, // Append new files
        photoPreviews: prev.photoPreviews ? [...prev.photoPreviews, ...newPreviews] : newPreviews // Append new previews
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : e.target.value
      }));
    }
  };
  console.log(shopDetails)
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(shopDetails.shopOwnerId)
    // Auto-inject shopOwnerId from shopDetails if not already present
    if (!formData.shopOwnerId && shopDetails?.shopOwnerId) {
      formData.shopOwnerId = shopDetails.shopOwnerId;
    }
  
    console.log(formData);
  
    if (!formData.imeiNumber) {
      toast.error('IMEI Number is mandatory');
      return;
    }
    if (!formData.digitalSignature) {
      toast.error('Please confirm the inspection with digital signature');
      return;
    }
  
    setIsSubmitting(true);
  
    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'photos' && Array.isArray(formData.photos)) {
        formData.photos.forEach(photo => {
          if (photo instanceof File) {
            formDataToSend.append('photos', photo);
          } else {
            console.warn("Skipping non-File photo:", photo);
          }
        });
      } else if (key !== 'photoPreviews') {
        formDataToSend.append(key, formData[key]);
      }
    });
  
    console.log("FormDataToSend entries:", [...formDataToSend.entries()]);
    
    try {
      await axios.post(`${API_URL}/api/inspection/submitReport`, formDataToSend, {
        headers: {
          Authorization: `${localStorage.getItem('token')}`
        },
      });
  
      toast.success('Inspection submitted successfully');
      handleFormClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit inspection");
      console.error('Error submitting inspection:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  

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
        console.log(profile)
        setShopDetails({
          shopName: profile.shopDetails?.shopName,
          address: profile.shopDetails?.address,
          shopOwnerId:profile.shopOwnerId,
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
                <button
                  onClick={handleInspectClick}
                  className={`w-full sm:w-auto px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center
                ${!isShopDetailsComplete
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    }`}
                  disabled={!isShopDetailsComplete}
                >
                  New Inspection
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            {renderStats()}
            {/* <SalesChart/> */}
            <Invoices />
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
      {showInspectionForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Phone Checker Inspection Form</h2>
              <button
                onClick={handleFormClose}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Shop & Inspector Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Shop Number *</label>
                  <div className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100">
                    {shopDetails.shopName}
                  </div>
                  <input
                    type="hidden"
                    name="shopOwnerId"
                    value={shopDetails.shopOwnerId}
                    onChange={handleInputChange}
                  />
                </div>

              </div>

              {/* Device Identification */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">IMEI Number *</label>
                  <input
                    type="text"
                    name="imeiNumber"
                    value={formData.imeiNumber}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Device Model</label>
                  <input
                    type="text"
                    name="deviceModel"
                    value={formData.deviceModel}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Serial Number</label>
                  <input
                    type="text"
                    name="serialNumber"
                    value={formData.serialNumber}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Operating System</label>
                  <select
                    name="operatingSystem"
                    value={formData.operatingSystem}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  >
                    <option value="">Select OS</option>
                    <option value="Android">Android</option>
                    <option value="iOS">iOS</option>
                  </select>
                </div>
              </div>

              {/* Physical Condition Assessment */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Screen Condition</label>
                  <select
                    name="screenCondition"
                    value={formData.screenCondition}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  >
                    <option value="">Select condition</option>
                    <option value="No scratches">No scratches</option>
                    <option value="Minor scratches">Minor scratches</option>
                    <option value="Cracked">Cracked</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Body Condition</label>
                  <select
                    name="bodyCondition"
                    value={formData.bodyCondition}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  >
                    <option value="">Select condition</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Damaged">Damaged</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Battery Health</label>
                  <select
                    name="batteryHealth"
                    value={formData.batteryHealth}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  >
                    <option value="">Select health</option>
                    <option value="Optimal">Optimal</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Charging Port</label>
                  <select
                    name="chargingPortFunctionality"
                    value={formData.chargingPortFunctionality}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  >
                    <option value="">Select status</option>
                    <option value="Functional">Functional</option>
                    <option value="Issues detected">Issues detected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Camera Functionality</label>
                  <select
                    name="cameraFunctionality"
                    value={formData.cameraFunctionality}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  >
                    <option value="">Select status</option>
                    <option value="Functional">Functional</option>
                    <option value="Minor issues">Minor issues</option>
                    <option value="Not functional">Not functional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Buttons & Sensors</label>
                  <select
                    name="buttonsSensors"
                    value={formData.buttonsSensors}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  >
                    <option value="">Select status</option>
                    <option value="Fully functional">Fully functional</option>
                    <option value="Some issues">Some issues</option>
                  </select>
                </div>
              </div>

              {/* Software & Performance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">OS Functionality</label>
                  <select
                    name="osFunctionality"
                    value={formData.osFunctionality}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  >
                    <option value="">Select status</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Performance Score</label>
                  <input
                    type="number"
                    name="performanceBenchmark"
                    value={formData.performanceBenchmark}
                    onChange={handleInputChange}
                    placeholder="Optional"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
              </div>

              {/* Evidence Collection */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Photos</label>
                <input
                  type="file"
                  name="photos"
                  onChange={handleInputChange}
                  multiple
                  accept="image/*"
                  className="mt-1 block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100"
                />
                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.photoPreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img src={preview} alt={`Preview ${index}`} className="w-full h-auto rounded-md" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Observations */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Comments/Notes</label>
                <textarea
                  name="comments"
                  value={formData.comments}
                  onChange={handleInputChange}
                  rows="3"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                ></textarea>
              </div>

              {/* Grade Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Grade *</label>
                <select
                  name="grade"
                  value={formData.grade}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  <option value="">Select grade</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
              </div>

              {/* Digital Signature */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="digitalSignature"
                  checked={formData.digitalSignature}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  I confirm that this inspection has been completed accurately
                </label>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleFormClose}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting} // Disable the button when submitting
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Submit Inspection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Warranty Plans Modal */}
      {showWarrantyModal && warrantyPlan && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-lg bg-white">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Warranty Plan</h2>
              <button
                onClick={() => {
                  setShowWarrantyModal(false);
                  setWarrantyPlan(null);
                  setReportForWarranty(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            <div className="bg-gradient-to-br from-white to-blue-50 rounded-lg p-6 border border-blue-100 shadow-sm">
              {/* Price Section */}
              <div className="text-center mb-6">
                <div className="inline-block bg-blue-600 text-white text-2xl font-bold px-6 py-3 rounded-full">
                  ₹{warrantyPlan.price}
                </div>
              </div>

              {/* Plan Details */}
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{warrantyPlan.planName}</h3>
                  <p className="text-gray-600">{warrantyPlan.coverageDetails}</p>
                </div>

                {/* Duration and Coverage */}
                <div className="bg-white rounded-lg p-4">
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Duration:</h4>
                    <div className="flex items-center text-gray-600">
                      <FiCheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      <span>{warrantyPlan.durationMonths} Months Coverage</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Coverage Details:</h4>
                    <div className="flex items-start">
                      <FiCheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                      <span className="text-gray-600">{warrantyPlan.coverageDetails}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowWarrantyModal(false);
                  setWarrantyPlan(null);
                  setReportForWarranty(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleWarrantyPurchaseConfirm}
                className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Purchase Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopOwnerDashboard; 