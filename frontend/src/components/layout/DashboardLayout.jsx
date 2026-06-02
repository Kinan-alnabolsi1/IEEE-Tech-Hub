import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import RoleSyncWatcher from '@/components/ui/RoleSyncWatcher'; 

const DashboardLayout = ({ role }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const savedName = localStorage.getItem('user_name') || "User";
  const userData = { name: savedName, role: role };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex relative overflow-y-auto">
      
      <Sidebar 
        role={role} 
        isOpen={isSidebarOpen} 
        toggleSidebar={() => setSidebarOpen(false)} 
        user={userData} 
      />

      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <Navbar toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} role={role} user={userData} />
        
        <RoleSyncWatcher role={role} />
        
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto pb-24">
            <Outlet context={{ user: userData }} />
          </div>
        </main>
      </div>

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-[40] bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;