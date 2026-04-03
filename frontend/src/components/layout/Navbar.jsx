import React from 'react';

const Navbar = ({ toggleSidebar, role, user }) => {
  return (
    <nav className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 px-6 lg:px-10 flex items-center justify-between">
      <div className="flex items-center">
        {/* زر المنيو للموبايل */}
        <button 
          onClick={toggleSidebar} 
          className="lg:hidden p-3 mr-4 bg-slate-50 rounded-2xl text-[#00629B] shadow-sm active:scale-90 transition-transform"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
        
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] leading-none mb-1">IEEE Management</span>
          <h1 className="text-sm font-bold text-slate-700">
            {role === 'super_admin' ? 'Root Administration' : 'Branch Dashboard'}
          </h1>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="hidden sm:flex flex-col items-end">
          <p className="text-[11px] font-bold text-slate-800 leading-none">{user?.name || 'Ahmad Master'}</p>
          <p className="text-[9px] text-blue-500 font-medium mt-1 uppercase tracking-tighter italic">
            {role === 'super_admin' ? 'System Owner' : user?.branch}
          </p>
        </div>
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-blue-200 
          ${role === 'super_admin' ? 'bg-indigo-600' : 'bg-[#00629B]'}`}>
          {user?.name?.charAt(0) || 'A'}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;