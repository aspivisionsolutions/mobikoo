import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser } from 'react-icons/fi';

const LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    role: '',
    password: ''
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
    setIsLoading(true);
    
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      toast.success('Login successful!');
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userRole', response.data.role);
      
      // Navigate to the appropriate dashboard based on role
      navigate(`/${response.data.role}/dashboard`);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'An error occurred during login';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center">
      <Toaster position="top-right" />
      
      <div className="max-w-md w-full mx-auto space-y-8 bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
          <p className="mt-2 text-sm text-gray-600">
            Please sign in to your account
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          text-gray-900 placeholder-gray-500 text-sm"
                placeholder="Enter your email"
              />
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Select Role
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="role"
                name="role"
                required
                value={formData.role}
                onChange={handleChange}
                className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          text-gray-900 text-sm"
              >
                <option value="" disabled>Select your role</option>
                <option value="customer">Customer</option>
                <option value="shop_owner">Shop Owner</option>
                <option value="phone_checker">Phone Checker</option>
                <option value="admin">Admin</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          text-gray-900 placeholder-gray-500 text-sm"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                ) : (
                  <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                )}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="flex items-center justify-end">
            <button
              type="button"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Forgot your password?
            </button>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg
                        shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                        disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="text-center text-sm">
            <span className="text-gray-600">Don't have an account?</span>
            {' '}
            <a href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
              Create one now
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;