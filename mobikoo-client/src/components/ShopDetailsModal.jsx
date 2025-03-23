import React, { useState } from 'react';
import axios from 'axios';
import { FiX, FiMapPin, FiShoppingBag, FiPhone } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ShopDetailsModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    shopName: '',
    address: '',
    mobileNumber: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await axios.post('http://localhost:5000/api/user/shop-owner', formData, {
        headers: { Authorization: `${localStorage.getItem('token')}` }
      });
      toast.success('Shop details added successfully');
      onClose();
    } catch (error) {
      console.error('Error adding shop details:', error);
      toast.error(error.response?.data?.message || 'Failed to add shop details');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Add Shop Details
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Shop Name */}
          <div>
            <label htmlFor="shopName" className="block text-sm font-medium text-gray-700">
              Shop Name
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiShoppingBag className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="shopName"
                id="shopName"
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white 
                         placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 
                         focus:border-blue-500 sm:text-sm"
                placeholder="Enter your shop name"
                value={formData.shopName}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700">
              Shop Mobile Number
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiPhone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                name="mobileNumber"
                id="mobileNumber"
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white 
                         placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 
                         focus:border-blue-500 sm:text-sm"
                placeholder="Enter shop mobile number"
                value={formData.mobileNumber}
                onChange={handleChange}
                pattern="[0-9]{10}"
                title="Please enter a valid 10-digit mobile number"
              />
            </div>
          </div>

          {/* Shop Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Shop Address
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMapPin className="h-5 w-5 text-gray-400" />
              </div>
              <textarea
                name="address"
                id="address"
                required
                rows="3"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white 
                         placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 
                         focus:border-blue-500 sm:text-sm"
                placeholder="Enter your shop address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 
                       hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 
                       focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 rounded-md text-sm font-medium text-white 
                       ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 
                         'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}
            >
              {isLoading ? 'Saving...' : 'Save Details'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShopDetailsModal; 