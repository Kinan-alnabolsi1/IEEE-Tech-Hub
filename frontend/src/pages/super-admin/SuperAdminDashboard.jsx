import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import Navbar from '../../components/layout/Navbar';

const SuperAdminDashboard = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const superData = {
    name: "Ahmad Master",
    role: "super_admin",
    badge: "System Owner"
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex relative overflow-x-hidden">
      <Sidebar 
        role="super_admin" 
        isOpen={isSidebarOpen} 
        toggleSidebar={() => setSidebarOpen(false)} 
        user={superData} 
      />

      <div className="flex-1 flex flex-col min-w-0 lg:ml-64 transition-all duration-300">
        <Navbar 
          toggleSidebar={() => setSidebarOpen(true)} 
          role="super_admin" 
          user={superData} 
        />
        
        <main className="p-4 md:p-8 flex-grow">
          <Outlet context={{ user: superData }} />
        </main>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;