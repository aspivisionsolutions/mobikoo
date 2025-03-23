import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiDownload, FiEye, FiSearch, FiArrowLeft, FiShield } from 'react-icons/fi';
import ResponsiveTable from '../../components/ResponsiveTable';
import InspectionReportDetails from '../../components/InspectionReportDetails';
import WarrantyActivationDialog from '../../components/WarrantyActivationDialog';

const InspectionReports = () => {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activatingReport, setActivatingReport] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/inspection/shopOwner/reports', {
        headers: { Authorization: `${localStorage.getItem('token')}` }
      });
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setIsLoading(false);
    }
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
      await axios.post('http://localhost:5000/api/warranty/activate-warranty', {
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
          ? { ...report, warrantyStatus: 'activated' } 
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
                          <span className="px-3 py-1.5 text-red-600 flex items-center border border-red-600 rounded-md bg-red-50">
                            <FiShield className="h-5 w-5 mr-1" />
                            Not Purchased
                          </span>
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
    </div>
  );
};

export default InspectionReports;