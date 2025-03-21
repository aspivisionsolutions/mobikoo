import React, { useState, useEffect } from 'react';
import { FiRefreshCw, FiFilter } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';

const PhoneCheckerFinesPanel = () => {
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
      const response = await axios.get('http://localhost:5000/api/inspection/phoneChecker/fines', {
        headers: { Authorization: `${localStorage.getItem('token')}` },
        params: {
          page: currentPage,
          limit: itemsPerPage,
          sortBy: sortField,
          order: sortDirection,
          keyword: filterKeyword
        }
      });
      console.log(response.data);
      setFines(response.data.fines || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch fines. Please try again later.');
      console.error('Error fetching fines:', err);
      setFines([]);
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
    fetchFines();
  };

  const handlePayFine = async (fineId) => {
    try {
      // Create Razorpay order for the fine
      const orderResponse = await axios.post('http://localhost:5000/api/payment/create-fine-order', {
        fineId
      }, {
        headers: { Authorization: `${localStorage.getItem('token')}` }
      });

      const options = {
        key: "rzp_test_wrWBdn4mFAZoo8", // Razorpay test key
        amount: orderResponse.data.amount, // Amount in paise
        currency: orderResponse.data.currency,
        name: 'Fine Payment',
        description: 'Payment for fine',
        order_id: orderResponse.data.id, // Order ID returned from Razorpay
        handler: async function (response) {
          // Handle successful payment
          await axios.patch(`http://localhost:5000/api/inspection/payFine/${fineId}`, {
            status: 'Paid',
            razorpayPaymentId: response.razorpay_payment_id // Include payment ID
          }, {
            headers: { Authorization: `${localStorage.getItem('token')}` }
          });

          toast.success('Fine paid successfully!');
          fetchFines();
        },
        prefill: {
          name: 'Phone Checker',
          email: 'checker@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#F37254'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error('Failed to initiate fine payment.');
      console.error('Error initiating fine payment:', error);
    }
  };

  const filteredFines = fines.filter(fine => {
    if (!filterKeyword) return true;
    const keyword = filterKeyword.toLowerCase();
    return JSON.stringify(fine).toLowerCase().includes(keyword);
  });

  const sortedFines = [...filteredFines].sort((a, b) => {
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

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="flex justify-between items-center px-4 sm:px-6 py-4 border-b">
        <h3 className="text-lg font-medium text-gray-900">My Fines</h3>
        <div className="flex space-x-2">
          <button 
            onClick={handleRefresh}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
            title="Refresh"
          >
            <FiRefreshCw />
          </button>
        </div>
      </div>
      
      <div className="p-4 sm:p-6">
        <div className="mb-4 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiFilter className="text-gray-400" />
          </div>
          <input
            type="text"
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Filter fines by model, amount, status..."
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
            <div className="overflow-x-auto -mx-4 sm:-mx-6">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
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
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentItems.length > 0 ? (
                        currentItems.map((fine, index) => (
                          <tr key={fine._id || index} className="hover:bg-gray-50">
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {fine.model || 'Unknown'}
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ₹{fine.amount || 0}
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
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {fine.status !== 'Paid' && (
                                <button
                                  onClick={() => handlePayFine(fine._id)}
                                  className="text-blue-500 hover:underline"
                                >
                                  Pay Fine
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="px-3 sm:px-6 py-4 text-center text-sm text-gray-500">
                            No fines found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
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
          </>
        )}
      </div>
    </div>
  );
};

export default PhoneCheckerFinesPanel;