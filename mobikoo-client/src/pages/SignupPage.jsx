import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiPhone } from 'react-icons/fi';
import ShopDetailsModal from '../components/ShopDetailsModal';

const SignupPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showShopDetailsModal, setShowShopDetailsModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    role: 'shop-owner',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await axios.post('http://localhost:5000/api/auth/signup', formData);
        toast.success('Registration successful! Please login.');
        navigate('/admin/dashboard');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShopDetailsModalClose = () => {
    setShowShopDetailsModal(false);
    toast.success('Registration successful! Please login.');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 px-4 sm:px-6 lg:px-8 flex items-center">
      <Toaster position="top-right" />
      
      <div className="max-w-md w-full mx-auto bg-white rounded-2xl shadow-xl p-6">
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Create an account</h2>
          <p className="mt-1 text-sm text-gray-600">
            Sign up to get started
          </p>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* First Name */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="h-4 w-4 text-gray-400" />
              </div>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="appearance-none block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          text-gray-900 placeholder-gray-500 text-sm"
                placeholder="Enter your first name"
              />
            </div>
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="h-4 w-4 text-gray-400" />
              </div>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="appearance-none block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          text-gray-900 placeholder-gray-500 text-sm"
                placeholder="Enter your last name"
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="h-4 w-4 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          text-gray-900 placeholder-gray-500 text-sm"
                placeholder="Enter your email"
              />
            </div>
          </div>

          {/* Mobile Number Field */}
         

          {/* Role Selection */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Select Role
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="h-4 w-4 text-gray-400" />
              </div>
              <select
                id="role"
                name="role"
                required
                value={formData.role}
                onChange={handleChange}
                className="appearance-none block w-full pl-9 pr-9 py-2 border border-gray-300 rounded-lg
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          text-gray-900 text-sm"
              >
                <option value="shop-owner">Shop Owner</option>
                <option value="phone-checker">Phone Checker</option>
                <option value="admin">Admin</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-9 pr-9 py-2 border border-gray-300 rounded-lg
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                            text-gray-900 placeholder-gray-500 text-sm"
                  placeholder="Create password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <FiEyeOff className="h-4 w-4 text-gray-400 hover:text-gray-500" />
                  ) : (
                    <FiEye className="h-4 w-4 text-gray-400 hover:text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-9 pr-9 py-2 border border-gray-300 rounded-lg
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                            text-gray-900 placeholder-gray-500 text-sm"
                  placeholder="Confirm password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <FiEyeOff className="h-4 w-4 text-gray-400 hover:text-gray-500" />
                  ) : (
                    <FiEye className="h-4 w-4 text-gray-400 hover:text-gray-500" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button and Sign In Link */}
          <div className="space-y-3 mt-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-lg
                        shadow-sm text-sm font-medium text-white ${
                          isLoading
                            ? 'bg-blue-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                        }`}
            >
              {isLoading ? 'Creating account...' : 'Sign up'}
            </button>

          </div>
        </form>
      </div>

      {/* Shop Details Modal */}
      <ShopDetailsModal
        isOpen={showShopDetailsModal}
        onClose={handleShopDetailsModalClose}
      />
    </div>
  );
};

export default SignupPage;