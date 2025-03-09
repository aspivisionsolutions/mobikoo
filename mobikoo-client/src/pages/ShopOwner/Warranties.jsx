import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiDownload, FiEye } from 'react-icons/fi';
import ResponsiveTable from '../../components/ResponsiveTable';

const Warranties = () => {
  const [warranties, setWarranties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWarranties();
  }, []);

  const fetchWarranties = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/warranty/issued-warranties', {
        headers: { Authorization: `${localStorage.getItem('token')}` }
      });
      setWarranties(response.data.data);
    } catch (error) {
      console.error('Error fetching warranties:', error);
    } finally {
      setIsLoading(false);
    }
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
    // Implement view functionality
    console.log('Viewing warranty:', warrantyId);
  };

  const headers = [
    { key: 'issueDate', label: 'Issue Date'},
    { key: 'expiryDate', label: 'Expiry Date'},
    { key: 'phoneModel', label: 'Phone Model' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' }
  ];

  const renderRow = (warranty, index, viewType) => {
    const issueDate = new Date(warranty.inspectionReport.inspectionDate);
    const durationMonths = warranty.warrantyPlanId.durationMonths;
    const expiryDate = new Date(issueDate.setMonth(issueDate.getMonth() + durationMonths));

    if (viewType === 'desktop') {
      return (
        <tr key={index}>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {issueDate.toLocaleDateString()}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {expiryDate.toLocaleDateString()}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {warranty.inspectionReport.deviceModel}
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
              ${warranty.status === 'Active' ? 'bg-green-100 text-green-800' : 
                warranty.status === 'Expired' ? 'bg-red-100 text-red-800' : 
                'bg-gray-100 text-gray-800'}`}
            >
              {warranty.inspectionReport.warrantyStatus}
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            <div className="flex space-x-3">
              <button
                onClick={() => handleView(warranty.id)}
                className="text-blue-600 hover:text-blue-900"
              >
                <FiEye className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleDownload(warranty.id)}
                className="text-green-600 hover:text-green-900"
              >
                <FiDownload className="h-5 w-5" />
              </button>
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

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Warranty Documents
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          View and download your warranty documents
        </p>
      </div>
      
      <div className="p-4">
        {warranties.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No warranty documents available
          </div>
        ) : (
          <ResponsiveTable
            headers={headers}
            data={warranties}
            renderRow={renderRow}
          />
        )}
      </div>
    </div>
  );
};

export default Warranties; 