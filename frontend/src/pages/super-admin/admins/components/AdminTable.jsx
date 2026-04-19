import React from 'react';
import { 
  Check, X, Ban, Mail, Building2, Calendar, RefreshCcw
} from 'lucide-react';

const AdminTable = ({ data, type, onAction, isLoading }) => {
  if (isLoading) {
    return (
      <div className="text-center py-24 bg-white rounded-[3rem] border border-slate-50 italic text-slate-300 font-bold uppercase tracking-widest text-xs animate-pulse">
        Fetching data from server...
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-20">
      <table className="w-full text-left border-separate border-spacing-y-4">
        <thead>
          <tr className="text-[#00629B] opacity-50">
            <th className="px-8 py-2 text-[10px] font-black uppercase tracking-[0.2em]">Full Name & Contact</th>
            <th className="px-8 py-2 text-[10px] font-black uppercase tracking-[0.2em]">Target Branch</th>
            <th className="px-8 py-2 text-[10px] font-black uppercase tracking-[0.2em]">Requested Date</th>
            <th className="px-8 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-right pr-12">Decision</th>
          </tr>
        </thead>
<tbody>
          {data.map((admin, index) => {
            // Smart ID Resolver: للبحث عن الـ ID سواء كان اسمه id أو user_id
            const uniqueId = admin.id || admin.user_id || admin.uuid;

            return (
              <tr key={uniqueId || index} className="bg-white hover:shadow-lg transition-all duration-300 group">
                {/* ... (نفس كود الخلايا td القديم بدون تغيير) ... */}
                
                <td className="px-8 py-6 rounded-l-[2rem] border-y border-l border-slate-50">
                  <div className="flex flex-col">
                    <span className="font-black text-slate-700 text-sm italic uppercase">{admin.full_name || admin.name}</span>
                    <div className="flex items-center gap-1.5 mt-1 text-slate-400">
                      <Mail className="w-3 h-3" />
                      <span className="text-[10px] font-bold lowercase">{admin.email}</span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 border-y border-slate-50">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 rounded-xl text-[#00629B]">
                      <Building2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-black text-slate-600 uppercase">{admin.branch || 'Unknown'}</span>
                  </div>
                </td>
                <td className="px-8 py-6 border-y border-slate-50">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black">
                      {admin.created_at ? admin.created_at.split('T')[0] : (admin.date || 'N/A')}
                    </span>
                  </div>
                </td>

<td className="px-8 py-6 rounded-r-[2rem] border-y border-r border-slate-50 text-right">
                  {/* Pending Actions */}
                  {type === 'pending' && (
                    <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => onAction(uniqueId, 'Active')}
                        className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                        title="Approve Admin"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => onAction(uniqueId, 'Rejected')}
                        className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                        title="Reject Request"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}

                  {/* Active Actions */}
                  {type === 'active' && (
                    <button 
                      onClick={() => onAction(uniqueId, 'Suspended')}
                      className="px-6 py-3 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ml-auto border border-transparent hover:border-red-100"
                    >
                      <Ban className="w-4 h-4" /> Suspend Account
                    </button>
                  )}

                  {/* Suspended Actions */}
                  {type === 'suspended' && (
                    <button 
                      onClick={() => onAction(uniqueId, 'Active')}
                      className="px-6 py-3 bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ml-auto border border-transparent hover:border-emerald-100"
                    >
                      <RefreshCcw className="w-4 h-4" /> Reactivate
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {data.length === 0 && !isLoading && (
        <div className="text-center py-24 bg-white rounded-[3rem] border border-slate-50 italic text-slate-300 font-bold uppercase tracking-widest text-xs">
          No {type} admins found...
        </div>
      )}
    </div>
  );
};

export default AdminTable;