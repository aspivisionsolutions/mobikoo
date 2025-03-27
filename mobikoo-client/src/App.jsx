import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import PhoneCheckerLayout from './layouts/PhoneCheckerLayout';
import ShopOwnerLayout from './components/ShopOwnerLayout';
import PhoneCheckerDashboard from './pages/PhoneChecker/PhoneCheckerDashboard';
import ShopOwnerDashboard from './pages/ShopOwner/ShopOwnerDashboard';
import ShopOwnerProfile from './pages/ShopOwner/ShopOwnerProfile';
import InspectionRequests from './pages/PhoneChecker/InspectionRequests';
import PhoneReports from './pages/PhoneChecker/PhoneReports';
import InspectionReportView from './pages/InspectionReportView';
import PhoneCheckerProfile from './pages/PhoneChecker/PhoneCheckerProfile';
import LandingPage from './pages/LandingPage';
import './App.css';
import CustomerWarrantyDetails from './components/CustomerWarrantyDetails';
import AdminDashboard from './pages/Admin/AdminDashboard';
import InspectionReportDetails from './components/InspectionReportDetails';
import PhoneCheckerFinesPanel from './pages/PhoneChecker/Fines';
import Invoices from './pages/ShopOwner/Invoices';
import ProtectedRoute from './ProtectedRoute'; // Import the ProtectedRoute

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin/signup/createUser" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Phone Checker Routes - Protected */}
        <Route path="/phone-checker" element={<ProtectedRoute element={<PhoneCheckerLayout />} />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ProtectedRoute element={<PhoneCheckerDashboard />} />} />
          <Route path="profile" element={<ProtectedRoute element={<PhoneCheckerProfile />} />} />
          <Route path="inspections" element={<ProtectedRoute element={<InspectionRequests />} />} />
          <Route path="reports" element={<ProtectedRoute element={<PhoneReports />} />} />
          <Route path="fines" element={<ProtectedRoute element={<PhoneCheckerFinesPanel />} />} />
          <Route path="reports/:reportId" element={<ProtectedRoute element={<InspectionReportView />} />} />
          <Route path="schedule" element={<ProtectedRoute element={<div>Schedule Page (Coming Soon)</div>} />} />
          <Route path="settings" element={<ProtectedRoute element={<div>Settings Page (Coming Soon)</div>} />} />
        </Route>

        {/* Shop Owner Routes - Protected */}
        <Route path="/shop-owner" element={<ProtectedRoute element={<ShopOwnerLayout />} />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ProtectedRoute element={<ShopOwnerDashboard />} />} />
          <Route path="dashboard/inspections" element={<ProtectedRoute element={<ShopOwnerDashboard />} />} />
          <Route path="dashboard/warranties" element={<ProtectedRoute element={<ShopOwnerDashboard />} />} />
          <Route path="dashboard/claims" element={<ProtectedRoute element={<ShopOwnerDashboard />} />} />
          <Route path="profile" element={<ProtectedRoute element={<ShopOwnerProfile />} />} />
          <Route path="reports/:reportId" element={<ProtectedRoute element={<InspectionReportView />} />} />
          <Route path="dashboard/invoices" element={<ProtectedRoute element={<Invoices />} />} />
        </Route>

        {/* Admin Dashboard - Protected */}
        <Route path='/admin/dashboard' element={<ProtectedRoute element={<AdminDashboard />} />} />

        {/* Warranty Details - Protected */}
        <Route path="/warranty-details" element={<ProtectedRoute element={<CustomerWarrantyDetails />} />} />
      </Routes>
    </Router>
  );
};

export default App;
