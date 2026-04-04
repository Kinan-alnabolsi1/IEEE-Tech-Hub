import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const DashboardLayout = ({ role }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // جلب البيانات المخزنة عند تسجيل الدخول
    const savedName = localStorage.getItem('user_name');
    const savedRole = localStorage.getItem('user_role');

    const timer = setTimeout(() => {
      setUserData({
        name: savedName || (role === 'super_admin' ? "Ahmad Admin" : "Samer Branch"),
        role: savedRole || role,
        branch: role === 'super_admin' ? "Main HQ" : "Damascus University",
      });
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [role]);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="font-black text-blue-600 uppercase tracking-[0.3em] text-xs">Loading System...</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex relative overflow-x-hidden">
      <Sidebar 
        role={role} 
        isOpen={isSidebarOpen} 
        toggleSidebar={() => setSidebarOpen(false)} 
        user={userData} 
      />

      <div className="flex-1 flex flex-col min-w-0 lg:ml-64 transition-all duration-300">
        <Navbar toggleSidebar={toggleSidebar} role={role} user={userData} />
        
        <main className="p-4 md:p-8 flex-grow">
          <div className="max-w-7xl mx-auto">
            {/* هنا يظهر محتوى الصفحة الابنة */}
            <Outlet context={{ user: userData }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;