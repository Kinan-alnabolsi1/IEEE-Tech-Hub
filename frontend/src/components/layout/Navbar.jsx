import React from 'react';

const Navbar = ({ toggleSidebar, role }) => {
  return (
    <nav className="h-16 bg-white border-b border-slate-200 sticky top-0 z-40 px-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center">
        {/* زر المنيو - يظهر فقط في الموبايل */}
        <button 
          onClick={toggleSidebar} 
          className="lg:hidden p-2 mr-3 bg-slate-50 rounded-xl text-[#00629B]"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
        
        <h1 className="text-xs font-black uppercase text-slate-400 tracking-widest">
          {role === 'super_admin' ? 'Root Access' : 'Branch Access'}
        </h1>
      </div>

      <div className="w-10 h-10 bg-[#00629B] rounded-xl flex items-center justify-center text-white font-bold">
        A
      </div>
    </nav>
  );
};

export default Navbar;