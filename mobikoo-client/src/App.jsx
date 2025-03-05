import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import PhoneCheckerLayout from './layouts/PhoneCheckerLayout';
import ShopOwnerLayout from './components/ShopOwnerLayout';
import PhoneCheckerDashboard from './pages/PhoneChecker/PhoneCheckerDashboard';
import ShopOwnerDashboard from './pages/ShopOwner/ShopOwnerDashboard';
import ShopOwnerProfile from './pages/ShopOwner/ShopOwnerProfile';
import ClaimRequests from './pages/PhoneChecker/ClaimRequests';
import InspectionRequests from './pages/PhoneChecker/InspectionRequests';
import PhoneReports from './pages/PhoneChecker/PhoneReports';
import InspectionReportView from './pages/InspectionReportView';
import PhoneCheckerProfile from './pages/PhoneChecker/PhoneCheckerProfile';
import './App.css';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Phone Checker Routes */}
        <Route path="/phone-checker" element={<PhoneCheckerLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<PhoneCheckerDashboard />} />
          <Route path="profile" element={<PhoneCheckerProfile />} />
          <Route path="claims" element={<ClaimRequests />} />
          <Route path="inspections" element={<InspectionRequests />} />
          <Route path="reports" element={<PhoneReports />} />
          <Route path="reports/:reportId" element={<InspectionReportView />} />
          <Route path="schedule" element={<div>Schedule Page (Coming Soon)</div>} />
          <Route path="settings" element={<div>Settings Page (Coming Soon)</div>} />
        </Route>

        {/* Shop Owner Routes */}
        <Route path="/shop-owner" element={<ShopOwnerLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ShopOwnerDashboard />} />
          <Route path="profile" element={<ShopOwnerProfile />} />
          <Route path="reports/:reportId" element={<InspectionReportView />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
