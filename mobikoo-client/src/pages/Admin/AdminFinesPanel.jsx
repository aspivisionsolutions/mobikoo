import React, { useState, useEffect } from 'react';
import { FiDownload, FiRefreshCw, FiFilter } from 'react-icons/fi';
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;

const AdminFinesPanel = () => {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterKeyword, setFilterKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('timestamp');
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    fetchFines();
  }, []);

  const fetchFines = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/inspection/admin/fines`, {
        headers: { Authorization: `${localStorage.getItem('token')}` },
        params: {
          page: currentPage,
          limit: itemsPerPage,
          sortBy: sortField,
          order: sortDirection,
          keyword: filterKeyword
        }
      });
      console.log("Fetched fines from frontend:", response.data);
      // Add direct debug to see what we're getting
      console.log("Setting fines to:", Array.isArray(response.data) ? response.data : Array.isArray(response.data.fines) ? response.data.fines : []);
      
      // Try different ways to get the data - one of these should work
      if (Array.isArray(response.data)) {
        setFines(response.data);
      } else if (response.data && Array.isArray(response.data.fines)) {
        setFines(response.data.fines);
      } else if (response.data && typeof response.data === 'object') {
        // If data is directly in the response object
        setFines([response.data]);
      } else {
        setFines([]);
      }
      setError(null);
    } catch (err) {
      setError('Failed to fetch fines. Please try again later.');
      console.error('Error fetching fines:', err);
      setFines([]);
    } finally {
      setLoading(false);
    }
  };

  // Add debug logging to see what's actually in the state
  useEffect(() => {
    console.log("Current fines state:", fines);
  }, [fines]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleRefresh = () => {
    fetchFines();
  };

  // Simple, direct filter function that looks at all string values
  const filteredFines = fines.filter(fine => {
    if (!filterKeyword) return true;
    
    const keyword = filterKeyword.toLowerCase();
    // Convert the entire fine object to a string and check if it contains the keyword
    return JSON.stringify(fine).toLowerCase().includes(keyword);
  });
  
  const sortedFines = [...filteredFines].sort((a, b) => {
    // Simplified sorting that works with most field types
    const aValue = a[sortField] || '';
    const bValue = b[sortField] || '';
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedFines.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedFines.length / itemsPerPage);

  const handleDownloadCSV = () => {
    // Creating CSV data
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add CSV Headers
    csvContent += "Phone Checker,Phone Model,Fine Amount,Status,Comments\n";
    
    // Add data rows
    filteredFines.forEach(fine => {
      const row = [
        fine.phoneChecker || fine.inspectorId?._id || 'N/A',
        fine.model || 'Unknown',
        `₹${fine.amount}`,
        fine.status || 'N/A',
        (fine.comment || '').replace(/,/g, ';') // Replace commas in comments to prevent CSV issues
      ];
      csvContent += row.join(",") + "\n";
    });
    
    // Create download link and trigger download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fines_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="flex justify-between items-center px-4 sm:px-6 py-4 border-b">
        <h3 className="text-lg font-medium text-gray-900">Fine Management</h3>
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
      
      <div className="p-4 sm:p-6">
        
        {/* Filter Input */}
        <div className="mb-4 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiFilter className="text-gray-400" />
          </div>
          <input
            type="text"
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Filter fines by phone checker, model, amount, status..."
            value={filterKeyword}
            onChange={(e) => setFilterKeyword(e.target.value)}
          />
        </div>
        
        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">Loading fines...</p>
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
            {/* Render basic data table */}
            <div className="overflow-x-auto -mx-4 sm:-mx-6">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th 
                          className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('inspectorId.name')}
                        >
                          Phone Checker
                        </th>
                        <th 
                          className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('inspectionId.deviceModel')}
                        >
                          Phone Model
                        </th>
                        <th 
                          className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('fineAmount')}
                        >
                          Fine Amount
                        </th>
                        <th 
                          className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('status')}
                        >
                          Status
                        </th>
                        <th 
      className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"

    >
      Comments
    </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentItems.length > 0 ? (
                        currentItems.map((fine, index) => (
                          <tr key={fine._id || index} className="hover:bg-gray-50">
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                           {fine.phoneChecker || 'N/A'}
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              { fine.model || 'Unknown'}
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ₹{fine.fineAmount || fine.amount || 0}
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                fine.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {fine.status || 'N/A'}
                              </span>
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                       {fine.comment || 'No comments'}
                          </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="px-3 sm:px-6 py-4 text-center text-sm text-gray-500">
                            No fines found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-4">
                <nav className="inline-flex rounded-md shadow">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${
                      currentPage === 1 
                        ? 'bg-gray-100 text-gray-400 cursor-default' 
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    } text-sm font-medium`}
                  >
                    Previous
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border ${
                        currentPage === i + 1
                          ? 'bg-blue-50 border-blue-500 text-blue-600 z-10'
                          : 'bg-white text-gray-500 hover:bg-gray-50'
                      } text-sm font-medium`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-default'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    } text-sm font-medium`}
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
            
            {/* Summary Statistics */}
            <div className="flex flex-col sm:flex-row items-center justify-between mt-4 px-4 py-3 border-t border-gray-200">
              <div className="flex items-center mb-2 sm:mb-0">
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{Math.min(filteredFines.length, indexOfFirstItem + 1)}</span> to{' '}
                  <span className="font-medium">{Math.min(filteredFines.length, indexOfLastItem)}</span> of{' '}
                  <span className="font-medium">{filteredFines.length}</span> results
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminFinesPanel;