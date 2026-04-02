import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const DashboardLayout = ({ role }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // محاكاة جلب بيانات (Mock Data)
    const timer = setTimeout(() => {
      setUserData({
        name: role === 'super_admin' ? "Ahmad Admin" : "Samer Branch",
        branch: role === 'super_admin' ? "Main HQ" : "Damascus University",
        id: "12345"
      });
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [role]);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-blue-600 animate-pulse uppercase tracking-[0.3em]">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex relative overflow-x-hidden">
      {/* السايدبار كامل الشاشة في الموبايل */}
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
            {/* هون السر: لازم نمرر userData جوا كائن للـ context */}
            <Outlet context={{ user: userData }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;