import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import PhoneCheckerLayout from './components/PhoneCheckerLayout';
import PhoneCheckerDashboard from './pages/PhoneChecker/PhoneCheckerDashboard';
import ClaimRequests from './pages/PhoneChecker/ClaimRequests';
import InspectionRequests from './pages/PhoneChecker/InspectionRequests';
import PhoneReports from './pages/PhoneChecker/PhoneReports';
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
          <Route path="claims" element={<ClaimRequests requests={[]} onStatusUpdate={() => {}} standalone={true} />} />
          <Route path="inspections" element={<InspectionRequests requests={[]} onStatusUpdate={() => {}} standalone={true} />} />
          <Route path="reports" element={<PhoneReports reports={[]} standalone={true} />} />
          <Route path="schedule" element={<div>Schedule Page (Coming Soon)</div>} />
          <Route path="settings" element={<div>Settings Page (Coming Soon)</div>} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
