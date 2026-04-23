import React from 'react';

const EmptyState = ({ icon: Icon, title, message, colorTheme = "blue" }) => {
  
  // خريطة الألوان عشان ندعم ألوان الأدمن (أصفر، أخضر، أحمر) ولون الموقع الأساسي (أزرق)
  const colorMap = {
    blue: "bg-blue-50/50 border-blue-100 text-[#00629B]",
    amber: "bg-amber-50/50 border-amber-100 text-amber-500",
    emerald: "bg-emerald-50/50 border-emerald-100 text-emerald-500",
    rose: "bg-rose-50/50 border-rose-100 text-rose-500",
  };

  const selectedTheme = colorMap[colorTheme] || colorMap.blue;

  return (
    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2.5rem] border border-dashed border-slate-200 text-center px-4 animate-in fade-in zoom-in-95 duration-500 mx-2 md:mx-4">
      <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 border shadow-sm ${selectedTheme}`}>
        {Icon && <Icon className="w-10 h-10 opacity-60" />}
      </div>
      <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-2">
        {title}
      </h3>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] max-w-sm">
        {message}
      </p>
    </div>
  );
};

export default EmptyState;