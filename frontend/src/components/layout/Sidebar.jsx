import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Sidebar = ({ role, isOpen, toggleSidebar, user }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear(); 
    toast.success('Signed out successfully', {
      style: {
        borderRadius: '12px',
        background: '#1e293b',
        color: '#fff',
        fontSize: '12px',
        fontWeight: 'bold',
      },
    });
    navigate('/login', { replace: true });
  };

  const menuConfig = {
    'super_admin': [
      { name: 'System Overview', path: '/super-admin', icon: '📊' },
      { name: 'Admins Control', path: '/super-admin/admins', icon: '🛡️' },
      { name: 'Global Branches', path: '/super-admin/branches', icon: '🌍' },
      { name: 'Societies Management', path: '/super-admin/societies', icon: '🧬' }, // الإضافة هنا
    ],
    'admin': [
      { name: 'Branch Home', path: '/admin', icon: '🏠' },
      { name: 'Volunteers List', path: '/admin/volunteers', icon: '👥' },
      { name: 'Events Plan', path: '/admin/events', icon: '📅' },
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
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-[#00629B] font-black text-xl shadow-lg">I</div>
            <span className="font-black tracking-widest uppercase text-sm">IEEE Portal</span>
          </div>
          <button onClick={toggleSidebar} className="lg:hidden p-2 hover:bg-white/10 rounded-full transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 p-6 space-y-3 overflow-y-auto mt-4">
          <p className="text-[10px] font-black text-blue-200/40 uppercase tracking-[0.4em] mb-4 px-2">Main Menu</p>
          {currentMenu.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <Link 
                key={item.path} 
                to={item.path}
                onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                className={`flex items-center space-x-4 p-4 rounded-2xl transition-all ${
                  isActive 
                  ? 'bg-white text-[#00629B] shadow-xl scale-[1.02]' 
                  : 'hover:bg-white/10 text-blue-50 opacity-80 hover:opacity-100'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-bold uppercase text-[11px] tracking-wider">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/10 bg-black/10 shrink-0">
          <div className="bg-blue-900/40 p-4 rounded-3xl border border-white/5 mb-4 hidden lg:block">
            <p className="text-[9px] font-black text-blue-300 uppercase tracking-widest leading-none mb-1 text-center">Active Session</p>
            <p className="text-[10px] text-white/60 text-center truncate italic">
              {user?.name || localStorage.getItem('user_name') || 'Member'}
            </p>
          </div>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-3 py-4 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-2xl transition-all duration-300 border border-red-500/20 group shadow-lg"
          >
            <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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