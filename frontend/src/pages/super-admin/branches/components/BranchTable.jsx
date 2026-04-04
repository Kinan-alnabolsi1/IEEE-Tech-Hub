import React from 'react';
import { MoreVertical, Edit2, Trash2, ShieldOff, CheckCircle, MapPin, Building2 } from 'lucide-react';

const BranchTable = ({ branches, onEdit, onDelete, onToggleStatus }) => {
  return (
    <table className="w-full text-left border-separate border-spacing-y-3">
      <thead>
        <tr className="text-[#00629B] opacity-70">
          <th className="px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em]">Branch Name</th>
          <th className="px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em]">Region</th>
          <th className="px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em]">Manager</th>
          <th className="px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-center">Status</th>
          <th className="px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-right pr-10">Actions</th>
        </tr>
      </thead>
      <tbody>
        {branches.map((branch, index) => (
          <tr key={branch.id} className="bg-white hover:shadow-md transition-all duration-300 group">
            {/* 1. اسم الفرع */}
            <td className="px-6 py-5 rounded-l-[1.5rem] border-y border-l border-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                   <Building2 className="w-4 h-4 text-[#00629B]" />
                </div>
                <span className="font-black text-slate-700 text-sm tracking-tight">{branch.name}</span>
              </div>
            </td>

            {/* 2. المنطقة (عمود مستقل) */}
            <td className="px-6 py-5 border-y border-slate-50">
              <div className="flex items-center gap-2 text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-slate-300" />
                <span className="text-xs font-bold uppercase tracking-wide">{branch.region}</span>
              </div>
            </td>

            {/* 3. المدير */}
            <td className="px-6 py-5 border-y border-slate-50">
              <span className="text-sm text-slate-600 font-bold">{branch.manager}</span>
            </td>

            {/* 4. الحالة */}
            <td className="px-6 py-5 border-y border-slate-50 text-center">
              <span className={`inline-block px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider ${
                branch.status === 'Active' 
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                : 'bg-red-50 text-red-600 border border-red-100'
              }`}>
                {branch.status}
              </span>
            </td>

            {/* 5. العمليات */}
            <td className="px-6 py-5 rounded-r-[1.5rem] border-y border-r border-slate-50 text-right pr-6">
              <div className="relative inline-block group/menu">
                <button className="p-2.5 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-[#00629B]">
                  <MoreVertical className="w-5 h-5" />
                </button>

                {/* المنيو العائمة */}
                <div className={`absolute right-0 w-56 bg-white border border-slate-100 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.12)] py-3 z-[9999] hidden group-hover/menu:block animate-in fade-in zoom-in-95 duration-200
                  ${index >= branches.length - 2 && branches.length > 3 ? 'bottom-full mb-2' : 'top-full mt-1'}
                `}>
                  <p className="px-4 py-2 text-[9px] font-black text-slate-300 uppercase tracking-widest border-b border-slate-50 mb-1">Control Panel</p>
                  
                  <button onClick={() => onEdit(branch)} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                    <Edit2 className="w-4 h-4 text-blue-500" /> Edit Branch
                  </button>
                  
                  <button onClick={() => onToggleStatus(branch)} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                    {branch.status === 'Active' ? <ShieldOff className="w-4 h-4 text-amber-500" /> : <CheckCircle className="w-4 h-4 text-emerald-500" />}
                    {branch.status === 'Active' ? 'Deactivate' : 'Activate'}
                  </button>

                  <div className="my-2 border-t border-slate-50 mx-2"></div>
                  
                  <button onClick={() => onDelete(branch.id)} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 className="w-4 h-4" /> Delete Permanently
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

export default BranchTable;