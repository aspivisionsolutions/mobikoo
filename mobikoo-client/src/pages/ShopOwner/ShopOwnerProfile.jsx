import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiUser, FiShoppingBag, FiPhone, FiMapPin, FiSave, FiMail } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ShopOwnerProfile = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    shopName: '',
    mobileNumber: '',
    address: ''
  });
  const [existingFields, setExistingFields] = useState({
    shopName: false,
    mobileNumber: false,
    address: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchShopDetails();
  }, []);

  const fetchShopDetails = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/user/shop-owner', {
        headers: { Authorization: `${localStorage.getItem('token')}` }
      });
      if (response.data.shopprofile && response.data.shopprofile.length > 0) {
        const profile = response.data.shopprofile[0];
        const newFormData = {
          firstName: profile.userId.firstName || '',
          lastName: profile.userId.lastName || '',
          email: profile.userId.email || '',
          shopName: profile.shopDetails?.shopName || '',
          address: profile.shopDetails?.address || '',
          mobileNumber: profile.phoneNumber || ''
        };
        setFormData(newFormData);
        
        // Set which fields exist
        setExistingFields({
          shopName: !!profile.shopDetails?.shopName,
          address: !!profile.shopDetails?.address,
          mobileNumber: !!profile.phoneNumber
        });
      }
    } catch (error) {
      console.error('Error fetching shop details:', error);
      toast.error('Failed to load shop details');
    }
  };

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
      const submitData = {
        shopName: formData.shopName,
        phoneNumber: formData.mobileNumber,
        address: formData.address
      };

      await axios.post('http://localhost:5000/api/user/shop-owner', submitData, {
        headers: { Authorization: `${localStorage.getItem('token')}` }
      });
      toast.success('Shop details updated successfully');
      setIsEditing(false);
      fetchShopDetails(); // Refresh the data
    } catch (error) {
      console.error('Error updating shop details:', error);
      toast.error(error.response?.data?.message || 'Failed to update shop details');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Shop Profile</h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500 border border-blue-600 rounded-md text-center"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* First Name */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="firstName"
                id="firstName"
                value={formData.firstName}
                disabled={true}
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-900"
              />
            </div>
            {isEditing && <p className="mt-1 text-sm text-red-500">This field cannot be edited</p>}
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="lastName"
                id="lastName"
                value={formData.lastName}
                disabled={true}
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-900"
              />
            </div>
            {isEditing && <p className="mt-1 text-sm text-red-500">This field cannot be edited</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                disabled={true}
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-900"
              />
            </div>
            {isEditing && <p className="mt-1 text-sm text-red-500">This field cannot be edited</p>}
          </div>

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
                disabled={!isEditing}
                className={`block w-full pl-10 pr-3 py-2 border ${
                  isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                } rounded-md leading-5 
                ${isEditing ? 'focus:ring-blue-500 focus:border-blue-500' : ''} 
                text-gray-900 placeholder-gray-500 text-sm`}
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
                disabled={!isEditing}
                className={`block w-full pl-10 pr-3 py-2 border ${
                  isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                } rounded-md leading-5 
                ${isEditing ? 'focus:ring-blue-500 focus:border-blue-500' : ''} 
                text-gray-900 placeholder-gray-500 text-sm`}
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
                disabled={!isEditing}
                rows="3"
                className={`block w-full pl-10 pr-3 py-2 border ${
                  isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                } rounded-md leading-5 
                ${isEditing ? 'focus:ring-blue-500 focus:border-blue-500' : ''} 
                text-gray-900 placeholder-gray-500 text-sm`}
                placeholder="Enter your shop address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Show message if no fields exist */}
          {!existingFields.shopName && !existingFields.mobileNumber && !existingFields.address && !isEditing && (
            <div className="text-center py-4 text-gray-500">
              No shop details available. Click 'Edit Profile' to add your shop information.
            </div>
          )}

          {isEditing && (
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full sm:w-auto flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium text-white 
                         ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 
                           'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}
              >
                <FiSave className="mr-2 h-4 w-4" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ShopOwnerProfile; 