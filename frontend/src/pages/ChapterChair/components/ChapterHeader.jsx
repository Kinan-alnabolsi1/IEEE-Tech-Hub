import React from 'react';

const ChapterHeader = ({ title, subtitle, chapterName }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm mb-8">
      <div>
        <h1 className="text-3xl font-black text-[#00629B] uppercase italic tracking-tighter">{title}</h1>
        <p className="text-slate-400 mt-1 text-[10px] font-bold tracking-[0.3em] uppercase">{subtitle}</p>
      </div>
      <div className="bg-blue-50 border border-blue-100 px-6 py-3 rounded-2xl flex flex-col justify-center">
        <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest block mb-1">Current Chapter</span>
        <span className="text-sm font-black text-slate-700 uppercase italic">{chapterName || "Loading..."}</span>
      </div>
    </div>
  );
};

export default ChapterHeader;