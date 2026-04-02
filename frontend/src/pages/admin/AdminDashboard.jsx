import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import Navbar from '../../components/layout/Navbar';

const AdminDashboard = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // بيانات وهمية خاصة بالأدمن فقط
  const adminData = {
    name: "Samer Branch Manager",
    role: "admin",
    branch: "Damascus University"
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex relative overflow-x-hidden">
      {/* 1. السايدبار مخصص للأدمن */}
      <Sidebar 
        role="admin" 
        isOpen={isSidebarOpen} 
        toggleSidebar={() => setSidebarOpen(false)} 
        user={adminData} 
      />

      <div className="flex-1 flex flex-col min-w-0 lg:ml-64 transition-all duration-300">
        {/* 2. النافبار مخصص للأدمن */}
        <Navbar 
          toggleSidebar={() => setSidebarOpen(true)} 
          role="admin" 
          user={adminData} 
        />
        
        {/* 3. هنا تتبدل الصفحات (Home, Volunteers, Events) */}
        <main className="p-4 md:p-8 flex-grow">
          <div className="max-w-7xl mx-auto">
             <Outlet context={{ user: adminData }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;