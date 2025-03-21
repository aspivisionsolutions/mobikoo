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
  FiDollarSign ,
  FiUsers as FiPartners
} from 'react-icons/fi';
import AdminLogsTable from './AdminLogsTable'; // Import the new component
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
  const navigate = useNavigate()

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <DashboardContent />;
      case 'users':
        return <UserManagement/>
        case 'phones':
          return <PhoneInspectionTable />;
      case 'claims':
        return <ClaimsManagement/>;
      case 'warranty':
        return <WarrantiesManagement />;
      case 'logs':
        return <AdminLogsTable />; // Added the logs component here
      case 'partners':
        return <PartnerManagement/>;
        case 'fines':
          return <AdminFinesPanel/>; 
      default:
        return <DashboardContent />;
    }
  };

  const handleLogout = () => {
    // Handle logout here
    localStorage.removeItem('token');
    navigate('/login');
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md bg-white shadow-md text-gray-600 hover:text-gray-900 focus:outline-none"
        >
          {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } fixed lg:relative lg:translate-x-0 z-40 transition-transform duration-300 ease-in-out h-full bg-white shadow-lg w-64 flex-shrink-0`}>
        
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-center border-b">
          <h1 className="text-xl font-semibold text-gray-800">Admin Dashboard</h1>
        </div>

        {/* Sidebar Menu */}
        <nav className="mt-6 px-4">
          <div className="space-y-2">
            <SidebarItem 
              icon={<FiHome />} 
              text="Dashboard" 
              isActive={activeMenu === 'dashboard'} 
              onClick={() => setActiveMenu('dashboard')} 
            />
            <SidebarItem 
              icon={<FiUsers />} 
              text="Users Management" 
              isActive={activeMenu === 'users'} 
              onClick={() => setActiveMenu('users')} 
            />
            <SidebarItem 
              icon={<FiPhone />} 
              text="Phone Inspections" 
              isActive={activeMenu === 'phones'} 
              onClick={() => setActiveMenu('phones')} 
            />
            <SidebarItem 
              icon={<FiClipboard />} 
              text="Claims Management" 
              isActive={activeMenu === 'claims'} 
              onClick={() => setActiveMenu('claims')} 
            />
            <SidebarItem 
              icon={<FiShield />} 
              text="Warranty Management" 
              isActive={activeMenu === 'warranty'} 
              onClick={() => setActiveMenu('warranty')} 
            />
            {/* New Activity Logs menu item */}
            <SidebarItem 
              icon={<FiList />} 
              text="Activity Logs" 
              isActive={activeMenu === 'logs'} 
              onClick={() => setActiveMenu('logs')} 
            />
          </div>
          <SidebarItem 
              icon={<FiPartners />} 
              text="Partners" 
              isActive={activeMenu === 'partners'} 
              onClick={() => setActiveMenu('partners')} 
            />
            <SidebarItem 
              icon={<FiDollarSign />} 
              text="Fines Management" 
              isActive={activeMenu === 'fines'} 
              onClick={() => setActiveMenu('fines')} 
            />

          {/* Logout button at bottom */}
          <div className="absolute bottom-8 w-full left-0 px-4">
            <button 
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors"
            >
              <FiLogOut className="mr-3" />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="bg-white shadow-sm">
          <div className="h-16 flex items-center px-6">
            <h2 className="text-lg font-medium text-gray-900">
              {activeMenu === 'dashboard' && 'Dashboard Overview'}
              {activeMenu === 'users' && 'Users Management'}
              {activeMenu === 'phones' && 'Phone Inspections'}
              {activeMenu === 'claims' && 'Claims Management'}
              {activeMenu === 'warranty' && 'Warranty Management'}
              {activeMenu === 'logs' && 'Activity Logs'} {/* Added new title */}
              {activeMenu === 'settings' && 'Settings'}
              {activeMenu === 'partners' && 'Partners Management'}
              {activeMenu === 'fines' && 'Fine Management'}
            </h2>
          </div>
        </div>
        <div className="p-6">
          {renderContent()}
        </div>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebar}
        ></div>
      )}
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
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <span className="mr-3">{icon}</span>
      <span>{text}</span>
    </button>
  );
};

// Dashboard Content Component
const DashboardContent = () => {
  // Sample stats for the dashboard
  const [stats, setStats] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/stats/admin', {
          headers: { Authorization: `${localStorage.getItem('token')}` }
        }); // Update with your API endpoint
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
              <div className={`p-3 rounded-full ${'bg-blue-100 text-blue-600'}`}>
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
              <div className={`p-3 rounded-full bg-green-100 text-green-600`}>
              <FiPhone className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{'Phone Inspections'}</p>
                <p className="text-lg font-semibold text-gray-900">{stats.totalInspections || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${'bg-yellow-100 text-yellow-600'}`}>
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
              <div className={`p-3 rounded-full ${'bg-purple-100 text-purple-600'}`}>
              <FiShield className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Warranties Sold</p>
                <p className="text-lg font-semibold text-gray-900">{stats.totalWarranties || 0}</p>
              </div>
            </div>
          </div>
      
      </div>
      <SalesGraph/>
    </div>
  );
};


// Quick Action Button Component
const QuickActionButton = ({ text, icon, color }) => {
  return (
    <button className={`flex items-center justify-center px-4 py-3 rounded-md text-white ${color} transition-colors`}>
      <span className="mr-2">{icon}</span>
      <span>{text}</span>
    </button>
  );
};

export default AdminDashboard;