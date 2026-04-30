import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Loader from '@/components/ui/Loader'; 

const DashboardLayout = ({ role }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let savedName = localStorage.getItem('user_name') || "Admin";
    setUserData({ name: savedName, role: role });
    setLoading(false);
  }, [role]);

  if (loading) return <Loader />;

  return (
    // 🌟 استخدمنا min-h-screen و flex بدون overflow-hidden
    <div className="min-h-screen bg-[#F8FAFC] flex relative overflow-y-auto ">
      
      {/* السايد بار */}
      <Sidebar 
        role={role} 
        isOpen={isSidebarOpen} 
        toggleSidebar={() => setSidebarOpen(false)} 
        user={userData} 
      />

      {/* منطقة المحتوى */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <Navbar toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} role={role} user={userData} />
        
        {/* الماين: هو اللي رح يتمدد ويسمح بالسكرول */}
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto pb-24">
            <Outlet context={{ user: userData }} />
          </div>
        </main>
      </div>

      {/* غطاء الموبايل */}
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