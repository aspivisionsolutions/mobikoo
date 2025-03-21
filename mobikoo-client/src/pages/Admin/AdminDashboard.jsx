import React, { useState, useEffect } from 'react';
import { 
  FiHome, 
  FiUsers, 
  FiPhone, 
  FiClipboard,  
  FiLogOut, 
  FiMenu, 
  FiX,
  FiShield,
  FiList,
  FiDollarSign,
  FiUsers as FiPartners
} from 'react-icons/fi';
import AdminLogsTable from './AdminLogsTable';
import PhoneInspectionTable from './PhoneInspectionTable';
import WarrantiesManagement from './WarrantiesManagement';
import UserManagement from './UserManagement';
import { useNavigate } from 'react-router-dom';
import ClaimsManagement from '../../components/ClaimManagement';
import axios from 'axios';
import PartnerManagement from './PartnerDashboard';
import AdminFinesPanel from './AdminFinesPanel';
import SalesGraph from './SalesGraph';

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const navigate = useNavigate();

  // Close sidebar on mobile when selecting a menu item
  const handleMenuSelect = (menu) => {
    setActiveMenu(menu);
    if (window.innerWidth < 1024) { // lg breakpoint in Tailwind
      setIsSidebarOpen(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <DashboardContent />;
      case 'users':
        return <UserManagement />;
      case 'phones':
        return <PhoneInspectionTable />;
      case 'claims':
        return <ClaimsManagement />;
      case 'warranty':
        return <WarrantiesManagement />;
      case 'logs':
        return <AdminLogsTable />;
      case 'partners':
        return <PartnerManagement />;
      case 'fines':
        return <AdminFinesPanel />; 
      default:
        return <DashboardContent />;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Mobile Sidebar Toggle Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md bg-white shadow-md text-gray-600 hover:text-gray-900 focus:outline-none"
        >
          {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Sidebar - Slide from left without darkening background */}
      <div 
        className={`
          fixed lg:static z-40 h-full bg-blue-800 shadow-lg w-64 transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-center border-b border-b-white">
          <h1 className="text-xl font-semibold text-white">Admin Dashboard</h1>
        </div>

        {/* Sidebar Menu */}
        <nav className="mt-6 px-4 pb-20 h-full overflow-y-auto">
          <div className="space-y-2">
            <SidebarItem 
              icon={<FiHome />} 
              text="Dashboard" 
              isActive={activeMenu === 'dashboard'} 
              onClick={() => handleMenuSelect('dashboard')} 
            />
            <SidebarItem 
              icon={<FiUsers />} 
              text="Users Management" 
              isActive={activeMenu === 'users'} 
              onClick={() => handleMenuSelect('users')} 
            />
            <SidebarItem 
              icon={<FiPhone />} 
              text="Phone Inspections" 
              isActive={activeMenu === 'phones'} 
              onClick={() => handleMenuSelect('phones')} 
            />
            <SidebarItem 
              icon={<FiClipboard />} 
              text="Claims Management" 
              isActive={activeMenu === 'claims'} 
              onClick={() => handleMenuSelect('claims')} 
            />
            <SidebarItem 
              icon={<FiShield />} 
              text="Warranty Management" 
              isActive={activeMenu === 'warranty'} 
              onClick={() => handleMenuSelect('warranty')} 
            />
            <SidebarItem 
              icon={<FiList />} 
              text="Activity Logs" 
              isActive={activeMenu === 'logs'} 
              onClick={() => handleMenuSelect('logs')} 
            />
            <SidebarItem 
              icon={<FiPartners />} 
              text="Partners" 
              isActive={activeMenu === 'partners'} 
              onClick={() => handleMenuSelect('partners')} 
            />
            <SidebarItem 
              icon={<FiDollarSign />} 
              text="Fines Management" 
              isActive={activeMenu === 'fines'} 
              onClick={() => handleMenuSelect('fines')} 
            />
          </div>

          {/* Logout button at bottom */}
          <div className="absolute bottom-8 w-full left-0 px-4">
            <button 
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-white hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors"
            >
              <FiLogOut className="mr-3" />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <div className="bg-white shadow-sm">
          <div className="h-16 flex items-center px-6">
            <h2 className="text-lg font-medium text-gray-900 ml-0 lg:ml-0">
              {activeMenu === 'dashboard' && 'Dashboard Overview'}
              {activeMenu === 'users' && 'Users Management'}
              {activeMenu === 'phones' && 'Phone Inspections'}
              {activeMenu === 'claims' && 'Claims Management'}
              {activeMenu === 'warranty' && 'Warranty Management'}
              {activeMenu === 'logs' && 'Activity Logs'}
              {activeMenu === 'partners' && 'Partners Management'}
              {activeMenu === 'fines' && 'Fine Management'}
            </h2>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

// Sidebar Item Component
const SidebarItem = ({ icon, text, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full px-4 py-2 rounded-md transition-colors ${
        isActive
          ? 'bg-blue-100 text-gray-900'
          : 'text-white hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <span className="mr-3">{icon}</span>
      <span>{text}</span>
    </button>
  );
};

// Dashboard Content Component
const DashboardContent = () => {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/stats/admin', {
          headers: { Authorization: `${localStorage.getItem('token')}` }
        });
        setStats(response.data.stats);
      } catch (err) {
        console.log('Error fetching stats:', err);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <FiUsers className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-lg font-semibold text-gray-900">{stats.totalUsers || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <FiPhone className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Phone Inspections</p>
              <p className="text-lg font-semibold text-gray-900">{stats.totalInspections || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <FiClipboard className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Claims</p>
              <p className="text-lg font-semibold text-gray-900">{stats.totalClaims || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <FiShield className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Warranties Sold</p>
              <p className="text-lg font-semibold text-gray-900">{stats.totalWarranties || 0}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Activity Section */}
      <SalesGraph/>
    </div>
  );
};




export default AdminDashboard;