import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/apiMethods'; 
import toast from 'react-hot-toast';
import logo from '../../assets/IEEELogo2-removebg-preview.png';

const Sidebar = ({ role, isOpen, toggleSidebar, user }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    console.log("Checking Storage Keys:", Object.keys(localStorage)); 
  const token = localStorage.getItem('ieee_token');
  console.log("Token Value:", token);
    console.log("%c--- 🚀 Logout Process Started ---", "color: #00629B; font-weight: bold;");
    
    // التأكد من وجود التوكن قبل البدء
    const currentToken = localStorage.getItem('ieee_token');
    console.log("1. Current Token in Storage:", currentToken ? "✅ Found" : "❌ Not Found");

    try {
      console.log("2. Sending POST request to /logout...");
      
      // طلب الـ Logout (التوكن سيمر عبر interceptor تلقائياً)
      const response = await api.post('/logout');

      console.log("3. API Response Success:", response.data);
      
    } catch (err) {
      // طباعة الخطأ بشكل مفصل في الكونسول
      console.error("3. API Logout Error Details:");
      console.log("Status Code:", err.response?.status);
      console.log("Error Message:", err.response?.data?.message || err.message);
      
      if (err.response?.status === 401) {
        console.warn("⚠️ Token might be expired or invalid already.");
      }
    } finally {
      console.log("4. Final Step: Cleaning LocalStorage and Navigating...");
      
      // مسح البيانات محلياً بغض النظر عن نتيجة السيرفر لضمان خروج المستخدم
      localStorage.clear();
      console.log("LocalStorage Cleared ✅");

      toast.success('Signed out successfully', {
        style: {
          borderRadius: '12px',
          background: '#1e293b',
          color: '#fff',
          fontSize: '12px',
          fontWeight: 'bold',
        },
      });

      console.log("--- 🏁 Logout Finished ---");
      navigate('/', { replace: true });
    }
  };

  const menuConfig = {
    'super_admin': [
      { name: 'System Overview', path: '/super-admin', icon: '📊' },
      { name: 'Admins Control', path: '/super-admin/admins', icon: '🛡️' },
      { name: 'Global Branches', path: '/super-admin/branches', icon: '🌍' },
      { name: 'Societies Management', path: '/super-admin/societies', icon: '🧬' },
      // { name: 'Reports Monitor', path: '/super-admin/reports', icon: '📄' },
    ],
    'admin': [
    { name: 'Branch Dashboard', path: '/admin', icon: '🏠' },            // الصفحة 1
    { name: 'Volunteer Members', path: '/admin/volunteers', icon: '👥' }, // الصفحة 2
    { name: 'Technical Chapters', path: '/admin/chapters', icon: '⚙️' },  // الصفحة 3
    { name: 'Project Approvals', path: '/admin/projects', icon: '🚀' },  // الصفحة 4
    // { name: 'Branch Reports', path: '/admin/reports', icon: '📝' },      // الصفحة 5
  ],
    'volunteer': [
      { name: 'My Tasks', path: '/admin', icon: '📋' },
      { name: 'Events', path: '/admin/events', icon: '📅' },
    ]
  };

  const currentRole = role?.toLowerCase().replace(/\s+/g, '_') || '';
  const currentMenu = menuConfig[currentRole] || [];

  return (
    <>
      <aside className={`
        fixed inset-0 z-[100] bg-[#00629B] text-white transition-transform duration-500 ease-in-out transform flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 lg:w-64 lg:inset-y-0 lg:left-0 lg:z-50
      `}>
        
        <div className="h-20 flex items-center justify-between px-8 border-b border-white/10 shrink-0">
          <div className="flex items-center space-x-3">
            <img className='w-10' src={logo} alt="IEEE Logo"/>
            <span className="font-black tracking-widest uppercase text-sm italic">IEEE Tech-Hub</span>
          </div>
          <button onClick={toggleSidebar} className="lg:hidden p-2 hover:bg-white/10 rounded-full transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto mt-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style>{`nav::-webkit-scrollbar { display: none; }`}</style>
          <p className="text-[9px] font-black text-blue-200/30 uppercase tracking-[0.4em] mb-4 px-3">Main Menu</p>
          {currentMenu.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                className={`flex items-center space-x-3 p-3.5 rounded-xl transition-all ${
                  isActive 
                  ? 'bg-white text-[#00629B] shadow-lg scale-[1.02]' 
                  : 'hover:bg-white/10 text-blue-50 opacity-80 hover:opacity-100'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-bold uppercase text-[10px] tracking-wider">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 bg-black/5 shrink-0">
          <div className="bg-blue-900/30 px-4 py-3 rounded-2xl border border-white/5 mb-3 flex items-center justify-between shadow-inner">
            <div className="flex flex-col ">
              <p className="text-[8px] font-black text-blue-300 uppercase tracking-widest leading-none mb-1">Active</p>
              <p className="text-[10px] text-white font-bold truncate italic">
                {user?.name || localStorage.getItem('user_name') || 'Member'}
              </p>
            </div>
            <div className="bg-emerald-500/20 px-2 py-1 rounded-md shrink-0 border border-emerald-500/10">
              <p className="text-[7px] text-emerald-400 font-black uppercase tracking-tighter">
                {role?.replace('_', ' ') || 'System Admin'}
              </p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-3 py-3.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-xl transition-all duration-300 border border-red-500/20 group shadow-lg"
          >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;