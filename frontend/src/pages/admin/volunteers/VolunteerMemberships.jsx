import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { volunteerService } from '../../../services/volunteerService';
import { adminService } from '../../../services/adminService';
import { Check, X, User, ShieldAlert } from 'lucide-react'; 
import toast from 'react-hot-toast';
import Loader from '../../../components/ui/Loader'; 

const VolunteerMemberships = () => {
  const { user } = useOutletContext();
  const [activeTab, setActiveTab] = useState('Pending');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      setData([]); 
      const branchId = user?.branch_id || 1;
      const response = await adminService.getMembers(branchId, activeTab);
      setData(response.data?.data || response.data || []);
    } catch (err) {
      toast.error("Error fetching data from server");
      console.log("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleAction = async (userId, newStatus) => {
    try {
      await volunteerService.updateStatus(userId, newStatus);
      toast.success(`User is now ${newStatus}!`);
      fetchData(); 
    } catch (err) {
      const serverError = err.response?.data?.message || "Permission Denied";
      
      if (err.response?.status === 403) {
        toast.error(`Access Denied: ${serverError}`, {
          duration: 4000,
          style: {
            border: '1px solid #e11d48',
            padding: '16px',
            color: '#e11d48',
            fontSize: '10px',
            fontWeight: 'bold',
            textTransform: 'uppercase'
          },
          icon: '🚫',
        });
      } else {
        toast.error(serverError || "Something went wrong. Try again later.");
      }
    }
  };

  return (
    <>
      {loading && <Loader message={`Syncing ${activeTab} Database...`} />}

      <div className="p-4 md:p-8 space-y-6 md:space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5 md:gap-0 border-b pb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-[#00629B] uppercase italic tracking-tighter">Memberships</h1>
            <p className="text-[10px] text-slate-400 font-bold tracking-[0.3em] mt-1 md:mt-2 uppercase">Branch Control Panel</p>
          </div>
          
          <div className="w-full md:w-auto flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
            {['Pending', 'Active', 'Suspended'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 md:flex-none px-4 md:px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeTab === tab ? 'bg-white text-[#00629B] shadow-md' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-50 shadow-sm overflow-hidden min-h-[450px]">
          {!loading && (
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left min-w-[700px]">
                <thead className="bg-slate-50/50">
                  <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-8 py-5 font-black uppercase">Volunteer Details</th>
                    <th className="px-8 py-5 text-center font-black uppercase">Actions & Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.map((item) => (
                    <tr key={item.user_id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4 md:gap-5">
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-slate-50 text-[#00629B] flex items-center justify-center font-black text-sm border border-slate-100 shadow-sm group-hover:bg-[#00629B] group-hover:text-white transition-all shrink-0">
                            {item.full_name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-700 uppercase italic tracking-tight flex flex-wrap items-center gap-2">
                              {item.full_name}
                              <span className="text-[8px] md:text-[9px] text-[#00629B] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                                #{item.ieee_membership_number || 'N/A'}
                              </span>
                            </p>
                            <p className="text-[9px] md:text-[10px] text-slate-400 mt-0.5">@{item.username} • {item.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex justify-center gap-2">
                          {activeTab === 'Pending' && (
                            <>
                              <button onClick={() => handleAction(item.user_id, 'Active')} className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm" title="Approve">
                                <Check size={16} strokeWidth={3} />
                              </button>
                              <button onClick={() => handleAction(item.user_id, 'Suspended')} className="p-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all shadow-sm" title="Reject">
                                <X size={16} strokeWidth={3} />
                              </button>
                            </>
                          )}

                          {activeTab === 'Active' && (
                            <button onClick={() => handleAction(item.user_id, 'Suspended')} className="p-2 md:p-2.5 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white transition-all shadow-sm flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest px-3 md:px-4 italic whitespace-nowrap">
                              <ShieldAlert size={14} /> Suspend Account
                            </button>
                          )}

                          {activeTab === 'Suspended' && (
                            <button onClick={() => handleAction(item.user_id, 'Pending')} className="p-2 md:p-2.5 rounded-xl bg-blue-50 text-[#00629B] hover:bg-[#00629B] hover:text-white transition-all shadow-sm flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest px-3 md:px-4 italic whitespace-nowrap">
                              <User size={14} /> Restore to Pending
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.length === 0 && (
                <div className="py-24 text-center">
                  <p className="text-[10px] font-black text-slate-300 uppercase italic tracking-[0.4em]">Zero {activeTab} Entries Found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default VolunteerMemberships;