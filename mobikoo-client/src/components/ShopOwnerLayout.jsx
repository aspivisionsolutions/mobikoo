import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FiHome, FiFileText, FiShield, FiLogOut, FiUser } from 'react-icons/fi';

const ShopOwnerLayout = () => {
  const navigate = useNavigate();
  const shopName = "Shop Name"; // Replace with actual shop name from context/state

  const handleLogout = () => {
    // Clear auth tokens/state
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Profile Section */}
          <div className="p-4 border-b">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <FiUser className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">{shopName}</h2>
                <p className="text-xs text-gray-500">Shop Owner</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 py-4">
            <NavLink
              to="/shop-owner/dashboard"
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <FiHome className="mr-3 h-5 w-5" />
              Dashboard
            </NavLink>

            <NavLink
              to="/shop-owner/dashboard?tab=inspections"
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <FiFileText className="mr-3 h-5 w-5" />
              Inspection Reports
            </NavLink>

            <NavLink
              to="/shop-owner/dashboard?tab=warranties"
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <FiShield className="mr-3 h-5 w-5" />
              Warranties
            </NavLink>
          </div>

          {/* Logout Button */}
          <div className="border-t">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <FiLogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="">
        <Outlet />
      </div>
    </div>
  );
};

export default ShopOwnerLayout; 