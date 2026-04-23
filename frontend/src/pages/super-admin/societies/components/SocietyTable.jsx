import React from 'react';
import { Edit2, Trash2, Globe, Tag, Layers } from 'lucide-react';
// 🌟 استدعاء مكون الـ EmptyState
import EmptyState from '../../../../components/ui/EmptyState';

const SocietyTable = ({ societies, onDelete, onEdit }) => {
  
  const getStatusStyle = (status) => {
    const s = status?.toLowerCase();
    if (s === 'active') return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (s === 'inactive') return 'bg-rose-50 text-rose-600 border-rose-100';
    return 'bg-amber-50 text-amber-600 border-amber-100';
  };

  // 🌟 استخدام EmptyState الموحد
  if (!societies || societies.length === 0) {
    return (
      <EmptyState 
        icon={Layers} 
        title="No Societies Found" 
        message="The directory is currently empty. Add a new society to begin integration."
      />
    );
  }

  return (
    // 🌟 Responsive wrapper for table
    <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.02)] border border-slate-100 overflow-x-auto no-scrollbar">
      <table className="w-full text-left border-separate border-spacing-0 min-w-[800px]">
        <thead>
          <tr className="bg-slate-50/50">
            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-100">Society Name</th>
            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-100">Abbreviation</th>
            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-100">Classification</th>
            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-100">Status</th>
            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-100 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {societies.map((soc) => (
            <tr key={soc.id || soc.society_id} className="hover:bg-blue-50/30 transition-all duration-200">
              <td className="px-8 py-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#00629B]/10 flex items-center justify-center text-[#00629B] font-bold">
                    {soc.name?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 uppercase tracking-tight">{soc.name}</div>
                    <div className="text-[9px] text-slate-400 font-medium">Official IEEE Entity</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-5">
                <div className="flex items-center gap-2">
                  <Tag className="w-3 h-3 text-[#00629B] opacity-40" />
                  <span className="text-[10px] font-black text-[#00629B] uppercase tracking-wider">
                    {soc.abbreviation || soc.abbr || '---'}
                  </span>
                </div>
              </td>
              <td className="px-6 py-5">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase">
                  <Globe className="w-3.5 h-3.5 text-slate-300" />
                  {soc.classification || 'Standard'}
                </div>
              </td>
              <td className="px-6 py-5">
                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter border ${getStatusStyle(soc.status)}`}>
                  {soc.status || 'Active'}
                </span>
              </td>
              <td className="px-8 py-5">
                <div className="flex justify-center items-center gap-3">
                  <button 
                    onClick={() => onEdit(soc)}
                    className="p-2.5 bg-slate-50 hover:bg-blue-100 text-slate-500 hover:text-[#00629B] rounded-xl transition-all shadow-sm border border-slate-100"
                    title="Edit Society"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => onDelete(soc.id || soc.society_id)}
                    className="p-2.5 bg-slate-50 hover:bg-red-100 text-slate-500 hover:text-red-600 rounded-xl transition-all shadow-sm border border-slate-100"
                    title="Delete Society"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SocietyTable;  