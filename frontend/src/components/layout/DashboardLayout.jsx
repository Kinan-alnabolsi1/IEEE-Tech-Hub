import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Loader from '@/components/ui/Loader'; // تأكدي من مسار اللودر

const DashboardLayout = ({ role }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
    // 1. جلب البيانات من الـ Local Storage
    let savedName = localStorage.getItem('user_name');
    const savedRole = localStorage.getItem('user_role');
    const savedBranch = localStorage.getItem('branch_name');

    // 🌟 التعديل السحري: المتصفح أحياناً بيحفظ كلمة "undefined" كنص! 
    // هاد السطر بينظف أي قيمة وهمية أو فاضية وبيجبره ياخد الاسم الافتراضي الفخم
    if (!savedName || savedName === 'undefined' || savedName === 'null' || savedName.trim() === '') {
      savedName = role === 'super_admin' ? "System Administrator" : "Branch Admin";
    }

    setUserData({
      name: savedName,
      role: role, 
      branch: role === 'super_admin' ? "MAIN HQ" : (savedBranch || "IEEE Branch"),
    });

    setLoading(false);
  }, [role]);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  if (loading) return <Loader message="Setting up your dashboard..." />;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex relative overflow-x-hidden">
      {/* Sidebar */}
      <Sidebar 
        role={role} 
        isOpen={isSidebarOpen} 
        toggleSidebar={() => setSidebarOpen(false)} 
        user={userData} 
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-64'}`}>
        {/* نمرر الـ userData والـ role للنافبار ليعرف يلون ويعرض صح */}
        <Navbar toggleSidebar={toggleSidebar} role={role} user={userData} />
        
        <main className="p-4 md:p-8 flex-grow animate-in fade-in duration-500">
          <div className="max-w-7xl mx-auto">
            <Outlet context={{ user: userData }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;