import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiSearch, FiDownload, FiEye, FiShield, FiX, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-toastify'; // Ensure you have toast notifications set up

const PhoneReports = ({ standalone = false }) => {
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [phoneChecker, setPhoneChecker] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filteredReports, setFilteredReports] = useState([]);

  const [warrantyPlans, setWarrantyPlans] = useState([])
  const [reportToView, setReportToView] = useState(null);
  const [showWarrantyModal, setShowWarrantyModal] = useState(false);
  const [warrantyPlan, setWarrantyPlan] = useState(null);
  const [reportForWarranty, setReportForWarranty] = useState(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedReports, setSelectedReports] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    fetchReports();
    fetchWarrantyPlans()
  }, []);

  useEffect(()=>{
    calculateTotalAmount();
  },[selectedReports])

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/inspection/phoneChecker/reports', {
        headers: {
          Authorization: `${localStorage.getItem('token')}`
        }
      });
      // console.log(response.data);
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
      const response = await axios.get(`http://localhost:5000/api/inspection/reports/${reportId}/download`, {
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

  const fetchWarrantyPlans = async () =>{
    try{
      const response = await axios.get('http://localhost:5000/api/warranty/plans', {
        headers: { Authorization: `${localStorage.getItem('token')}` }
      });
      // console.log(response.data.data)
      setWarrantyPlans(response.data.data)
    }catch(error){
      console.error('Error fetching warranty plans:', error);
      toast.error('Failed to fetch warranty plans');
    }
  }

  const handlePurchaseWarranty = async (report) => {
    try {

      let plan = null;
      if (report.grade === 'A') {
        plan = warrantyPlans[0]; // Basic Protection Plan
      } else if (report.grade === 'B') {
        plan = warrantyPlans[1]; // Premium Protection Plan
      } else if (report.grade === 'C') {
        plan = warrantyPlans[2]; // Ultimate Protection Plan
      }

      setWarrantyPlan(plan);
      setReportForWarranty(report);
      setShowWarrantyModal(true);
    } catch (error) {
      console.error('Error purchasing warranty plan:', error);
      toast.error('Failed to purchase warranty plan');
    }
  };

  const handleWarrantyPurchaseConfirm = async () => {
    try {
      // Create order with Razorpay
      const orderResponse = await axios.post('http://localhost:5000/api/payment/create-order', {
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
          await axios.post(`http://localhost:5000/api/payment/warranty/purchase`, {
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
      let plan = null;
      if (report.grade === 'A') {
        plan = warrantyPlans[0]; // Basic Protection Plan
      } else if (report.grade === 'B') {
        plan = warrantyPlans[1]; // Premium Protection Plan
      } else if (report.grade === 'C') {
        plan = warrantyPlans[2]; // Ultimate Protection Plan
      }
      return report.selected ? sum + plan.price : sum;
    }, 0);
    setTotalAmount(total);
  };

  const handlePurchaseBulkWarranty = async () => {
    const selectedIds = selectedReports.filter(report => report.selected).map(report => report._id);
    if (selectedIds.length === 0) {
      toast.error('No reports selected for warranty purchase');
      return;
    }

    const purchaseDetails = selectedReports
        .filter(report => report.selected)
        .map(report => {
            let planId = null;
            if (report.grade === 'A') {
                planId = warrantyPlans[0]._id; // Basic Protection Plan
            } else if (report.grade === 'B') {
                planId = warrantyPlans[1]._id; // Premium Protection Plan
            } else if (report.grade === 'C') {
                planId = warrantyPlans[2]._id; // Ultimate Protection Plan
            }
            return { reportId: report._id, planId };
        });

    try {
      const orderResponse = await axios.post('http://localhost:5000/api/payment/create-order', {
        amount: totalAmount, // Amount in INR
        receipt: 'bulk_warranty_purchase',
        notes: { purchaseDetails },
      });

      const options = {
        key: "rzp_test_wrWBdn4mFAZoo8",
        amount: orderResponse.data.amount,
        currency: orderResponse.data.currency,
        name: 'Bulk Warranty Purchase',
        description: 'Purchase of multiple warranty plans',
        order_id: orderResponse.data.id,
        handler: async function (response) {
          await axios.post(`http://localhost:5000/api/payment/warranty/bulk-purchase`, {
            purchaseDetails,
            razorpayPaymentId: response.razorpay_payment_id
          }, {
            headers: { Authorization: `${localStorage.getItem('token')}` }
          });

          toast.success('Bulk warranty purchased successfully');
          setShowBulkModal(false);
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
      console.error('Error purchasing bulk warranty:', error);
      toast.error(error.response?.data?.message || 'Failed to purchase bulk warranty');
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
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-lg bg-white">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Select Reports for Warranty Purchase</h2>
            <div className="max-h-60 overflow-y-auto">
              {selectedReports.map(report => (
                <div key={report._id} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    checked={report.selected}
                    onChange={() => {
                      handleSelectReport(report._id);
                    }}
                  />
                  <label className="ml-2">
                    {report.deviceModel} - {report.imeiNumber} (Grade: {report.grade})
                  </label>
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
                Shop Name
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
                    {report.shopName}
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

export default PhoneReports; 