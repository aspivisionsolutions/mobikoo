import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const PhoneCheckerLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className=" pt-0 h-[50vh]">
        <main className="h-[50vh]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PhoneCheckerLayout; 