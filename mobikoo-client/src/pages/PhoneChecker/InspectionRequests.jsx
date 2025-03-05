import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiSearch, FiCheckCircle, FiXCircle, FiMapPin, FiPhone } from 'react-icons/fi';
import toast from 'react-hot-toast';

const InspectionRequests = ({ standalone = false }) => {
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filteredRequests, setFilteredRequests] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredRequests(requests); // Show all requests if search term is empty
    } else {
      const filtered = requests.filter(request =>
        request.shopOwnerId.shopDetails.shopName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        request.shopOwnerId?.ShopDetails?.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRequests(filtered);
    }
  }, [requests, searchTerm]);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/inspection/phoneChecker', {
        headers: { Authorization: `${localStorage.getItem('token')}` }
      });
      console.log(response.data);
      setRequests(response.data);
      setFilteredRequests(response.data); // Initially show all requests
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to fetch inspection requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      await axios.patch(`http://localhost:5000/api/inspection/${requestId}`, 
        { status: newStatus },
        { headers: { Authorization: `${localStorage.getItem('token')}` }}
      );
      setRequests(prevRequests => prevRequests.map(request => 
        request._id === requestId ? { ...request, status: newStatus } : request
      ));
      toast.success(`Request ${newStatus} successfully`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`h-full flex flex-col ${standalone ? 'ml-64' : ''}`}>
      {/* Search Bar */}
      <div className="p-4 border-b">
        <div className="max-w-md relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white 
                     placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 
                     focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search by Shop Owner or Area"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Inspection Requests Table */}
      <div className="flex-1 overflow-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Shop Owner
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date Requested
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                  Loading requests...
                </td>
              </tr>
            ) : filteredRequests.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                  No inspection requests found
                </td>
              </tr>
            ) : (
              filteredRequests.map((request) => (
                <tr key={request._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{request.shopOwnerId?.shopDetails?.shopName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <FiMapPin className="mr-2 h-4 w-4 text-gray-400" />
                      {request.shopOwnerId?.shopDetails?.address}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${getStatusBadgeClass(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleStatusUpdate(request._id, 'accepted')}
                          className="text-blue-600 hover:text-blue-900"
                          title="Accept Request"
                        >
                          <FiCheckCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(request._id, 'rejected')}
                          className="text-red-600 hover:text-red-900"
                          title="Reject Request"
                        >
                          <FiXCircle className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                    {request.status === 'accepted' && (
                      <button
                        onClick={() => handleStatusUpdate(request._id, 'completed')}
                        className="text-green-600 hover:text-green-900"
                        title="Mark as Completed"
                      >
                        <FiCheckCircle className="h-5 w-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InspectionRequests; 