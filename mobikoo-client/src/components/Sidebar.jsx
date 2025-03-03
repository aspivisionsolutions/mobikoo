import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiHome, FiClipboard, FiTool, FiFileText, FiUser, FiLogOut } from 'react-icons/fi';

const Sidebar = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Phone Checker';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="bg-white h-full w-64 shadow-sm fixed left-0 top-0">
      {/* Profile Section */}
      <div className="p-4 border-b">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <FiUser className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{userName}</div>
            <div className="text-sm text-gray-500">Phone Checker</div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="py-4">
        <div className="space-y-1">
          <NavLink
            to="/phone-checker/dashboard"
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
            to="/phone-checker/claims"
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <FiClipboard className="mr-3 h-5 w-5" />
            Claims
          </NavLink>

          <NavLink
            to="/phone-checker/inspections"
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <FiTool className="mr-3 h-5 w-5" />
            Inspections
          </NavLink>

          <NavLink
            to="/phone-checker/reports"
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <FiFileText className="mr-3 h-5 w-5" />
            Reports
          </NavLink>
        </div>
      </div>

      {/* Logout Button */}
      <div className="absolute bottom-0 w-full border-t">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <FiLogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 