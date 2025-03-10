import React, { useState } from 'react';
import { 
  FiHome, 
  FiUsers, 
  FiPhone, 
  FiClipboard, 
  FiSettings, 
  FiLogOut, 
  FiMenu, 
  FiX,
  FiShield,
  FiList
} from 'react-icons/fi';
import AdminLogsTable from './AdminLogsTable'; // Import the new component
import PhoneInspectionTable from './PhoneInspectionTable';
import WarrantiesManagement from './WarrantiesManagement';

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('dashboard');

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <DashboardContent />;
      case 'users':
        return <div className="p-6">Users Management Content</div>;
        case 'phones':
          return <PhoneInspectionTable />;
      case 'claims':
        return <div className="p-6">Claims Management Content</div>;
      case 'warranty':
        return <WarrantiesManagement />;
      case 'logs':
        return <AdminLogsTable />; // Added the logs component here
      case 'settings':
        return <div className="p-6">Settings Content</div>;
      default:
        return <DashboardContent />;
    }
  };

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
            <SidebarItem 
              icon={<FiSettings />} 
              text="Settings" 
              isActive={activeMenu === 'settings'} 
              onClick={() => setActiveMenu('settings')} 
            />
          </div>

          {/* Logout button at bottom */}
          <div className="absolute bottom-8 w-full left-0 px-4">
            <button 
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
  const stats = [
    { title: 'Total Users', value: '1,243', icon: <FiUsers className="h-6 w-6" />, color: 'bg-blue-100 text-blue-600' },
    { title: 'Phone Inspections', value: '867', icon: <FiPhone className="h-6 w-6" />, color: 'bg-green-100 text-green-600' },
    { title: 'Active Claims', value: '28', icon: <FiClipboard className="h-6 w-6" />, color: 'bg-yellow-100 text-yellow-600' },
    { title: 'Warranties Sold', value: '432', icon: <FiShield className="h-6 w-6" />, color: 'bg-purple-100 text-purple-600' }
  ];

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${stat.color}`}>
                {stat.icon}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Recent Activity Section */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {/* Sample activity items */}
            <ActivityItem 
              title="New user registered" 
              description="John Doe created a new account" 
              time="2 hours ago" 
            />
            <ActivityItem 
              title="Phone inspection completed" 
              description="Samsung Galaxy S21 inspection report submitted by Shop #1234" 
              time="3 hours ago" 
            />
            <ActivityItem 
              title="Warranty purchased" 
              description="Premium protection plan purchased for iPhone 14" 
              time="5 hours ago" 
            />
            <ActivityItem 
              title="Claim approved" 
              description="Claim #2345 has been approved for processing" 
              time="1 day ago" 
            />
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <QuickActionButton text="Add New User" icon={<FiUsers />} color="bg-blue-600 hover:bg-blue-700" />
            <QuickActionButton text="Schedule Inspection" icon={<FiPhone />} color="bg-green-600 hover:bg-green-700" />
            <QuickActionButton text="Process Claim" icon={<FiClipboard />} color="bg-yellow-600 hover:bg-yellow-700" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Activity Item Component
const ActivityItem = ({ title, description, time }) => {
  return (
    <div className="flex items-start border-b border-gray-100 pb-4">
      <div className="w-full">
        <h4 className="text-sm font-medium text-gray-900">{title}</h4>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
        <p className="text-xs text-gray-400 mt-1">{time}</p>
      </div>
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