import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FiSearch, FiTrash2, FiDownload, FiEye, FiShield, FiX, FiCheckCircle, FiArrowLeft } from 'react-icons/fi';
import { toast } from 'react-toastify'; // Ensure you have toast notifications set up
import InspectionReportDetails from '../../components/InspectionReportDetails';
import { load } from '@cashfreepayments/cashfree-js'
import { useNavigate } from 'react-router-dom';
import { Typography, Button } from '@mui/material';
const API_URL = import.meta.env.VITE_API_URL;


const PhoneReports = ({ standalone = false }) => {
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [phoneChecker, setPhoneChecker] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filteredReports, setFilteredReports] = useState([]);
  const navigate = useNavigate();
  const [warrantyPlans, setWarrantyPlans] = useState([])
  const [reportToView, setReportToView] = useState(null);
  const [showWarrantyModal, setShowWarrantyModal] = useState(false);
  const [warrantyPlan, setWarrantyPlan] = useState(null);
  const [reportForWarranty, setReportForWarranty] = useState(null);
  const [showDevicePriceModal, setShowDevicePriceModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedReports, setSelectedReports] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [devicePrice, setDevicePrice] = useState('');
  const [availablePlans, setAvailablePlans] = useState([]);
  const [devicePrices, setDevicePrices] = useState({});
  const [profile, setProfile] = useState({})
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/user/phone-checker`, {
          headers: {
            Authorization: `${localStorage.getItem('token')}`
          }
        });
        const profile = {
          phoneNumber: response.data.phoneChecker.phoneNumber,
          area: response.data.phoneChecker.area,
        }
        setProfile(profile)
      } catch (error) {
        console.log({ error: error.response.data.message })
      }
    }
    getProfile()
  }, []);
  const isProfileComplete = profile.phoneNumber && profile.area;
  useEffect(() => {
    calculateTotalAmount();
  }, [selectedReports, devicePrices, availablePlans]);
  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/inspection/phoneChecker/reports`, {
        headers: {
          Authorization: `${localStorage.getItem('token')}`
        }
      });
      setReports(response.data);
      setFilteredReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (searchTerm === '') {
      setFilteredReports(reports); // Show all reports if search term is empty
    } else {
      const filtered = reports.filter(report =>
        report.deviceModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.imeiNumber.includes(searchTerm)
      );
      setFilteredReports(filtered);
    }
  }, [reports, searchTerm]);

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

  const handleView = (report) => {
    setReportToView(report);
  };

  const handleBack = () => {
    setReportToView(null);
  };

  const fetchWarrantyPlans = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/warranty/plans`, {
        headers: { Authorization: `${localStorage.getItem('token')}` }
      });
      // console.log(response.data.data)
      setWarrantyPlans(response.data.data)
    } catch (error) {
      console.error('Error fetching warranty plans:', error);
      toast.error('Failed to fetch warranty plans');
    }
  }

  useEffect(() => {
    fetchReports();
    fetchWarrantyPlans()
  }, []);

  const handlePurchaseWarranty = (report) => {
    setReportForWarranty(report);
    setShowDevicePriceModal(true);
  };

  const handleShowWarrantyPlans = () => {
    // Find the smallest lower_limit in the warrantyPlans
    const smallestLowerLimit = Math.min(...warrantyPlans.map(plan => plan.lower_limit));

    // Check if the devicePrice is less than the smallest lower_limit
    if (devicePrice < smallestLowerLimit) {
      alert('No plans available for the entered price.');
      setAvailablePlans([]);
      // setShowDevicePriceModal(false);
      return;
    }

    // Filter plans based on the devicePrice and other conditions
    const plans = warrantyPlans.filter(plan =>
      plan.lower_limit <= devicePrice &&
      (plan.upper_limit === null || plan.upper_limit >= devicePrice) &&
      plan.grade === reportForWarranty.grade
    );

    setAvailablePlans(plans);
    setShowDevicePriceModal(false);
    setShowWarrantyModal(true);
  };

  let cashfree;

  let insitialzeSDK = async function () {

    cashfree = await load({
      mode: "sandbox", // Set "production" for production mode
    })
  }

  insitialzeSDK()

  const [orderId, setOrderId] = useState("")

  const getSessionId = async (plan) => {
    try {
      let res = await axios.post(`${API_URL}/api/payment/create-order`, {
        amount: plan.price,
        receipt: reportForWarranty._id,
        notes: {},
      });

      if (res.data && res.data.payment_session_id) {
        console.log('Full response:', res.data);

        // Return an object with both session ID and order ID
        return {
          sessionId: res.data.payment_session_id,
          orderId: res.data.order_id
        };
      }
    } catch (error) {
      console.error('Error getting session ID:', error);
      throw error;
    }
  };

  const handleWarrantyPurchaseConfirm = async (plan) => {
    try {
      // Destructure sessionId and orderId from the returned object
      const { sessionId, orderId } = await getSessionId(plan);

      let checkoutOptions = {
        paymentSessionId: sessionId,
        redirectTarget: "_modal",
      };

      cashfree.checkout(checkoutOptions).then((res) => {
        console.log("Payment initialized");

        // Pass both plan and orderId to verifyPayment
        if(res.paymentDetails){
          verifyPayment(plan, orderId);
        }
      }).catch((err) => {
        console.error("Checkout error:", err);
        toast.error('Payment initialization failed.');
      });
    } catch (error) {
      console.error('Error purchasing warranty:', error);
      toast.error(error.response?.data?.message || 'Failed to purchase warranty');
    }
  };

  const verifyPayment = async (plan, orderId) => {
    try {
      let res = await axios.post(`${API_URL}/api/payment/payment/verify`, {
        reportId: reportForWarranty._id,
        deviceModel: reportForWarranty.deviceModel,
        imeiNumber: reportForWarranty.imeiNumber,
        grade: reportForWarranty.grade,
        planId: plan._id,
        orderId: orderId
      });

      if (res && res.data) {
        toast.success('Warranty purchased successfully');
        setShowWarrantyModal(false);
        setWarrantyPlan(null);
        setReportForWarranty(null);
        fetchReports();
      }
    } catch (error) {
      toast.error('Failed to purchase warranty');
      console.error('Verification error:', error);
    }
  };


  const handleBulkWarrantyPurchase = () => {
    const unpurchasedReports = reports.filter(report => report.warrantyStatus === 'not-purchased');
    setSelectedReports(unpurchasedReports.map(report => ({ ...report, selected: false })));
    setShowBulkModal(true);
  };
  // console.log(selectedReports)
  const handleSelectReport = (reportId) => {
    setSelectedReports(prev =>
      prev.map(report =>
        report._id === reportId ? { ...report, selected: !report.selected } : report
      )
    );    // console.log(selectedReports)
  };

  const calculateTotalAmount = () => {
    const total = selectedReports.reduce((sum, report) => {
      const plans = availablePlans[report._id];
      const selectedPlan = plans ? plans.find(plan => plan.selected) : null;
      return report.selected && selectedPlan ? sum + selectedPlan.price : sum;
    }, 0);
    setTotalAmount(total);
  };

  const handleDevicePriceChange = (reportId, price) => {
    setDevicePrices(prev => ({ ...prev, [reportId]: price }));
  };

  const handleShowPlansForReport = (reportId) => {
    const price = devicePrices[reportId];
    const report = selectedReports.find(report => report._id === reportId);

    // Find the smallest lower_limit in the warrantyPlans
    const smallestLowerLimit = Math.min(...warrantyPlans.map(plan => plan.lower_limit));

    // Check if the price is less than the smallest lower_limit
    if (price < smallestLowerLimit) {
      toast.error('No plans available for the entered price.');
      setAvailablePlans(prev => ({ ...prev, [reportId]: [] }));
      return;
    }

    const plans = warrantyPlans.filter(plan =>
      plan.lower_limit <= price &&
      (plan.upper_limit === null || plan.upper_limit >= price) &&
      plan.grade === report.grade
    );

    setAvailablePlans(prev => ({ ...prev, [reportId]: plans }));
  };

  const handleSelectPlanForReport = (reportId, planId) => {
    setAvailablePlans(prev => ({
      ...prev,
      [reportId]: prev[reportId].map(plan =>
        plan._id === planId ? { ...plan, selected: true } : { ...plan, selected: false }
      )
    }));
  };

  const getSessionIdForBulkPurchase = async (totalAmount) => {
    try {
      let res = await axios.post(`${API_URL}/api/payment/create-order`, {
        amount: totalAmount,
        receipt: 'bulk_warranty_purchase',
        notes: {},
      })

      if (res.data && res.data.payment_session_id) {

        console.log(res.data)
        setOrderId(res.data.order_id)
        return res.data.payment_session_id
      }


    } catch (error) {
      console.log(error)
    }
  }

  const verifyPaymentForBulkPurchase = async (purchaseDetails, orderId) => {
    try {

      let res = await axios.post(`${API_URL}/api/payment/warranty/bulk-purchase/verify`, {
        purchaseDetails: purchaseDetails,
        orderId: orderId
      }, {
        headers: { Authorization: `${localStorage.getItem('token')}` }
      })

      if (res && res.data) {
        toast.success('Bulk warranty purchased successfully');
        setShowBulkModal(false);
        fetchReports();
      }

    } catch (error) {
      toast.error('Failed to purchase bulk warranty');
      console.log(error)
    }
  }

  const handlePurchaseBulkWarranty = async () => {
    const selectedIds = selectedReports.filter(report => report.selected).map(report => report._id);
    if (selectedIds.length === 0) {
      toast.error('No reports selected for warranty purchase');
      return;
    }

    const purchaseDetails = selectedReports
      .filter(report => report.selected)
      .map(report => {
        const plans = availablePlans[report._id];
        const selectedPlan = plans ? plans.find(plan => plan.selected) : null;
        return { reportId: report._id, planId: selectedPlan._id };
      });

    try {

      let sessionId = await getSessionIdForBulkPurchase(totalAmount)
      let checkoutOptions = {
        paymentSessionId: sessionId,
        redirectTarget: "_modal",
      }

      cashfree.checkout(checkoutOptions).then((res) => {
        console.log("payment initialized")

        if(res.paymentDetails){
          verifyPaymentForBulkPurchase(purchaseDetails, orderId)
        }
      })
    } catch (error) {
      console.error('Error purchasing bulk warranty:', error);
      toast.error(error.response?.data?.message || 'Failed to purchase bulk warranty');
    }
  };
  const handleDeleteReport = async () => {
    if (!reportToDelete) return;

    try {
      await axios.delete(`${API_URL}/api/inspection/reports/${reportToDelete._id}`, {
        headers: {
          Authorization: `${localStorage.getItem('token')}`
        }
      });

      toast.success('Report deleted successfully');
      fetchReports(); // Refresh the reports list
      setDeleteConfirmOpen(false);
      setReportToDelete(null);
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Failed to delete report');
    }
  };

  const confirmDeleteReport = (report) => {
    setReportToDelete(report);
    setDeleteConfirmOpen(true);
  };
  const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, report }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        <div className="relative bg-white rounded-lg shadow-xl transform transition-all sm:max-w-lg w-full max-w-[95%]">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <FiTrash2 className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900 truncate">
                  Delete Inspection Report
                </h3>
                <div className="mt-2">
                  {report.warrantyStatus === "purchased" ? (
                    <p className="text-sm text-red-500">
                      This report cannot be deleted as it has a purchased warranty.
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500 whitespace-normal break-words">
                      Are you sure you want to delete the inspection report for
                      <span className="font-semibold">
                        {report.deviceModel ?
                          (report.deviceModel.length > 30
                            ? `${report.deviceModel.substring(0, 30)}...`
                            : report.deviceModel)
                          : 'this device'
                        }
                      </span>?
                      This action cannot be undone.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            {report.warrantyStatus === "purchased" ? (
              <button
                type="button"
                onClick={onClose}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 
              bg-gray-600 text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm"
              >
                Close
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onConfirm}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 
                bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 
                focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm 
                px-4 py-2 bg-white text-base font-medium text-gray-700 hover:text-gray-500 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>

    );
  };

  if (!isProfileComplete) {
    return (
      <div className="flex flex-col items-center justify-center mt-10">
        <Typography variant="h5">Complete Your Shop Profile</Typography>
        <Typography variant="body1" className="mt-2">
          Please update your profile to access inspection requests.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/phone-checker/profile')} className="mt-4">
          Update Profile
        </Button>
      </div>
    );
  }

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
    <div className={`h-full flex flex-col ${standalone ? 'ml-64' : ''}`}>
      {/* Search Bar */}
      <div className="p-4 border-b flex justify-between items-center">
        <div className="w-[70%] relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white 
                     placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 
                     focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search by Phone Model or IMEI"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={handleBulkWarrantyPurchase}
          className="ml-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          Bulk Purchase Warranty
        </button>
      </div>

      {/* Bulk Purchase Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-lg bg-white">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Select Reports for Warranty Purchase</h2>
            <div className="max-h-60 overflow-y-auto">
              {selectedReports.map(report => (
                <div key={report._id} className="mb-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={report.selected}
                      onChange={() => handleSelectReport(report._id)}
                      className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      {report.deviceModel} - {report.imeiNumber} (Grade: {report.grade})
                    </label>
                  </div>
                  {report.selected && (
                    <div className="mt-2 ml-6">
                      <input
                        type="number"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white 
                    placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 
                    focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Enter device price"
                        value={devicePrices[report._id] || ''}
                        onChange={(e) => handleDevicePriceChange(report._id, e.target.value)}
                      />
                      <button
                        onClick={() => handleShowPlansForReport(report._id)}
                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                      >
                        Show Plans
                      </button>
                      {availablePlans[report._id] && availablePlans[report._id].length > 0 && (
                        <div className="mt-2">
                          {availablePlans[report._id].some(plan => plan.selected) ? (
                            availablePlans[report._id].filter(plan => plan.selected).map(plan => (
                              <div key={plan._id} className="bg-white rounded-lg p-4 border border-gray-300 mb-2">
                                <div className="flex justify-between items-center">
                                  <div className="text-right">
                                    <div className="text-2xl font-bold text-blue-600">₹{plan.price}</div>
                                    <div className="text-sm text-gray-500">{plan.warranty_months} Months</div>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            availablePlans[report._id].map(plan => (
                              <div key={plan._id} className="bg-white rounded-lg p-4 border border-gray-300 mb-2">
                                <div className="flex justify-between items-center">
                                  <div className="text-right">
                                    <div className="text-2xl font-bold text-blue-600">₹{plan.price}</div>
                                    <div className="text-sm text-gray-500">{plan.warranty_months} Months</div>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleSelectPlanForReport(report._id, plan._id)}
                                  className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                                >
                                  Select Plan
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold">Total Amount: ₹{totalAmount}</h3>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePurchaseBulkWarranty}
                className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Purchase Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reports Table */}
      <div className="flex-1 overflow-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Shop Owner ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone Model
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                IMEI
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Grade
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                  Loading reports...
                </td>
              </tr>
            ) : filteredReports.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                  No reports found
                </td>
              </tr>
            ) : (
              filteredReports.map((report) => (
                <tr key={report.IMEI} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {report.shopOwnerId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {report.deviceModel}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {report.imeiNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${report.grade === 'A' ? 'bg-green-100 text-green-800' :
                        report.grade === 'B' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'}`}>
                      {report.grade}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(report.inspectionDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleDownloadReport(report._id)}
                        className="px-3 py-1.5 text-blue-600 hover:text-blue-900 flex items-center border border-blue-600 rounded-md hover:bg-blue-50 cursor-pointer"
                      >
                        <FiDownload className="h-5 w-5 mr-1" />
                        Download
                      </button>
                      <button
                        onClick={() => handleView(report)}
                        className="px-3 py-1.5 text-green-600 hover:text-green-900 flex items-center border border-green-600 rounded-md hover:bg-green-50 cursor-pointer"
                      >
                        <FiEye className="h-5 w-5 mr-1" />
                        View Report
                      </button>
                      <DeleteConfirmationModal
                        isOpen={deleteConfirmOpen}
                        onClose={() => {
                          setDeleteConfirmOpen(false);
                          setReportToDelete(null);
                        }}
                        onConfirm={handleDeleteReport}
                        report={reportToDelete || {}}
                      />
                      {
                        report.warrantyStatus === 'not-purchased' && (
                          <button
                            onClick={() => confirmDeleteReport(report)}
                            className="px-3 py-1.5 text-red-600 hover:text-red-900 flex items-center border border-red-600 rounded-md hover:bg-red-50 cursor-pointer"

                          >
                            <FiTrash2 className="h-5 w-5 mr-1" />
                            Delete
                          </button>)
                      }

                      {report.warrantyStatus === 'not-purchased' ? (
                        <button
                          onClick={() => handlePurchaseWarranty(report)}
                          className="px-3 py-1.5 text-purple-600 hover:text-purple-900 flex items-center border border-purple-600 rounded-md hover:bg-purple-50 cursor-pointer"
                        >
                          <FiShield className="h-5 w-5 mr-1" />
                          Purchase Warranty
                        </button>
                      ) : (
                        <span className="px-3 py-1.5 text-green-600 flex items-center border border-green-600 rounded-md bg-green-50">
                          <FiShield className="h-5 w-5 mr-1" />
                          Warranty Purchased
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showDevicePriceModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-lg bg-white">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Enter Device Price</h2>
            <input
              type="number"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white 
                 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 
                 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter device price"
              value={devicePrice}
              onChange={(e) => setDevicePrice(e.target.value)}
            />
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowDevicePriceModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleShowWarrantyPlans}
                className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Warranty Plans Modal */}
      {showWarrantyModal && availablePlans.length > 0 && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-lg bg-white">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Select Warranty Plan</h2>
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

            <div className="space-y-4">
              {availablePlans.map(plan => (
                <div key={plan._id} className="bg-white rounded-lg p-4 border border-gray-300">
                  <div className="flex justify-between items-center">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">₹{plan.price}</div>
                      <div className="text-sm text-gray-500">{plan.warranty_months} Months</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setWarrantyPlan(() => { console.log(plan, "selecteing plan"); return plan });
                      setTimeout(() => {
                        handleWarrantyPurchaseConfirm(plan);
                      }, 100);
                    }}
                    className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    Select Plan
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PhoneReports; 