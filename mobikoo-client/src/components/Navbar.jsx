import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiBell, FiLogOut } from 'react-icons/fi';

const Navbar = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Phone Checker';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <div className="text-xl font-bold text-gray-800">
              MobiKoo
            </div>
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none">
              <span className="sr-only">View notifications</span>
              <FiBell className="h-6 w-6" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative flex items-center space-x-3">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <FiUser className="h-5 w-5 text-gray-500" />
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-700">{userName}</div>
                  <div className="text-xs text-gray-500">Phone Checker</div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none"
                title="Logout"
              >
                <FiLogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;