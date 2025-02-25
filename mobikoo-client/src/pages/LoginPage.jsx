import React, { useState } from 'react';
import axios from 'axios';
import Toast from '../components/Toast';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    role: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [toastConfig, setToastConfig] = useState({
    message: '',
    visible: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const showToast = (message) => {
    setToastConfig({
      message,
      visible: true
    });
  };

  const hideToast = () => {
    setToastConfig({
      message: '',
      visible: false
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      showToast('Login successful!');
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userRole', response.data.role);
      // You can add navigation here later
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'An error occurred during login';
      showToast(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toast 
        message={toastConfig.message}
        visible={toastConfig.visible}
        onClose={hideToast}
      />
      <div className="mt-30 overflow-hidden flex flex-col bg-cover bg-center bg-no-repeat">
        <div className="flex-1 flex justify-center items-center">
          <div className="bg-blue-600 rounded-lg w-full max-w-md p-6 text-white shadow-lg mx-4">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold">Greeting!</h2>
            </div>
            
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base">Log In</h3>
              <span className="text-xs opacity-80">Required</span>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address *"
                  className="w-full p-2 rounded text-gray-800 text-sm bg-white"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="mb-3 relative">
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full p-2 rounded text-gray-800 text-sm appearance-none bg-white"
                  required
                >
                  <option value="" disabled selected>Please select role *</option>
                  <option value="customer">Customer</option>
                  <option value="shop_owner">Shop Owner</option>
                  <option value="phone_checker">Phone Checker</option>
                  <option value="admin">Admin</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9L12 15L18 9" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              
              <div className="mb-3 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  className="w-full p-2 rounded text-gray-800 text-sm bg-white"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button 
                  type="button" 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="12" r="3" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="1" y1="1" x2="23" y2="23" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              </div>
              <p>Forgot Password?</p>
              
              <div className="mt-10 flex justify-center mb-10">
                <button 
                  type="submit" 
                  className="bg-gray-200 text-gray-800 font-bold py-2 px-5 rounded-full hover:bg-gray-300 transition disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </button>
              </div>
            </form>
            
            <div className="text-center text-xs mb-10">
              New User? <a href="/signup" className="underline">click here to Create New Account</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;