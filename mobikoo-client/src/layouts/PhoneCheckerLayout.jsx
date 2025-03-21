import React, { useState , useEffect} from 'react';
import axios from 'axios';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FiHome, FiClipboard, FiFileText, FiLogOut, FiUser, FiMenu, FiX } from 'react-icons/fi';

const PhoneCheckerLayout = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Phone Checker';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [profile, setProfile] = useState({
      firstName: '',
      lastName: '',
      email: '',
      mobileNumber: '',
      area: '',
      isProfileComplete: false
    });

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
        setIsLoading(false);
      }
    };

  const handleLogout = () => {
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
          <div className="p-4 border-b">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <FiUser className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">{profile.firstName + " " + profile.lastName}</h2>
                <p className="text-xs text-gray-200">{profile.area}</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 py-4 overflow-y-auto px-3 space-y-1">
            <NavItem to="/phone-checker/dashboard" icon={FiHome}>
              Dashboard
            </NavItem>
            <NavItem to="/phone-checker/profile" icon={FiUser}>
              Profile
            </NavItem>
            <NavItem to="/phone-checker/inspections" icon={FiClipboard}>
              Inspection Requests
            </NavItem>
            <NavItem to="/phone-checker/reports" icon={FiFileText}>
              Reports
            </NavItem>
            <NavItem to="/phone-checker/fines" icon={FiFileText}>
              Fines
            </NavItem>
          </div>

          {/* Logout Button */}
          <div className="border-t">
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
      <div className="lg:pl-64 flex flex-col flex-1">
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PhoneCheckerLayout; 