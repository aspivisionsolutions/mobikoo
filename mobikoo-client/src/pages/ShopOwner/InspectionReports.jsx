import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiDownload, FiEye, FiSearch, FiArrowLeft, FiShield,FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { Typography, Button } from '@mui/material';
import { load } from '@cashfreepayments/cashfree-js'
import ResponsiveTable from '../../components/ResponsiveTable';
import InspectionReportDetails from '../../components/InspectionReportDetails';
import WarrantyActivationDialog from '../../components/WarrantyActivationDialog';
const API_URL = import.meta.env.VITE_API_URL;

const InspectionReports = () => {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activatingReport, setActivatingReport] = useState(null);
  const [shopDetails, setShopDetails] = useState(null);
  const [devicePrice, setDevicePrice] = useState('');
  const [warrantyPlan, setWarrantyPlan] = useState(null);
  const [showWarrantyModal, setShowWarrantyModal] = useState(false);
  const [warrantyPlans, setWarrantyPlans] = useState([])
  const [reportForWarranty, setReportForWarranty] = useState(null);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [showDevicePriceModal, setShowDevicePriceModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {

    const fetchReports = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/inspection/shopOwner/reports`, {
          headers: { Authorization: `${localStorage.getItem('token')}` }
        });
        setReports(response.data);
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);
  useEffect(() => {

    const fetchShopDetails = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/user/shop-owner`, {
          headers: { Authorization: `${localStorage.getItem('token')}` }
        });
        console.log(response.data)
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

    fetchShopDetails();
  }, []);
  const fetchWarrantyPlans = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/warranty/plans`, {
        headers: { Authorization: `${localStorage.getItem('token')}` }
      });
      // console.log(response.data.data)
      setWarrantyPlans(response.data.data)
    } catch (error) {
      console.error('Error fetching warranty plans:', error);
      // toast.error('Failed to fetch warranty plans');
    }
  }
  useEffect(() => {
    fetchWarrantyPlans()
  })
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
      mode: "production", // Set "production" for production mode
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
        if (res.paymentDetails) {
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
  const isShopDetailsComplete = () => {
    return shopDetails &&
      shopDetails.shopName &&
      shopDetails.mobileNumber &&
      shopDetails.address;
  };
  if (!isShopDetailsComplete()) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <Typography variant="h5" component="div" gutterBottom>
          Please complete your shop profile to view invoices.
        </Typography>
        <Typography variant="body1" component="div" gutterBottom>
          Go to your profile settings to complete the missing information.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/shop-owner/profile')}>Go to Profile</Button> {/* Added button */}
      </div>
    );
  }
  const handlePurchaseWarranty = (report) => {
    setReportForWarranty(report);
    setShowDevicePriceModal(true);
  };
  // Filter reports based on search term
  const filteredReports = reports.filter(report =>
    report.imeiNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.deviceModel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownload = async (reportId) => {

    let tempReport = reports.find(report => report._id === reportId);
    print(tempReport);

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
      console.error('Error downloading report:', error);
    }
  };

  const handleView = (report) => {
    setSelectedReport(report);
  };

  const handleBack = () => {
    setSelectedReport(null);
  };

  const handleActivateWarranty = (report) => {
    setActivatingReport(report);
    setDialogOpen(true);
  };

  const handleSubmitActivation = async (formData) => {
    try {
      await axios.post(`${API_URL}/api/warranty/activate-warranty`, {
        deviceModel: activatingReport.deviceModel,
        imeiNumber: activatingReport.imeiNumber,
        grade: activatingReport.grade,
        inspectionReportId: activatingReport._id,
        customerName: formData.customerName,
        customerPhoneNumber: formData.mobileNumber,
        customerAdhaarNumber: formData.aadharNumber,
        customerEmailId: formData.email || undefined
      }, {
        headers: { Authorization: `${localStorage.getItem('token')}` }
      });

      // Update the report status in the local state
      setReports(reports.map(report =>
        report._id === activatingReport._id
          ? { ...report, warrantyStatus: 'processing' }
          : report
      ));

      // Close the dialog
      setDialogOpen(false);
      setActivatingReport(null);
    } catch (error) {
      console.error('Error activating warranty:', error);
      throw error; // Re-throw to be caught by the dialog component
    }
  };

  const headers = [
    { key: 'deviceModel', label: 'Device Model' },
    { key: 'imeiNumber', label: 'IMEI Number' },
    { key: 'grade', label: 'Grade' },
    { key: 'actions', label: 'Actions' }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (selectedReport) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex items-center">
            <button
              onClick={handleBack}
              className="mr-4 text-gray-500 hover:text-gray-700"
            >
              <FiArrowLeft className="h-5 w-5" />
            </button>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Inspection Report Details
            </h3>
          </div>
        </div>
        <div className="p-6">
          <InspectionReportDetails report={selectedReport} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Inspection Reports
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          View and download your inspection reports
        </p>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b">
        <div className="max-w-md mx-auto sm:mx-0 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white 
                     placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 
                     focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search by Device Model or IMEI Number"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="p-4">
        {filteredReports.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {reports.length === 0 ? "No inspection reports available" : "No matching reports found"}
          </div>
        ) : (
          <ResponsiveTable
            headers={headers}
            data={filteredReports}
            renderRow={(report, index, viewType) => {
              if (viewType === 'desktop') {
                return (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.deviceModel}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.imeiNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${report.grade === 'A' ? 'bg-green-100 text-green-800' :
                          report.grade === 'B' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'}`}
                      >
                        Grade {report.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-4">
                        <button
                          onClick={() => handleView(report)}
                          className="px-3 py-1.5 text-blue-600 hover:text-blue-900 flex items-center border border-blue-600 rounded-md hover:bg-blue-50 cursor-pointer"
                        >
                          <FiEye className="h-5 w-5 mr-1" />
                          View
                        </button>
                        <button
                          onClick={() => handleDownload(report._id)}
                          className="px-3 py-1.5 text-green-600 hover:text-green-900 flex items-center border border-green-600 rounded-md hover:bg-green-50 cursor-pointer"
                        >
                          <FiDownload className="h-5 w-5 mr-1" />
                          Download
                        </button>
                        {report.warrantyStatus === 'purchased' ? (
                          <button
                            onClick={() => handleActivateWarranty(report)}
                            className="px-3 py-1.5 text-indigo-600 hover:text-indigo-900 flex items-center border border-indigo-600 rounded-md hover:bg-indigo-50 cursor-pointer"
                          >
                            <FiShield className="h-5 w-5 mr-1" />
                            Activate Warranty
                          </button>
                        ) : report.warrantyStatus === 'activated' ? (
                          <span className="px-3 py-1.5 text-blue-600 flex items-center border border-blue-600 rounded-md bg-blue-50">
                            <FiShield className="h-5 w-5 mr-1" />
                            Activated
                          </span>
                        ) :
                          report.warrantyStatus === 'processing' ? (
                            <span className="px-3 py-1.5 text-yellow-600 flex items-center border border-yellow-600 rounded-md bg-yellow-50">
                              <FiShield className="h-5 w-5 mr-1" />
                              Processing
                            </span>
                          ) : (
                            <button
                              onClick={() => handlePurchaseWarranty(report)}
                              className="px-3 py-1.5 text-purple-600 hover:text-purple-900 flex items-center border border-purple-600 rounded-md hover:bg-purple-50 cursor-pointer"
                            >
                              <FiShield className="h-5 w-5 mr-1" />
                              Purchase Warranty
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                );
              } else {
                return (
                  <div key={index} className="bg-white rounded-lg shadow-sm p-4 mb-4">
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500">Device Model:</span>
                        <span className="text-sm text-gray-900">{report.deviceModel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500">IMEI Number:</span>
                        <span className="text-sm text-gray-900">{report.imeiNumber}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500">Grade:</span>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${report.grade === 'A' ? 'bg-green-100 text-green-800' :
                            report.grade === 'B' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'}`}
                        >
                          Grade {report.grade}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-3">
                      <button
                        onClick={() => handleView(report)}
                        className="flex items-center justify-center w-full px-4 py-2 text-sm text-blue-600 hover:text-blue-900 border border-blue-600 rounded-md hover:bg-blue-50 cursor-pointer"
                      >
                        <FiEye className="h-4 w-4 mr-2" />
                        View Report
                      </button>
                      <button
                        onClick={() => handleDownload(report._id)}
                        className="flex items-center justify-center w-full px-4 py-2 text-sm text-green-600 hover:text-green-900 border border-green-600 rounded-md hover:bg-green-50 cursor-pointer"
                      >
                        <FiDownload className="h-4 w-4 mr-2" />
                        Download Report
                      </button>
                      {report.warrantyStatus === 'purchased' ? (
                        <button
                          onClick={() => handleActivateWarranty(report)}
                          className="flex items-center justify-center w-full px-4 py-2 text-sm text-indigo-600 hover:text-indigo-900 border border-indigo-600 rounded-md hover:bg-indigo-50 cursor-pointer"
                        >
                          <FiShield className="h-4 w-4 mr-2" />
                          Activate Warranty
                        </button>
                      ) : report.warrantyStatus === 'in_review' ? (
                        <div className="flex items-center justify-center w-full px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-md bg-blue-50">
                          <FiShield className="h-4 w-4 mr-2" />
                          In Review
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-full px-4 py-2 text-sm text-red-600 border border-red-600 rounded-md bg-red-50">
                          <FiShield className="h-4 w-4 mr-2" />
                          Not Purchased
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
            }}
          />
        )}
      </div>

      {/* Warranty Activation Dialog */}
      {activatingReport && (
        <WarrantyActivationDialog
          isOpen={dialogOpen}
          onClose={() => {
            setDialogOpen(false);
            setActivatingReport(null);
          }}
          onSubmit={handleSubmitActivation}
          productId={activatingReport._id}
        />
      )}
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

export default InspectionReports;