import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiDownload, FiEye, FiSearch, FiRefreshCw, FiArrowLeft } from 'react-icons/fi';
import { ImHammer2 } from "react-icons/im";
import { useNavigate } from 'react-router-dom';
import InspectionReportDetails from '../../components/InspectionReportDetails';
import {toast, Toaster} from 'react-hot-toast';

const PhoneInspectionTable = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [responseDebug, setResponseDebug] = useState(null); // For debugging the API response
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [reportsPerPage] = useState(10);
  const [reportToView, setReportToView] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [fineAmount, setFineAmount] = useState("");
  const [comment, setComment] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);

  const openModal = (report) => {
    console.log(report)
    setSelectedReport(report); // Store the selected report
    setShowModal(true);
  };
  const updateFineStatus = async (reportId) => {
    console.log("Updating fine status for report ID:", reportId); // Debugging log
    try {
      await axios.post(
        `http://localhost:5000/fine/${reportId}`,
        { fineStatus: "Fined" },
        { headers: { Authorization: `${localStorage.getItem("token")}` } }
      );
    } catch (error) {
      toast.error("Failed to update fine status");
      console.error("Error updating fine status:", error);
    }
  };
  const handleFine = async () => {
    if (!fineAmount) {
      alert("Please enter a fine amount!");
      return;
    }

    if (!selectedReport) {
      alert("No report selected!");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/inspection/fine", {
        fineAmount,
        comment,
        reportId: selectedReport._id,
        inspectorId: selectedReport.inspectorId,
      },{
        headers:{Authorization:`${localStorage.getItem("token")}`}
      });

      if (response.status === 200) {
        toast.success("Fine issued successfully!");
        setShowModal(false);
        setFineAmount("");
        setComment("");
        await updateFineStatus(selectedReport._id);

        // Call PATCH request to update fineStatus

        setReports((prevReports) =>
          prevReports.map((report) =>
            report._id === selectedReport._id
              ? { ...report, fineStatus: "Fined" }
              : report
          )
        );
      }
    } catch (error) {
      console.error("Error issuing fine:", error);
      alert("Failed to issue fine.");
    } finally {
      setLoading(false);
      setSelectedReport(null);
    }
  };
  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    setResponseDebug(null);
    
    try {

const response = await axios.get('http://localhost:5000/api/inspection/admin/reports', {
  headers: { Authorization: `${localStorage.getItem('token')}` }
});
      
      // Store the raw response for debugging
      setResponseDebug(JSON.stringify(response.data, null, 2));
      
      // Try different possible response structures
      if (response.data && Array.isArray(response.data.reports)) {
        setReports(response.data.reports);
      } else if (response.data && Array.isArray(response.data)) {
        setReports(response.data);
      } else if (response.data && typeof response.data === 'object') {
        // Try to extract any array from the response
        const possibleArrays = Object.values(response.data).filter(value => Array.isArray(value));
        if (possibleArrays.length > 0) {
          // Use the first array found in the response
          setReports(possibleArrays[0]);
        } else {
          // Create an array from the object if it seems like a single report
          if (response.data.id || response.data.inspectionId || response.data.deviceName) {
            setReports([response.data]);
          } else {
            setReports([]);
            setError('Could not find reports data in the API response');
          }
        }
      } else {
        setReports([]);
        setError('Received unexpected data format from server');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError(`Failed to load inspection reports: ${error.message}`);
      setResponseDebug(error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleReportDownload = async (reportId) => {
    console.log(reportId)
    try {
      const response = await axios.get(
        `http://localhost:5000/api/inspection/reports/${reportId}/download`,
        { 
          responseType: 'blob',
          headers: { Authorization: `${localStorage.getItem('token')}` }
        }
      );
      
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
  const handleSubmit = () => {
    handleFine({ fineAmount, comment }); // Pass data to parent function
    setShowModal(false); // Close modal after submitting
    setFineAmount(""); // Reset fields
    setComment("");
  };
  const handleReportView = (report) => {
    setReportToView(report);
  };

  // Filter reports (with safety checks)
  const filteredReports = reports && Array.isArray(reports) 
    ? reports.filter(report => {
        if (!report) return false;
        const device = (report.deviceModel || '').toLowerCase();
        const customer = (report.customerName || '').toLowerCase();
        const id = (report.inspectionId || '').toLowerCase();
        const status = (report.status || '').toLowerCase();
        const term = searchTerm.toLowerCase();
        const imei = (report.imeiNumber || '').toLowerCase();
        const shop = (report.shopName || '').toLowerCase();
        const inspector = (report.inspectorId.firstName + " " + report.inspectorId.lastName || '').toLowerCase();
        return device.includes(term) || customer.includes(term) || id.includes(term) || status.includes(term) || imei.includes(term) || shop.includes(term) || inspector.includes(term);
      })
    : [];

  // Pagination logic
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = filteredReports.slice(indexOfFirstReport, indexOfLastReport);
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);

  // Format date to a more readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    let bgColor = '';
    
    switch((status || '').toLowerCase()) {
      case 'activated':
        bgColor = 'bg-green-100 text-green-800';
        break;
      case 'purchased':
        bgColor = 'bg-yellow-100 text-yellow-800';
        break;
      case 'not-purchased':
        bgColor = 'bg-red-100 text-red-800';
        break;
      default:
        bgColor = 'bg-gray-100 text-gray-800';
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
        {status || 'Unknown'}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <Toaster position="top-right" />
      {/* Render InspectionReportDetails if a report is selected */}
      {reportToView ? (
        <div className="p-6">
          <div className="flex items-center mb-4">
            <button
              onClick={() => setReportToView(null)}
              className="flex items-center text-gray-500 hover:text-gray-700"
            >
              <FiArrowLeft className="h-5 w-5 mr-2" />
              Back to Reports
            </button>
          </div>
          <InspectionReportDetails report={reportToView} />
        </div>
      ) : (
        <>
          {/* Header and search */}
          <div className="px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 md:mb-0">Phone Inspection Reports</h2>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                />
                <FiSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
              <button 
                onClick={fetchReports}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <FiRefreshCw className="mr-2" />
                Refresh
              </button>
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Loading inspection reports...</p>
            </div>
          )}

          {/* Error state with debug info */}
          {error && !loading && (
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                <h3 className="text-red-800 font-medium">Error</h3>
                <p className="text-red-600">{error}</p>
              </div>
              
              {responseDebug && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">API Response (Debug):</h3>
                  <div className="bg-gray-50 p-4 rounded-md overflow-auto max-h-64">
                    <pre className="text-xs text-gray-800 whitespace-pre-wrap">{responseDebug}</pre>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    * This information can help identify the correct data structure to use
                  </p>
                </div>
              )}
              
              <button 
                onClick={fetchReports}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Mock data button (for development/testing) */}
          {error && !loading && (
            <div className="px-6 pb-4">
              <button 
                onClick={() => {
                  // Sample mock data
                  const mockData = [
                    {
                      inspectionId: "INS-10001",
                      deviceName: "iPhone 13 Pro",
                      customerName: "John Smith",
                      date: "2024-03-01",
                      shopName: "Main Street Shop",
                      status: "Completed"
                    },
                    {
                      inspectionId: "INS-10002",
                      deviceName: "Samsung Galaxy S22",
                      customerName: "Alice Johnson",
                      date: "2024-03-02",
                      shopName: "Downtown Store",
                      status: "Pending"
                    }
                  ];
                  setReports(mockData);
                  setError(null);
                }}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Load Sample Data (for testing)
              </button>
            </div>
          )}

          {/* Table */}
          {!loading && !error && (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PhoneChecker</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shop</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IMEI Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentReports.length > 0 ? (
                      currentReports.map((report, index) => (
                        <tr key={report.id || index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {report.deviceModel || 'Unknown Device'}
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {report.inspectorId ? `${report.inspectorId.firstName} ${report.inspectorId.lastName}` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(report.inspectionDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {report.shopName || report.shopId || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {report.grade || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {report.imeiNumber || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={report.warrantyStatus} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex space-x-2">
                              <button
                                className="p-1 rounded-full text-blue-600 hover:bg-blue-100"
                                title="View Report"
                                onClick={() => handleReportView(report)}
                              >
                                <FiEye size={18} />
                              </button>
                              <button
                                className="p-1 rounded-full text-green-600 hover:bg-green-100"
                                title="Download Report"
                                onClick={() => handleReportDownload(report._id)}
                              >
                                <FiDownload size={18} />
                              </button>
                              {report.fineStatus !== "Fined" && (
                                <button
                                  className="p-1 rounded-full text-red-600 hover:bg-red-100"
                                  title="Issue Fine"
                                  onClick={() => openModal(report)}
                                >
                                  <ImHammer2 size={18} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                          No inspection reports found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredReports.length > 0 && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstReport + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(indexOfLastReport, filteredReports.length)}
                    </span>{' '}
                    of <span className="font-medium">{filteredReports.length}</span> reports
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                      }`}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === totalPages || totalPages === 0
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white p-5 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-bold mb-3">Issue Fine</h2>

            {/* Fine Amount Input */}
            <input
              type="number"
              placeholder="Enter Fine Amount"
              className="w-full border p-2 rounded mb-3"
              value={fineAmount}
              onChange={(e) => setFineAmount(e.target.value)}
            />

            {/* Comment Input */}
            <textarea
              placeholder="Enter Comment"
              className="w-full border p-2 rounded mb-3"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            ></textarea>

            {/* Buttons */}
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={handleFine}
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhoneInspectionTable;