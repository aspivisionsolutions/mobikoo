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
import AdminDashboard from './pages/Admin/AdminDashboard';
import InspectionReportDetails from './components/InspectionReportDetails';
import PhoneCheckerFinesPanel from './pages/PhoneChecker/Fines';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Phone Checker Routes */}
        <Route path="/phone-checker" element={<PhoneCheckerLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<PhoneCheckerDashboard />} />
          <Route path="profile" element={<PhoneCheckerProfile />} />
          <Route path="inspections" element={<InspectionRequests />} />
          <Route path="reports" element={<PhoneReports />} />
          <Route path="fines" element={<PhoneCheckerFinesPanel />} />
          <Route path="reports/:reportId" element={<InspectionReportView />} />
          <Route path="schedule" element={<div>Schedule Page (Coming Soon)</div>} />
          <Route path="settings" element={<div>Settings Page (Coming Soon)</div>} />
        </Route>

        {/* Shop Owner Routes */}
        <Route path="/shop-owner" element={<ShopOwnerLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ShopOwnerDashboard />} />
          <Route path="dashboard/inspections" element={<ShopOwnerDashboard />} />
          <Route path="dashboard/warranties" element={<ShopOwnerDashboard />} />
          <Route path="dashboard/claims" element={<ShopOwnerDashboard />} />
          <Route path="profile" element={<ShopOwnerProfile />} />
          <Route path="reports/:reportId" element={<InspectionReportView />} />
        </Route>

        <Route path='/admin/dashboard' element={<AdminDashboard/>}/>
      </Routes>
    </Router>
  );
};

export default App;
