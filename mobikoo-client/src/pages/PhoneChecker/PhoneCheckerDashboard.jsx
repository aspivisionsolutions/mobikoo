import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { FiSearch, FiDownload, FiTrendingUp, FiPhone, FiCheckCircle } from 'react-icons/fi';
import ClaimRequests from './ClaimRequests';
import InspectionRequests from './InspectionRequests';

const PhoneCheckerDashboard = () => {
  const [activeTab, setActiveTab] = useState('claims');
  const [claimRequests, setClaimRequests] = useState([]);
  const [inspectionRequests, setInspectionRequests] = useState([]);
  const [inspectionReports, setInspectionReports] = useState([]);
  const [salesStats, setSalesStats] = useState({
    totalSales: 0,
    totalInspections: 0,
    completedInspections: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showInspectionForm, setShowInspectionForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    shopNumber: '',
    inspectorId: '', // Will be auto-populated
    dateTime: new Date().toISOString().slice(0, 16), // Format: YYYY-MM-DDTHH:mm
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
    grade: ''
  });

  useEffect(() => {
    fetchRequests();
    fetchSalesStats();
    if (activeTab === 'reports') {
      fetchReports();
    }
  }, [activeTab]);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      // Fetch both types of requests
      const [claimsResponse, inspectionsResponse] = await Promise.all([
        axios.get('http://localhost:5000/api/claims'),
        axios.get('http://localhost:5000/api/inspections')
      ]);

      setClaimRequests(claimsResponse.data);
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
      const response = await axios.get('http://localhost:5000/api/inspections/reports');
      setInspectionReports(response.data);
    } catch (error) {
      toast.error('Failed to fetch inspection reports');
      console.error('Error fetching reports:', error);
    }
  };

  const fetchSalesStats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/phone-checker/stats');
      setSalesStats(response.data);
    } catch (error) {
      console.error('Error fetching sales stats:', error);
    }
  };

  const handleStatusUpdate = async (requestId, type, newStatus) => {
    try {
      const endpoint = type === 'claim' 
        ? `http://localhost:5000/api/claims/${requestId}/status`
        : `http://localhost:5000/api/inspections/${requestId}/status`;

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
  };

  const handleFormClose = () => {
    setShowInspectionForm(false);
    setFormData({
      shopNumber: '',
      inspectorId: '',
      dateTime: new Date().toISOString().slice(0, 16),
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
      grade: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: Array.from(files)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
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

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'photos') {
          formData.photos.forEach(photo => {
            formDataToSend.append('photos', photo);
          });
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      await axios.post('http://localhost:5000/api/inspections/submit', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Inspection submitted successfully');
      handleFormClose();
      fetchRequests();
    } catch (error) {
      toast.error('Failed to submit inspection');
      console.error('Error submitting inspection:', error);
    }
  };

  const handleDownloadReport = async (reportId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/inspections/reports/${reportId}/download`, {
        responseType: 'blob'
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

  const filteredReports = inspectionReports.filter(report => 
    report.shopNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.imeiNumber.includes(searchTerm) ||
    report.deviceModel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderReportsTab = () => (
    <div className="bg-white rounded-lg shadow">
      {/* Search Bar */}
      <div className="p-4 border-b">
        <div className="max-w-md relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by Shop Number, IMEI, or Device Model"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Reports Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shop Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IMEI</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device Model</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Overall Condition</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                  No reports found
                </td>
              </tr>
            ) : (
              filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(report.dateTime).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.shopNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.imeiNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.deviceModel}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${report.grade === 'A' ? 'bg-green-100 text-green-800' :
                        report.grade === 'B' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'}`}>
                      {report.grade}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.bodyCondition}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleDownloadReport(report.id)}
                      className="text-blue-600 hover:text-blue-900 flex items-center"
                    >
                      <FiDownload className="h-4 w-4 mr-1" />
                      Download
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Sales</p>
            <p className="text-2xl font-semibold text-gray-900">
              ₹{salesStats.totalSales.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <FiTrendingUp className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Inspections</p>
            <p className="text-2xl font-semibold text-gray-900">
              {salesStats.totalInspections}
            </p>
          </div>
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
            <FiPhone className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Completed Inspections</p>
            <p className="text-2xl font-semibold text-gray-900">
              {salesStats.completedInspections}
            </p>
          </div>
          <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
            <FiCheckCircle className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex">
      {/* Main content area */}
      <main className="flex-1 ml-64 bg-gray-50 min-h-screen">
        <div className="max-w-full">
      <Toaster position="top-right" />
      
          {/* Header with Stats */}
          <div className="p-4">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-gray-600">
              Monitor your performance and manage inspections
            </p>
            <button
              onClick={handleInspectClick}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              New Inspection
            </button>

            {/* Stats Cards */}
            {renderStats()}
      </div>

      {/* Tabs */}
          <div className="px-4 border-b border-gray-200">
        <nav className="flex space-x-4" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('claims')}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              activeTab === 'claims'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Claim Requests
          </button>
          <button
            onClick={() => setActiveTab('inspections')}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              activeTab === 'inspections'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Inspection Requests
          </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'reports'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Reports
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
          {activeTab === 'claims' ? (
            <ClaimRequests 
              requests={claimRequests} 
              onStatusUpdate={(id, status) => handleStatusUpdate(id, 'claim', status)} 
            />
                ) : activeTab === 'inspections' ? (
            <InspectionRequests 
              requests={inspectionRequests} 
              onStatusUpdate={(id, status) => handleStatusUpdate(id, 'inspection', status)} 
            />
                ) : (
                  renderReportsTab()
                )}
              </div>
            )}
          </div>
        </div>
      </main>

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
                  <input
                    type="text"
                    name="shopNumber"
                    value={formData.shopNumber}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Inspector ID</label>
                  <input
                    type="text"
                    name="inspectorId"
                    value={formData.inspectorId}
                    readOnly
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date & Time</label>
                  <input
                    type="datetime-local"
                    name="dateTime"
                    value={formData.dateTime}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
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
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Submit Inspection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhoneCheckerDashboard; 