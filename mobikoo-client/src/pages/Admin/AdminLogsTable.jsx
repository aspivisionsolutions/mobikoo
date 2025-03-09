import React, { useState, useEffect } from 'react';
import { FiDownload, FiRefreshCw, FiFilter, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import axios from 'axios';

const AdminLogsTable = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1); 
 
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterKeyword, setFilterKeyword] = useState('');

  useEffect(() => {
    fetchLogs(page); // ✅ Pass `page` correctly
}, [page, searchTerm]); 

  const fetchLogs = async () => {
    setLoading(true);
    
    try {
        const response = await axios.get(`http://localhost:5000/api/admin/logs?page=${page}&limit=10&sortBy=createdAt&order=desc`, {
            params: {
                page: currentPage,
                limit: itemsPerPage,
                sortBy: sortField,
                order: sortDirection,
                filterKeyword
            }
            
        });
        console.log(response.data.logs);  // Ensure phoneChecker and shopOwner fields exist
       

  
        if (response.data.logs) {
            setLogs(response.data.logs);
        } else {
            setLogs([]);
        }

        setError(null);
    } catch (err) {
        setError('Failed to fetch logs. Please try again later.');
        console.error('Error fetching logs:', err);
        setLogs([]);
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
    fetchLogs();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const filteredLogs = logs.filter(log => {
    if (!filterKeyword) return true;
    
    const keyword = filterKeyword.toLowerCase();
    return (
      (log.phoneChecker?.name?.toLowerCase().includes(keyword) || 
       log.phoneChecker?.email?.toLowerCase().includes(keyword)) ||
      (log.shopOwner?.shopDetails.shopName?.toLowerCase().includes(keyword) || 
       log.shopOwner?.phoneNumber?.toLowerCase().includes(keyword)) ||
      (log.invoiceDetails?.invoiceId?.toLowerCase().includes(keyword)) ||
      (log.invoiceDetails?.buyerDetails?.name?.toLowerCase().includes(keyword))
    );
  });

  const sortedLogs = [...filteredLogs].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortField) {
      case 'createdAt':
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
        break;
      case 'phoneChecker':
        aValue = a.phoneChecker?.name || '';
        bValue = b.phoneChecker?.name || '';
        break;
      case 'shopOwner':
        aValue = a.shopOwner?.name || '';
        bValue = b.shopOwner?.phoneNumber || '';
        break;
      case 'invoiceId':
        aValue = a.invoiceDetails?.invoiceId || '';
        bValue = b.invoiceDetails?.invoiceId || '';
        break;
      default:
        aValue = a[sortField];
        bValue = b[sortField];
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
    csvContent += "Date,Phone Checker,Shop Owner,Invoice ID,Buyer Name,Phone Details,Warranty Type\n";
    
    // Add data rows
    filteredLogs.forEach(log => {
      const row = [
        new Date(log.createdAt).toLocaleDateString(),
        log.phoneChecker?.name || 'N/A',
        log.shopOwner?.shopDetails.shopName || 'N/A',
        log.invoiceDetails?.invoiceId || 'N/A',
        log.invoiceDetails?.buyerDetails?.name || 'N/A',
        log.phoneDetails?.model || 'N/A',
        log.warrantyDetails?.planName || 'N/A'
      ];
      console.log(log);
      csvContent += row.join(",") + "\n";
    });
    
    // Create download link and trigger download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `admin_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="flex justify-between items-center px-6 py-4 border-b">
        <h3 className="text-lg font-medium text-gray-900">Admin Activity Logs</h3>
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
            placeholder="Filter logs by name, email, invoice ID..."
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
                      onClick={() => handleSort('createdAt')}
                    >
                      <div className="flex items-center">
                        Date/Time
                        {sortField === 'createdAt' && (
                          <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('phoneChecker')}
                    >
                      <div className="flex items-center">
                        Phone Checker
                        {sortField === 'phoneChecker' && (
                          <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('shopOwner')}
                    >
                      <div className="flex items-center">
                        Shop Owner
                        {sortField === 'shopOwner' && (
                          <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('invoiceId')}
                    >
                      <div className="flex items-center">
                        Invoice Details
                        {sortField === 'invoiceId' && (
                          <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone & Warranty
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.length > 0 ? (
                    currentItems.map((log) => (
                      <tr key={log._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(log.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{log.phoneChecker?.name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{log.phoneChecker?.email || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{log.shopOwner?.shopDetails.shopName || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{log.shopOwner?.phoneNumber || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">#{log.invoiceDetails?.invoiceId || 'N/A'}</div>
                          <div className="text-sm text-gray-500">Buyer: {log.invoiceDetails?.buyerDetails?.name || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {log.phoneDetails?.model || ''}
                          </div>
                          <div className="text-sm text-gray-500">
                            Warranty Plan: {log.warrantyDetails?.planName || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <a href={`/admin/logs/${log._id}`} className="text-blue-600 hover:text-blue-900">
                            View Details
                          </a>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
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
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Next
                  </button>
                </div>
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

export default AdminLogsTable;