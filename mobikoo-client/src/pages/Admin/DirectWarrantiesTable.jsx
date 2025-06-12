import React, { useState, useEffect } from 'react';
import { FiDownload, FiRefreshCw, FiFilter, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;

const DirectWarrantiesTable = () => {
  const [warranties, setWarranties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filterKeyword, setFilterKeyword] = useState('');

  useEffect(() => {
    fetchWarranties();
    // eslint-disable-next-line
  }, [currentPage, filterKeyword]);

  const fetchWarranties = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/landing-payment/get/direct-warranties`, {
        headers: { Authorization: `${localStorage.getItem('token')}` },
        params: {
          page: currentPage,
          limit: itemsPerPage,
          keyword: filterKeyword
        }
      });
      setWarranties(response.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch direct warranties. Please try again later.');
      setWarranties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchWarranties();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const filteredWarranties = warranties.filter(w => {
  if (!filterKeyword) return true;
  const keyword = filterKeyword.toLowerCase();
  return (
    (w.deviceDetails?.deviceName || '').toLowerCase().includes(keyword) ||
    (w.customerDetails?.customerName || '').toLowerCase().includes(keyword) ||
    (w.customerDetails?.customerEmail || '').toLowerCase().includes(keyword) ||
    (w.customerDetails?.customerPhone || '').toLowerCase().includes(keyword) ||
    (w.planDetails?.planType || '').toLowerCase().includes(keyword) ||
    (w.planDetails?.planPrice || '').toLowerCase().includes(keyword)
  );
});

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredWarranties.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredWarranties.length / itemsPerPage);

  const handleDownloadCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Order ID,Device Name,Purchase Date,Device Price,Customer Name,Email,Phone,Plan Type,Plan Price\n";
    filteredWarranties.forEach(w => {
      const row = [
        w.paymentOrderId || 'N/A',
        w.deviceDetails?.deviceName || 'N/A',
        w.deviceDetails?.purchaseDate || 'N/A',
        w.deviceDetails?.devicePrice || 'N/A',
        w.customerDetails?.customerName || 'N/A',
        w.customerDetails?.customerEmail || 'N/A',
        w.customerDetails?.customerPhone || 'N/A',
        w.planDetails?.planType || 'N/A',
        w.planDetails?.planPrice || 'N/A'
      ];
      csvContent += row.join(",") + "\n";
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `direct_warranties_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="flex justify-between items-center px-6 py-4 border-b">
        <h3 className="text-lg font-medium text-gray-900">Direct Warranties</h3>
        <div className="flex space-x-2">
          <button 
            onClick={handleRefresh}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
            title="Refresh"
          >
            <FiRefreshCw />
          </button>
          <button 
            onClick={handleDownloadCSV}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
            title="Download CSV"
          >
            <FiDownload />
          </button>
        </div>
      </div>
      <div className="p-6">
        <div className="mb-4 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiFilter className="text-gray-400" />
          </div>
          <input
            type="text"
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Filter by device, customer, plan, etc..."
            value={filterKeyword}
            onChange={(e) => setFilterKeyword(e.target.value)}
          />
        </div>
        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">Loading warranties...</p>
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">
            {error}
            <button 
              onClick={handleRefresh}
              className="block mx-auto mt-2 text-blue-500 hover:underline"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purchase Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan Price</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.length > 0 ? (
                    currentItems.map((w, idx) => (
                      <tr key={w._id || idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{w.paymentOrderId || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{w.deviceDetails?.deviceName || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{w.deviceDetails?.purchaseDate || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{w.deviceDetails?.devicePrice || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{w.customerDetails?.customerName || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{w.customerDetails?.customerEmail || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{w.customerDetails?.customerPhone || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{w.planDetails?.planType || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{w.planDetails?.planPrice || 'N/A'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="px-6 py-4 text-center text-sm text-gray-500">
                        No direct warranties found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination Controls */}
            {filteredWarranties.length > 0 && (
              <div className="flex items-center justify-between mt-4 px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(indexOfLastItem, filteredWarranties.length)}</span> of{' '}
                      <span className="font-medium">{filteredWarranties.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                          currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <FiChevronLeft className="h-5 w-5" />
                      </button>
                      {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                        let pageNumber;
                        if (totalPages <= 5) {
                          pageNumber = idx + 1;
                        } else if (currentPage <= 3) {
                          pageNumber = idx + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNumber = totalPages - 4 + idx;
                        } else {
                          pageNumber = currentPage - 2 + idx;
                        }
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => setCurrentPage(pageNumber)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === pageNumber
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                          currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <FiChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DirectWarrantiesTable;