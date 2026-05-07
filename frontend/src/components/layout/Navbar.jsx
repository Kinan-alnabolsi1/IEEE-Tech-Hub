import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ toggleSidebar, role, user }) => {
  const displayName = user?.name || "Shahed Almahmod";
  // 🌟 القديم كان بيعالج المسافات بس، هلق صار يعالج المسافات والشحطة السفلية ويحولهم لشحطة عادية:
const currentRolePath = role?.toLowerCase().replace(/[\s_]+/g, '-') || 'volunteer';

  return (
    <nav className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 px-6 lg:px-10 flex items-center justify-between font-sans">
      <div className="flex items-center min-w-0">
        <button 
          onClick={toggleSidebar} 
          className="lg:hidden p-3 mr-4 bg-slate-50 rounded-2xl text-[#00629B] shadow-sm active:scale-95 transition-all"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
        
        <div className="flex flex-col text-left"> 
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] leading-none mb-1">IEEE Management</span>
          <h1 className="text-sm font-bold text-slate-700 whitespace-nowrap">
            {role === 'super_admin' ? 'Root Administration' : 'Branch Dashboard'}
          </h1>
        </div>
      </div>

      {/* 🌟 تم تحويل هذا القسم إلى Link يوجه للبروفايل */}
      <Link 
        to={`/${currentRolePath}/profile`} 
        className="flex items-center gap-4 group cursor-pointer hover:bg-slate-50 p-2 rounded-2xl transition-all"
        title="View Profile"
      >
        <div className="hidden sm:flex flex-col items-end min-w-fit">
          <p className="text-[13px] font-black text-slate-800 leading-none uppercase tracking-tighter whitespace-nowrap italic group-hover:text-[#00629B] transition-colors">
            {displayName}
          </p>
          <p className="text-[9px] text-blue-600 font-bold mt-1.5 uppercase tracking-widest italic">
            {user?.branch || 'IEEE Branch'}
          </p>
        </div>

        <div className={`w-11 h-11 flex-shrink-0 rounded-2xl flex items-center justify-center text-white text-sm font-black shadow-lg shadow-blue-100 border-2 border-white group-hover:scale-105 transition-transform
          ${role === 'super_admin' ? 'bg-indigo-600' : 'bg-[#00629B]'}`}>
          {displayName.charAt(0).toUpperCase()}
        </div>
      </Link>
    </nav>
  );
};

export default Navbar;