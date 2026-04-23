import React, { useState, useEffect } from 'react';
import { 
  Check, X, Ban, Mail, Building2, Calendar, RefreshCcw, UserCheck, ShieldAlert, Clock
} from 'lucide-react';
import { getData } from '@/api/apiMethods'; 
// 🌟 استدعاء مكون الـ EmptyState
import EmptyState from '../../../../components/ui/EmptyState';

const FetchBranchName = ({ id }) => {
  const [name, setName] = useState('Fetching...');

  useEffect(() => {
    if (id) {
      getData(`/branches/${id}`)
        .then(res => {
          const branchName = res.data?.name || res.data?.data?.name || res.name;
          if (branchName) {
             setName(branchName);
          } else {
             setName(`NO NAME FOUND (ID: ${id})`); 
          }
        })
        .catch(err => {
          console.error(`[Branch Component] API Error for ID ${id}:`, err);
          setName(`API ERROR (ID: ${id})`);
        });
    } else {
      setName('NO ID PASSED'); 
    }
  }, [id]);

  return <span className="text-xs font-black text-slate-600 uppercase">{name}</span>;
};

const AdminTable = ({ data, type, onAction, isLoading }) => {
  if (isLoading) {
    return (
      <div className="text-center py-24 bg-white rounded-[3rem] border border-slate-50 italic text-slate-300 font-bold uppercase tracking-widest text-xs animate-pulse">
        Fetching data from server...
      </div>
    );
  }

  // 🌟 استخدام EmptyState الموحد
  if (!data || data.length === 0) {
    const emptyConfig = {
      pending: { 
        icon: Clock, 
        title: 'No Pending Requests', 
        msg: "You're all caught up! No new applications await your review.", 
        color: 'amber' 
      },
      active: { 
        icon: UserCheck, 
        title: 'No Active Admins', 
        msg: "There are currently no active branch administrators in the system.", 
        color: 'emerald' 
      },
      suspended: { 
        icon: ShieldAlert, 
        title: 'No Suspended Accounts', 
        msg: "The infrastructure is clear. No accounts are currently under suspension.", 
        color: 'rose' 
      }
    };

    const config = emptyConfig[type] || emptyConfig.pending; // Fallback to pending if type is undefined

    return (
      <EmptyState 
        icon={config.icon} 
        title={config.title} 
        message={config.msg}
        colorTheme={config.color}
      />
    );
  }

  return (
    // 🌟 Responsive wrapper
    <div className="overflow-x-auto pb-20 no-scrollbar">
      <table className="w-full text-left border-separate border-spacing-y-4 min-w-[900px]">
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
            const uniqueId = admin.id || admin.user_id || admin.uuid;

            return (
              <tr key={uniqueId || index} className="bg-white hover:shadow-[0_10px_30px_-15px_rgba(0,98,155,0.1)] transition-all duration-300 group">
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
                    <span className="text-xs font-black text-slate-600 uppercase">
                      <FetchBranchName id={admin.branch_id} />
                    </span>
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
                        title="Reject Admin"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}

                  {type === 'active' && (
                    <button 
                      onClick={() => onAction(uniqueId, 'Suspended')}
                      className="px-6 py-3 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ml-auto border border-transparent hover:border-red-100"
                    >
                      <Ban className="w-4 h-4" /> Suspend Account
                    </button>
                  )}

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
    </div>
  );
};

export default AdminTable;