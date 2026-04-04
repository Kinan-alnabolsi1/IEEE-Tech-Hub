import React from 'react';
import { MoreVertical, Edit2, Trash2, Box } from 'lucide-react';

const SocietyTable = ({ societies, onEdit, onDelete }) => {
  return (
    <table className="w-full text-left border-separate border-spacing-y-3">
      <thead>
        <tr className="text-[#00629B] opacity-70">
          <th className="px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em]">Society Name</th>
          <th className="px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em]">Abbr.</th>
          <th className="px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em]">Classification</th>
          <th className="px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-center">Status</th>
          <th className="px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-right pr-10">Actions</th>
        </tr>
      </thead>
      <tbody>
        {societies.map((soc, index) => (
          <tr key={soc.id} className="bg-white hover:shadow-md transition-all duration-300">
            <td className="px-6 py-5 rounded-l-[1.5rem] border-y border-l border-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Box className="w-4 h-4 text-[#00629B]" />
                </div>
                <span className="font-black text-slate-700 text-sm italic uppercase">{soc.name}</span>
              </div>
            </td>
            <td className="px-6 py-5 border-y border-slate-50">
              <span className="bg-slate-50 text-[#00629B] px-3 py-1 rounded-lg text-[10px] font-black uppercase">
                {soc.abbreviation}
              </span>
            </td>
            <td className="px-6 py-5 border-y border-slate-50">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">
                {soc.classification}
              </span>
            </td>
            <td className="px-6 py-5 border-y border-slate-50 text-center">
              <span className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase border border-emerald-100">
                {soc.status}
              </span>
            </td>
            <td className="px-6 py-5 rounded-r-[1.5rem] border-y border-r border-slate-50 text-right pr-6">
              <div className="relative inline-block group/menu">
                <button className="p-2.5 hover:bg-slate-50 rounded-xl transition-all text-slate-400">
                  <MoreVertical className="w-5 h-5" />
                </button>
                <div className={`absolute right-0 w-48 bg-white border border-slate-100 rounded-[1.5rem] shadow-2xl py-3 z-[9999] hidden group-hover/menu:block animate-in fade-in zoom-in-95 duration-200
                  ${index >= societies.length - 2 && societies.length > 3 ? 'bottom-full mb-2' : 'top-full mt-1'}
                `}>
                  <button onClick={() => onEdit(soc)} className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black text-slate-600 hover:bg-slate-50 uppercase tracking-widest transition-colors text-left">
                    <Edit2 className="w-3.5 h-3.5 text-blue-500" /> Edit Details
                  </button>
                  <button onClick={() => onDelete(soc.id)} className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black text-red-500 hover:bg-red-50 uppercase tracking-widest transition-colors text-left">
                    <Trash2 className="w-3.5 h-3.5" /> Delete Society
                  </button>
                </div>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default SocietyTable;