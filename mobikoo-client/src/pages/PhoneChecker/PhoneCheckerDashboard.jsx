import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { FiSearch, FiDownload, FiTrendingUp, FiPhone, FiCheckCircle, FiEye, FiArrowLeft, FiShield, FiX,FiAlertCircle } from 'react-icons/fi';
import ClaimRequests from './ClaimRequests';
import InspectionRequests from './InspectionRequests';
import { InspectionReportDetails } from '../../components/InspectionReportDetails';
import SalesGraph from './SalesGraph';
const API_URL = import.meta.env.VITE_API_URL;

const PhoneCheckerDashboard = () => {
  const [shopOwners, setShopOwners] = useState([]);
  const [activeTab, setActiveTab] = useState('inspections');
  const [inspectionRequests, setInspectionRequests] = useState([]);
  const [inspectionReports, setInspectionReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [salesStats, setSalesStats] = useState({
    totalReports: 0,
    totalInspectionRequests: 0,
    totalCompletedRequests: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showInspectionForm, setShowInspectionForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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
  const [reportToView, setReportToView] = useState(null);
  const [showWarrantyModal, setShowWarrantyModal] = useState(false);
  const [warrantyPlan, setWarrantyPlan] = useState(null);
  const [reportForWarranty, setReportForWarranty] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Add state for submission status
  const [profile, setProfile] = useState({})
  
    useEffect(() => {
      const getProfile = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/user/phone-checker`, {
        headers: {
          Authorization: `${localStorage.getItem('token')}`
        }
      });
      const profile = {
        phoneNumber : response.data.phoneChecker.phoneNumber,
        area: response.data.phoneChecker.area,
      }
      setProfile(profile)
      } catch (error) {
        console.log({error: error.response.data.message})
      }}
      getProfile()
    }, []);
    const isProfileComplete = profile.phoneNumber && profile.area;
  useEffect(() => {
    fetchRequests();
    fetchSalesStats();
    if (activeTab === 'reports') {
      fetchReports();
    }
  }, [activeTab]);

  const fetchShopOwners = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/user/shop-owners`, {
        headers: {
          Authorization: `${localStorage.getItem('token')}`
        }
      });
      console.log(response.data)
      setShopOwners(response.data);
    } catch (error) {
      toast.error('Failed to fetch shop owners');
      console.error('Error fetching shop owners:', error);
    }
  }

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      // Fetch both types of requests
      const [inspectionsResponse] = await Promise.all([
        axios.get(`${API_URL}/api/inspection/phoneChecker`, {
          headers: {
            Authorization: `${localStorage.getItem('token')}`
          }
        }
        )
      ]);

      setInspectionRequests(inspectionsResponse.data);
    } catch (error) {
      toast.error('Failed to fetch requests');
      console.error('Error fetching requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/inspection/phoneChecker/reports`, {
        headers: {
          Authorization: `${localStorage.getItem('token')}`
        }
      });
      setInspectionReports(response.data);
      setFilteredReports(response.data);
    } catch (error) {
      toast.error('Failed to fetch inspection reports');
      console.error('Error fetching reports:', error);
    }
  };

  const fetchSalesStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/stats/phone-checker`, {
        headers: {
          Authorization: `${localStorage.getItem('token')}`
        }
      });
      setSalesStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching sales stats:', error);
    }
  };

  const handleStatusUpdate = async (requestId, type, newStatus) => {
    try {
      const endpoint = `${API_URL}/api/inspections/${requestId}/status`;

      await axios.patch(endpoint, { status: newStatus });
      toast.success(`${type} status updated successfully`);
      fetchRequests(); // Refresh the data
    } catch (error) {
      toast.error('Failed to update status');
      console.error('Error updating status:', error);
    }
  };

  const handleInspectClick = () => {
    setShowInspectionForm(true);
    fetchShopOwners();
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.imeiNumber) {
      toast.error('IMEI Number is mandatory');
      return;
    }
    if (!formData.digitalSignature) {
      toast.error('Please confirm the inspection with digital signature');
      return;
    }

    setIsSubmitting(true); // Set submission status to true

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
    console.log(formData);
    try {
      await axios.post(`${API_URL}/api/inspection/submitReport`, formDataToSend, {
        headers: {
          Authorization: `${localStorage.getItem('token')}`
        },
      });

      toast.success('Inspection submitted successfully');
      handleFormClose();
      fetchRequests();
    } catch (error) {
      toast.error(error.response.data.message || "Failed to submit inspection");
      console.error('Error submitting inspection:', error);
    } finally {
      setIsSubmitting(false); // Reset submission status
    }
  };

  const handleDownloadReport = async (reportId) => {
    try {
      const response = await axios.get(`${API_URL}/api/inspection/reports/${reportId}/download`, {
        responseType: 'blob',
        headers: {
          Authorization: `${localStorage.getItem('token')}`
        }
      });



      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `inspection-report-${reportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Failed to download report');
      console.error('Error downloading report:', error);
    }
  };

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredReports(inspectionReports); // Show all reports if search term is empty
    } else {
      const filtered = inspectionReports.filter(report =>
        report.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.imeiNumber.includes(searchTerm) ||
        report.deviceModel.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredReports(filtered);
    }
  }, [inspectionReports, searchTerm]);

  const renderStats = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600">
            <FiTrendingUp className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Total Reports</p>
            <p className="text-lg font-semibold text-gray-900">{salesStats.totalReports}</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-green-100 text-green-600">
            <FiPhone className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Total Inspections</p>
            <p className="text-lg font-semibold text-gray-900">{salesStats.totalInspectionRequests}</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
            <FiCheckCircle className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Completed Inspections</p>
            <p className="text-lg font-semibold text-gray-900">{salesStats.totalCompletedRequests}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const handleView = (report) => {
    setReportToView(report);
  };

  const handleBack = () => {
    setReportToView(null);
  };

  const handlePurchaseWarranty = async (report) => {
    try {
      const response = await axios.get(`${API_URL}/api/warranty/plans`, {
        headers: { Authorization: `${localStorage.getItem('token')}` }
      });

      let plan = null;
      if (report.grade === 'A') {
        plan = response.data.data[0]; // Basic Protection Plan
      } else if (report.grade === 'B') {
        plan = response.data.data[1]; // Premium Protection Plan
      } else if (report.grade === 'C') {
        plan = response.data.data[2]; // Ultimate Protection Plan
      }

      setWarrantyPlan(plan);
      setReportForWarranty(report);
      setShowWarrantyModal(true);
    } catch (error) {
      console.error('Error fetching warranty plans:', error);
      toast.error('Failed to fetch warranty plans');
    }
  };

  const handleWarrantyPurchaseConfirm = async () => {
    try {
      // Create order with Razorpay
      const orderResponse = await axios.post(`${API_URL}/api/payment/create-order`, {
        amount: warrantyPlan.price, // Amount in INR
        receipt: reportForWarranty._id,
        notes: {}, // Ensure this is set in your environment
      });

      const options = {
        key: "rzp_test_wrWBdn4mFAZoo8", // Updated to use the prefixed variable
        amount: orderResponse.data.amount, // Amount in paise
        currency: orderResponse.data.currency,
        name: 'Warranty Purchase',
        description: 'Purchase of warranty plan',
        order_id: orderResponse.data.id, // Order ID returned from Razorpay
        handler: async function (response) {
          // Handle successful payment
          await axios.post(`${API_URL}/api/payment/warranty/purchase`, {
            reportId: reportForWarranty._id,
            deviceModel: reportForWarranty.deviceModel,
            imeiNumber: reportForWarranty.imeiNumber,
            grade: reportForWarranty.grade,
            planId: warrantyPlan._id,
            razorpayPaymentId: response.razorpay_payment_id // Include payment ID
          }, {
            headers: { Authorization: `${localStorage.getItem('token')}` }
          });

          toast.success('Warranty purchased successfully');
          setShowWarrantyModal(false);
          setWarrantyPlan(null);
          setReportForWarranty(null);
          fetchReports();
        },
        prefill: {
          name: 'Customer Name',
          email: 'customer@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#F37254'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Error purchasing warranty:', error);
      toast.error(error.response?.data?.message || 'Failed to purchase warranty');
    }
  };

  if (reportToView) {
    return (
      <>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <button
              onClick={handleBack}
              className="mr-4 text-gray-500 hover:text-gray-700"
            >
              <FiArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">Inspection Report Details</h1>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <InspectionReportDetails report={reportToView} />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center md:my-0 my-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-10">Dashboard Overview</h1>
        {activeTab === 'inspections' && (
          <div className="relative flex mb-10"> {/* Added relative div for positioning */}
          {!isProfileComplete && (
                <div className="flex items-center text-amber-600 bg-amber-50 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm">
                  <FiAlertCircle className="mr-2 flex-shrink-0" />
                  <span>
                    Please <Link to="/phone-checker/profile" className="underline font-medium">complete your profile</Link> to create inspection requests
                  </span>
                </div>
              )}
            <button
              onClick={handleInspectClick}
              className={`w-full sm:w-auto px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center
                ${!isProfileComplete
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                }`}
              disabled={!isProfileComplete}
            >
              New Inspection
            </button>
        </div>
        )}

      </div>

      <Toaster />
      {renderStats()}
      <SalesGraph/>
      {/* Navigation Tabs */}

      {/* Content Area */}
      
      {/* Inspection Form Modal */}
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
                  <select
                    name="shopOwnerId"
                    value={formData.shopOwnerId} // Bind to shopName in formData
                    onChange={handleInputChange} // Use the new handler
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  >
                    <option value="">Select Shop</option>
                    {shopOwners.map(owner => (
                      <option key={owner._id} value={owner.shopOwnerId}>
                        {owner.shopOwnerId}
                      </option>
                    ))}
                  </select>
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
    </>
  );
};

export default PhoneCheckerDashboard;
