import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FiSearch, FiCheckCircle, FiXCircle, FiMapPin } from 'react-icons/fi';
import { Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
const API_URL = import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    Authorization: `${localStorage.getItem('token')}`,
  },
});

const InspectionRequests = ({ standalone = false }) => {
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [profile, setProfile] = useState({});
  const navigate = useNavigate();

  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get('/user/phone-checker');
      setProfile(data.phoneChecker || {});
    } catch (error) {
      console.error('Error fetching profile:', error.response?.data?.message || error.message);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const isProfileComplete = profile.phoneNumber && profile.area;


  useEffect(() => {
    const fetchRequests = async () => {
      if (!isProfileComplete) return;
      setIsLoading(true);
      try {
        const { data } = await axiosInstance.get('/inspection/phoneChecker');
        setRequests(data);
        setFilteredRequests(data);
      } catch (error) {
        console.error('Error fetching requests:', error);
        toast.error('Failed to fetch inspection requests');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRequests();
  }, [isProfileComplete]);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredRequests(requests);
    } else {
      const lowercasedTerm = searchTerm.toLowerCase();
      const filtered = requests.filter(({ shopOwnerId }) =>
        shopOwnerId?.shopDetails?.shopName?.toLowerCase().includes(lowercasedTerm) ||
        shopOwnerId?.shopDetails?.address?.toLowerCase().includes(lowercasedTerm)
      );
      setFilteredRequests(filtered);
    }
  }, [requests, searchTerm]);

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      await axiosInstance.patch(`/inspection/${requestId}`, { status: newStatus });
      setRequests((prev) =>
        prev.map((request) => (request._id === requestId ? { ...request, status: newStatus } : request))
      );
      toast.success(`Request marked as ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const getStatusBadgeClass = (status) => ({
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    accepted: 'bg-blue-100 text-blue-800',
    rejected: 'bg-red-100 text-red-800',
  }[status] || 'bg-gray-100 text-gray-800');

  if (!isProfileComplete) {
    return (
      <div className="flex flex-col items-center justify-center mt-10">
        <Typography variant="h5">Complete Your Shop Profile</Typography>
        <Typography variant="body1" className="mt-2">
          Please update your profile to access inspection requests.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/phone-checker/profile')} className="mt-4">
          Update Profile
        </Button>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col ${standalone ? 'ml-64' : ''}`}>
      {/* Search Bar */}
      <div className="p-4 border-b">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            className="w-full pl-10 pr-3 py-2 border rounded-md bg-white focus:ring-blue-500"
            placeholder="Search by shop name or address..."
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
              {['Shop Owner', 'Address', 'Date Requested', 'Status', 'Actions'].map((title) => (
                <th key={title} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">Loading...</td>
              </tr>
            ) : filteredRequests.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">No requests found</td>
              </tr>
            ) : (
              filteredRequests.map(({ _id, shopOwnerId, createdAt, status }) => (
                <tr key={_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{shopOwnerId?.shopDetails?.shopName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <FiMapPin className="mr-2 h-4 w-4 text-gray-400" />
                      {shopOwnerId?.shopDetails?.address}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${getStatusBadgeClass(status)}`}>
                      {status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {status === 'pending' && (
                      <div className="flex space-x-2">
                        <button onClick={() => handleStatusUpdate(_id, 'accepted')} className="text-blue-600 hover:text-blue-900">
                          <FiCheckCircle className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleStatusUpdate(_id, 'rejected')} className="text-red-600 hover:text-red-900">
                          <FiXCircle className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                    {status === 'accepted' && (
                      <button onClick={() => handleStatusUpdate(_id, 'completed')} className="text-green-600 hover:text-green-900">
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
