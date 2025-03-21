import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiHome, FiFileText, FiShield, FiLogOut, FiUser, FiSettings, FiMenu, FiX, FiAlertCircle } from 'react-icons/fi';

const ShopOwnerLayout = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [shopDetails, setShopDetails] = useState(null);

  useEffect(()=>{
    fetchShopDetails();
  },[])

  const fetchShopDetails = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/user/shop-owner', {
        headers: { Authorization: `${localStorage.getItem('token')}` }
      });
      
      if (response.data.shopprofile && response.data.shopprofile.length > 0) {
        const profile = response.data.shopprofile[0];
        setShopDetails({
          shopName: profile.shopDetails?.shopName,
          address: profile.shopDetails?.address,
          mobileNumber: profile.phoneNumber,
          shopOwnerName: profile.userId.firstName + ' ' + profile.userId.lastName
        });
      } else {
        setShopDetails(null);
      }
    } catch (error) {
      console.error('Error fetching shop details:', error);
      setShopDetails(null);
    }
  };

  const handleLogout = () => {
    // Clear auth tokens/state
    localStorage.removeItem('token');
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const NavItem = ({ to, icon: Icon, children }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex rounded items-center px-4 py-3 text-sm font-medium transition-colors ${
          isActive
            ? 'bg-blue-50 text-blue-700'
            : 'text-white hover:bg-gray-50 hover:text-gray-900'
        }`
      }
      onClick={() => setIsMobileMenuOpen(false)}
      end
    >
      <Icon className="mr-3 h-5 w-5" />
      {children}
    </NavLink>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-20 bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none"
          >
            {isMobileMenuOpen ? (
              <FiX className="h-6 w-6" />
            ) : (
              <FiMenu className="h-6 w-6" />
            )}
          </button>
          <span className="text-lg font-semibold text-gray-900">MobiKoo</span>
          <div className="w-6"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-blue-800 text-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Profile Section */}
          <div className="p-4 border-b mt-14 lg:mt-0">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <FiUser className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">{shopDetails?.shopName}</h2>
                <p className="text-xs text-gray-50">{shopDetails?.shopOwnerName}</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 py-4 overflow-y-auto px-3 space-y-1">
            <NavItem to="/shop-owner/dashboard" icon={FiHome}>
              Dashboard
            </NavItem>
            <NavItem to="/shop-owner/dashboard/inspections" icon={FiFileText}>
              Inspection Reports
            </NavItem>
            <NavItem to="/shop-owner/dashboard/warranties" icon={FiShield}>
              Warranties
            </NavItem>
            <NavItem to="/shop-owner/dashboard/claims" icon={FiAlertCircle}>
              Claims
            </NavItem>
            <NavItem to="/shop-owner/profile" icon={FiSettings}>
              Shop Profile
            </NavItem>
          </div>

          {/* Logout Button */}
          <div className="border-t border-t-white">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-white hover:bg-red-50 hover:text-gray-800 cursor-pointer transition-colors"
            >
              <FiLogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-20 lg:hidden"
          onClick={toggleMobileMenu}
        ></div>
      )}

      {/* Main Content */}
      <div className="lg:ml-64 pt-16 lg:pt-0">
        <div className="p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default ShopOwnerLayout;