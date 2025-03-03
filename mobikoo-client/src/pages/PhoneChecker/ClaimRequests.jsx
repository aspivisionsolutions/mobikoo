import React, { useState } from 'react';
import { FiSearch, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const ClaimRequests = ({ requests, onStatusUpdate, standalone = false }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRequests = requests.filter(request =>
    request.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.claimId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.IMEI.includes(searchTerm)
  );

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
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
            placeholder="Search by Shop Name, Claim ID or IMEI"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Claims Table */}
      <div className="flex-1 overflow-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Claim ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Shop Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                IMEI
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
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                  No claim requests found
                </td>
              </tr>
            ) : (
              filteredRequests.map((request) => (
                <tr key={request.claimId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {request.claimId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{request.shopName}</div>
                    <div className="text-sm text-gray-500">ID: {request.shopId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request.IMEI}
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
                          onClick={() => onStatusUpdate(request.claimId, 'approved')}
                          className="text-green-600 hover:text-green-900"
                        >
                          <FiCheckCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => onStatusUpdate(request.claimId, 'rejected')}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FiXCircle className="h-5 w-5" />
                        </button>
                      </div>
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

export default ClaimRequests; 