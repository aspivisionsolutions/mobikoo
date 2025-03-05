import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiUser, FiPhone, FiMapPin, FiMail, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';

const PhoneCheckerProfile = () => {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    area: '',
    isProfileComplete: false
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/user/phone-checker', {
        headers: {
          Authorization: `${localStorage.getItem('token')}`
        }
      });
      
      // Map the received data to our profile structure
      const { phoneChecker } = response.data;
      const profileData = {
        firstName: phoneChecker.userId.firstName || '',
        lastName: phoneChecker.userId.lastName || '',
        email: phoneChecker.userId.email || '',
        mobileNumber: phoneChecker.phoneNumber || '', // Map phoneNumber to mobileNumber
        area: phoneChecker.area || '',
        isProfileComplete: true
      };
      
      setProfile(profileData);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Only send phoneNumber and area as per API requirements
      const submitData = {
        phoneNumber: profile.mobileNumber,
        area: profile.area
      };

      await axios.post('http://localhost:5000/api/user/phone-checker', submitData, {
        headers: {
          Authorization: `${localStorage.getItem('token')}`
        }
      });
      setIsEditing(false);
      toast.success('Profile updated successfully');
      fetchProfile(); // Refresh profile data
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="bg-white shadow rounded-lg">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Phone Checker Profile</h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="firstName"
                  value={profile.firstName}
                  onChange={handleInputChange}
                  disabled={true}
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md bg-gray-50"
                />
              </div>
              {isEditing && <p className="mt-1 text-sm text-red-500">This field cannot be edited</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="lastName"
                  value={profile.lastName}
                  onChange={handleInputChange}
                  disabled={true}
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md bg-gray-50"
                />
              </div>
              {isEditing && <p className="mt-1 text-sm text-red-500">This field cannot be edited</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  disabled
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md bg-gray-50"
                />
              </div>
              {isEditing && <p className="mt-1 text-sm text-red-500">This field cannot be edited</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiPhone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  name="mobileNumber"
                  value={profile.mobileNumber}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  required
                  className={`block w-full pl-10 pr-3 py-2 border ${
                    isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                  } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Area</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="area"
                  value={profile.area}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  required
                  className={`block w-full pl-10 pr-3 py-2 border ${
                    isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                  } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          {isEditing && (
            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiSave className="mr-2 h-4 w-4" />
                Save Changes
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default PhoneCheckerProfile; 