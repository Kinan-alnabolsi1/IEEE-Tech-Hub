import React from 'react';
import { MoreVertical, Edit2, Trash2, MapPin, Building2, ShieldOff, CheckCircle } from 'lucide-react';

const BranchTable = ({ branches = [], onEdit, onDelete, onToggleStatus }) => {
  return (
    /* pb-40 لضمان وجود مساحة للمنيو في آخر سطر */
    <div className="overflow-visible pb-40">
      <table className="w-full text-left border-separate border-spacing-y-4">
        <thead>
          <tr className="text-[#00629B] opacity-60">
            <th className="px-8 py-3 text-[10px] font-black uppercase tracking-[0.25em]">Branch Identity</th>
            <th className="px-8 py-3 text-[10px] font-black uppercase tracking-[0.25em]">Location</th>
            <th className="px-8 py-3 text-[10px] font-black uppercase tracking-[0.25em]">Branch Manager</th>
            <th className="px-8 py-3 text-[10px] font-black uppercase tracking-[0.25em] text-center">Status</th>
            <th className="px-8 py-3 text-[10px] font-black uppercase tracking-[0.25em] text-right pr-12">Control</th>
          </tr>
        </thead>
        <tbody className="overflow-visible">
          {branches.map((branch, index) => {
            const isActive = branch.status?.toLowerCase() === 'active';
            
            return (
              <tr key={branch.branch_id || index} className="bg-white hover:shadow-[0_10px_30px_-15px_rgba(0,98,155,0.1)] transition-all duration-500 group overflow-visible">
                <td className="px-8 py-6 rounded-l-[2.5rem] border-y border-l border-slate-50">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl group-hover:rotate-6 transition-transform duration-300">
                      <Building2 className="w-5 h-5 text-[#00629B]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-black text-slate-800 text-sm tracking-tighter italic uppercase">{branch.name}</span>
                      <span className="text-[9px] text-slate-300 font-bold uppercase tracking-widest mt-0.5">IEEE Infrastructure</span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 border-y border-slate-50">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-300" />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-600 italic">{branch.region}</span>
                  </div>
                </td>
                <td className="px-8 py-6 border-y border-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#00629B]/10 text-[#00629B] flex items-center justify-center font-black text-[10px] border border-[#00629B]/20 uppercase">
                      {branch.admin?.username?.charAt(0) || 'A'}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-[#00629B] capitalize">{branch.admin?.username}</span>
                      <span className="text-sm text-slate-500 font-bold capitalize italic">{branch.admin?.full_name}</span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 border-y border-slate-50 text-center">
                  <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl border ${isActive ? 'bg-emerald-50/50 border-emerald-100 text-emerald-600' : 'bg-red-50/50 border-red-100 text-red-600'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                    <span className="text-[9px] font-black uppercase tracking-widest">{branch.status}</span>
                  </div>
                </td>
                <td className="px-8 py-6 rounded-r-[2.5rem] border-y border-r border-slate-50 text-right overflow-visible">
                  <div className="relative inline-block group/menu overflow-visible">
                    <button className="p-3 hover:bg-[#00629B] hover:text-white rounded-2xl transition-all duration-300 text-slate-300 bg-white border border-slate-50 shadow-sm outline-none">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    {/* المنيو: أضفنا -top-2 و pt-2 لمنع الماوس من فقدان الـ Hover */}
                    <div className="absolute right-0 top-full -mt-2 pt-2 w-56 z-[9999] hidden group-hover/menu:block animate-in fade-in zoom-in-95 duration-300 overflow-visible">
                      <div className="bg-white border border-slate-100 rounded-[1.8rem] shadow-2xl py-3">
                        <button onClick={() => onEdit(branch)} className="w-full flex items-center gap-3 px-5 py-3 text-[10px] font-black uppercase tracking-[0.1em] text-slate-600 hover:bg-blue-50 hover:text-[#00629B] transition-colors">
                          <Edit2 className="w-4 h-4 text-blue-400" /> Edit Branch
                        </button>
                        <button onClick={() => onToggleStatus(branch)} className="w-full flex items-center gap-3 px-5 py-3 text-[10px] font-black uppercase tracking-[0.1em] text-amber-600 hover:bg-amber-50 transition-colors">
                          {isActive ? <><ShieldOff className="w-4 h-4" /> Deactivate</> : <><CheckCircle className="w-4 h-4" /> Activate</>}
                        </button>
                        <div className="my-2 border-t border-slate-50 mx-4"></div>
                        <button onClick={() => onDelete(branch.branch_id)} className="w-full flex items-center gap-3 px-5 py-3 text-[10px] font-black uppercase tracking-[0.1em] text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 className="w-4 h-4" /> Remove Branch
                        </button>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default BranchTable;