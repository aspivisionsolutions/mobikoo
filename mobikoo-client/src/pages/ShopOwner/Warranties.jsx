import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiDownload, FiEye, FiArrowLeft, FiFilter } from 'react-icons/fi';
import ResponsiveTable from '../../components/ResponsiveTable';
import WarrantyDetails from './WarrantyDetails';

const Warranties = () => {
  const [warranties, setWarranties] = useState([]);
  const [filteredWarranties, setFilteredWarranties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWarranty, setSelectedWarranty] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    issueDate: '',
    expiryDate: '',
    phoneModel: '',
    status: ''
  });

  useEffect(() => {
    fetchWarranties();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [warranties, filters]);

  const fetchWarranties = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/warranty/issued-warranties', {
        headers: { Authorization: `${localStorage.getItem('token')}` }
      });
      setWarranties(response.data.data);
      setFilteredWarranties(response.data.data);
    } catch (error) {
      console.error('Error fetching warranties:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const updateWarrantyStatuses = (warranties) => {
    return warranties.map(warranty => {
      const issueDate = new Date(warranty.issueDate);
      const durationMonths = warranty.warrantyPlanId?.warranty_months || warranty.warrantyPlanId?.durationMonths;
      const expiryDate = new Date(issueDate);
      expiryDate.setMonth(expiryDate.getMonth() + durationMonths);

      // For testing purposes, using a mock future date
      const currentDate = new Date();

      // Update status if current date is past expiry date
      if (currentDate > expiryDate) {
        return {
          ...warranty,
          inspectionReport: {
            ...warranty.inspectionReport,
            warrantyStatus: 'expired'
          }
        };
      }

      return warranty;
    });
  };

  const applyFilters = () => {
    let result = [...warranties];
    
    if (filters.issueDate) {
      const filterDate = new Date(filters.issueDate);
      result = result.filter(warranty => {
        const issueDate = new Date(warranty.issueDate);
        return issueDate.toDateString() === filterDate.toDateString();
      });
    }
    
    if (filters.expiryDate) {
      const filterDate = new Date(filters.expiryDate);
      result = result.filter(warranty => {
        const issueDate = new Date(warranty.issueDate);
        const durationMonths = warranty.warrantyPlanId?.durationMonths || warranty.warrantyPlanId?.warranty_months;
        const expiryDate = new Date(issueDate);
        expiryDate.setMonth(expiryDate.getMonth() + durationMonths);
        return expiryDate.toDateString() === filterDate.toDateString();
      });
    }
    
    if (filters.phoneModel) {
      const modelLower = filters.phoneModel.toLowerCase();
      result = result.filter(warranty => 
        warranty.inspectionReport.deviceModel.toLowerCase().includes(modelLower)
      );
    }
    
    if (filters.status) {
      const statusLower = filters.status.toLowerCase();
      result = result.filter(warranty => 
        warranty.inspectionReport.warrantyStatus.toLowerCase() === statusLower
      );
    }
    
    setFilteredWarranties(result);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      issueDate: '',
      expiryDate: '',
      phoneModel: '',
      status: ''
    });
  };

  const handleDownload = async (warrantyId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/shop-owner/warranty-documents/${warrantyId}/download`,
        {
          responseType: 'blob',
          headers: { Authorization: `${localStorage.getItem('token')}` }
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `warranty-${warrantyId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading warranty:', error);
    }
  };

  const handleView = (warrantyId) => {
    setSelectedWarranty(warrantyId);
  };

  const headers = [
    { key: 'issueDate', label: 'Issue Date' },
    { key: 'expiryDate', label: 'Expiry Date' },
    { key: 'phoneModel', label: 'Phone Model' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' }
  ];

  const renderRow = (warranty, index, viewType) => {
    const issueDate = new Date(warranty.issueDate);
    const durationMonths = warranty.warrantyPlanId?.warranty_months || warranty.warrantyPlanId?.durationMonths;
    const expiryDate = new Date(issueDate);
    expiryDate.setMonth(expiryDate.getMonth() + durationMonths);
    
    // Determining status based on a mock future date
    const currentDate = new Date();
    const currentStatus = currentDate > expiryDate ? 'expired' : warranty.inspectionReport.warrantyStatus;

    if (viewType === 'desktop') {
      return (
        <tr key={index}>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {new Date(warranty.issueDate).toLocaleDateString()}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {expiryDate.toLocaleDateString()}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {warranty.inspectionReport.deviceModel}
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
              ${warranty.inspectionReport.warrantyStatus === 'activated' ? 'bg-green-100 text-green-800' :
                warranty.inspectionReport.warrantyStatus === 'expired' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'}`}
            >
             {currentStatus}
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            <div className="flex space-x-3">
              <button
                onClick={() => handleView(warranty)}
                className="text-blue-600 hover:text-blue-900"
              >
                <FiEye className="h-5 w-5" />
              </button>
              {/* <button
                onClick={() => handleDownload(warranty.id)}
                className="text-green-600 hover:text-green-900"
              >
                <FiDownload className="h-5 w-5" />
              </button> */}
            </div>
          </td>
        </tr>
      );
    } else {
      return (
        <div className="flex justify-end space-x-3 border-t pt-3 mt-3">
          <button
            onClick={() => handleView(warranty.id)}
            className="flex items-center text-sm text-blue-600 hover:text-blue-900"
          >
            <FiEye className="h-4 w-4 mr-1" />
            View
          </button>
          <button
            onClick={() => handleDownload(warranty.id)}
            className="flex items-center text-sm text-green-600 hover:text-green-900"
          >
            <FiDownload className="h-4 w-4 mr-1" />
            Download
          </button>
        </div>
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleBack = () => {
    setSelectedWarranty(null);
  }

  if (selectedWarranty) {
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
              Warranty Details
            </h3>
          </div>
        </div>
        <div className="p-6">
          <WarrantyDetails warranty={selectedWarranty} />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Issued Warranties
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              View and Download Issued Warranties
            </p>
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiFilter className="h-4 w-4 mr-1" />
            Filters
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 gap-y-2 gap-x-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="issueDate" className="block text-xs font-medium text-gray-700">
                Issue Date
              </label>
              <input
                type="date"
                name="issueDate"
                id="issueDate"
                value={filters.issueDate}
                onChange={handleFilterChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="expiryDate" className="block text-xs font-medium text-gray-700">
                Expiry Date
              </label>
              <input
                type="date"
                name="expiryDate"
                id="expiryDate"
                value={filters.expiryDate}
                onChange={handleFilterChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="phoneModel" className="block text-xs font-medium text-gray-700">
                Phone Model
              </label>
              <input
                type="text"
                name="phoneModel"
                id="phoneModel"
                value={filters.phoneModel}
                onChange={handleFilterChange}
                placeholder="e.g. iPhone 12"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="status" className="block text-xs font-medium text-gray-700">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">All</option>
                <option value="purchased">Purchased</option>
                <option value="activated">Activated</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
          <div className="mt-3 text-right">
            <button
              onClick={clearFilters}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      <div className="p-4">
        {filteredWarranties.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No matching warranty documents available
          </div>
        ) : (
          <ResponsiveTable
            headers={headers}
            data={filteredWarranties}
            renderRow={renderRow}
          />
        )}
      </div>
    </div>
  );
};

export default Warranties;