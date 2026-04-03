import React from 'react';

const Loader = ({ message = "Processing..." }) => {
  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-white/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative flex items-center justify-center">
        {/* الدائرة الخارجية المتحركة */}
        <div className="w-20 h-20 border-4 border-slate-100 border-t-[#00629B] rounded-full animate-spin"></div>
        
        {/* اللوغو الصغير في المنتصف */}
        <div className="absolute w-10 h-10 bg-[#00629B] rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
          <span className="text-white font-black text-xs">I</span>
        </div>
      </div>
      
      {/* نص الانتظار */}
      <p className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 animate-pulse">
        {message}
      </p>
    </div>
  );
};

export default Loader;