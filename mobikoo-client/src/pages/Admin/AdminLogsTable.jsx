import React, { useState, useEffect } from 'react';
import { FiDownload, FiRefreshCw, FiFilter, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;

const AdminActivityLogsTable = () => {
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('timestamp');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterKeyword, setFilterKeyword] = useState('');

  useEffect(() => {
    fetchActivityLogs();
  }, [currentPage, sortField, sortDirection, filterKeyword]);

  const fetchActivityLogs = async () => {
    setLoading(true);
    
    try {
      const response = await axios.get(`${API_URL}/api/activity-log`, {
        headers: { Authorization: `${localStorage.getItem('token')}` },
        params: {
          page: currentPage,
          limit: itemsPerPage,
          sortBy: sortField,
          order: sortDirection,
          keyword: filterKeyword
        },
        
      });
      
      console.log(response.data);
    // In the fetchActivityLogs function in AdminActivityLogsTable
if (response.data.success && response.data.data) {
  setActivityLogs(response.data.data);
} else {
  setActivityLogs([]);
}
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch activity logs. Please try again later.');
      console.error('Error fetching activity logs:', err);
      setActivityLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleRefresh = () => {
    fetchActivityLogs();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const filteredLogs = activityLogs.filter(log => {
    if (!filterKeyword) return true;
    
    const keyword = filterKeyword.toLowerCase();
    return (
      (log.actionType?.toLowerCase().includes(keyword)) ||
      (log.shopOwnerName?.toLowerCase().includes(keyword)) ||
      (log.phoneCheckerName?.toLowerCase().includes(keyword)) ||
      (log.customerName?.toLowerCase().includes(keyword)) ||
      (log.imeiNumber?.toLowerCase().includes(keyword)) ||
      (log.planName?.toLowerCase().includes(keyword)) ||
      (log.claimStatus?.toLowerCase().includes(keyword))
    );
  });

  const sortedLogs = [...filteredLogs].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortField) {
      case 'timestamp':
        aValue = new Date(a.timestamp);
        bValue = new Date(b.timestamp);
        break;
      default:
        aValue = a[sortField] || '';
        bValue = b[sortField] || '';
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedLogs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedLogs.length / itemsPerPage);

  const handleDownloadCSV = () => {
    // Creating CSV data
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add CSV Headers
    csvContent += "Action Type,Shop Owner Name,PhoneChecker Name,Customer Name,IMEI Number,Plan Name & Price,Claim Status,Timestamp\n";
    
    // Add data rows
    filteredLogs.forEach(log => {
      const row = [
        log.actionType || 'N/A',
        log.shopOwnerId || 'N/A',
        log.phoneCheckerName || 'N/A',
        log.customerName || 'N/A',
        log.imeiNumber || 'N/A',
        `${log.planName || 'N/A'} - ${log.planPrice ? `$${log.planPrice}` : 'N/A'}`,
        log.claimStatus || 'N/A',
        formatDate(log.timestamp)
      ];
      csvContent += row.join(",") + "\n";
    });
    
    // Create download link and trigger download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `activity_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="flex justify-between items-center px-6 py-4 border-b">
        <h3 className="text-lg font-medium text-gray-900">Activity Logs</h3>
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
        {/* Filter Input */}
        <div className="mb-4 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiFilter className="text-gray-400" />
          </div>
          <input
            type="text"
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Filter logs by name, IMEI, plan name, status..."
            value={filterKeyword}
            onChange={(e) => setFilterKeyword(e.target.value)}
          />
        </div>
        
        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">Loading logs...</p>
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
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('actionType')}
                    >
                      <div className="flex items-center">
                        Action Type
                        {sortField === 'actionType' && (
                          <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('shopOwnerId')}
                    >
                      <div className="flex items-center">
                        Shop Owner
                        {sortField === 'shopOwnerId' && (
                          <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('phoneCheckerName')}
                    >
                      <div className="flex items-center">
                        PhoneChecker
                        {sortField === 'phoneCheckerName' && (
                          <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('customerName')}
                    >
                      <div className="flex items-center">
                        Customer
                        {sortField === 'customerName' && (
                          <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('imeiNumber')}
                    >
                      <div className="flex items-center">
                        IMEI Number
                        {sortField === 'imeiNumber' && (
                          <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('planName')}
                    >
                      <div className="flex items-center">
                        Plan Name & Price
                        {sortField === 'planName' && (
                          <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('claimStatus')}
                    >
                      <div className="flex items-center">
                        Claim Status
                        {sortField === 'claimStatus' && (
                          <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('timestamp')}
                    >
                      <div className="flex items-center">
                        Timestamp
                        {sortField === 'timestamp' && (
                          <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.length > 0 ? (
                    currentItems.map((log, index) => (
                      <tr key={log._id || index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            log.actionType === 'Warranty Purchased' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {log.actionType || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.shopOwnerId == "undefined undefined" ? 'N/A': log.shopOwnerId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.phoneCheckerName == "undefined undefined" ? 'N/A' : log.phoneCheckerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.customerName || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                          {log.imeiNumber || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.planPrice && <span className="text-gray-500 ml-1">${log.planPrice}</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            log.claimStatus === 'Approved' 
                              ? 'bg-green-100 text-green-800' 
                              : log.claimStatus === 'Pending' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : log.claimStatus === 'Rejected' 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-gray-100 text-gray-800'
                          }`}>
                            {log.claimStatus || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(log.timestamp)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                        No logs found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {sortedLogs.length > 0 && (
              <div className="flex items-center justify-between mt-4 px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(indexOfLastItem, sortedLogs.length)}</span> of{' '}
                      <span className="font-medium">{sortedLogs.length}</span> results
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

export default AdminActivityLogsTable;