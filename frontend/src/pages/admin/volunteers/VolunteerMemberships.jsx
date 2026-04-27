import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { volunteerService } from '../../../services/volunteerService';
import { Check, X, User, ShieldAlert, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const VolunteerMemberships = () => {
  const { user } = useOutletContext();
  const [activeTab, setActiveTab] = useState('Pending');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      setData([]); 
      const branchId = user?.branch_id || localStorage.getItem('branch_id');
      
      // 🌟 هدول الأسطر رح يطبعوا بالكونسول عشان نعرف ليش الجدول فاضي
      console.log("Fetching for Branch ID:", branchId, "Status:", activeTab);
      
      const response = await volunteerService.getByBranch(branchId, activeTab);
      
      console.log("API Response:", response);
      
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
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      {/* Header & Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-[#00629B] uppercase italic tracking-tighter">Memberships</h1>
          <p className="text-[10px] text-slate-400 font-bold tracking-[0.3em] mt-2 uppercase">Branch Control Panel</p>
        </div>
        
        {/* التابات */}
        <div className="flex flex-col md:flex-row bg-slate-50 md:bg-slate-100 p-1.5 rounded-[1.5rem] md:rounded-2xl border border-slate-100 shadow-sm w-full md:w-auto gap-1 md:gap-0">
          {['Pending', 'Active', 'Suspended'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full md:w-auto px-8 py-3.5 md:py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-center ${
                activeTab === tab 
                  ? 'bg-white text-[#00629B] shadow-md' 
                  : 'text-slate-400 hover:bg-slate-200/50 hover:text-slate-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      {/* Main Table Content */}
      <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-50 shadow-sm  min-h-[450px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 space-y-4">
            <Loader2 className="animate-spin text-[#00629B]" size={40} />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Syncing {activeTab} Database...</p>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left min-w-[700px]">
              <thead className="bg-[#F8FAFC]">
                <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-8 py-6 font-black uppercase w-2/3">Volunteer Details</th>
                  <th className="px-8 py-6 text-right font-black uppercase w-1/3">Actions & Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.map((item) => (
                  <tr key={item.user_id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 text-[#00629B] flex items-center justify-center font-black text-sm border border-slate-100 shadow-sm group-hover:bg-[#00629B] group-hover:text-white transition-all shrink-0">
                          {item.full_name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-700 uppercase italic tracking-tight flex items-center gap-2">
                            {item.full_name}
                            {item.ieee_membership_number && (
                              <span className="text-[8px] text-[#00629B] bg-blue-50/50 px-2.5 py-1 rounded-lg border border-blue-100 tracking-widest">
                                #{item.ieee_membership_number}
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 mt-1 truncate max-w-[250px] md:max-w-none">
                            @{item.username} • {item.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex justify-end gap-3">
                        {activeTab === 'Pending' && (
                          <>
                            <button onClick={() => handleAction(item.user_id, 'Active')} className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all shadow-sm" title="Approve">
                              <Check size={18} strokeWidth={2.5} />
                            </button>
                            <button onClick={() => handleAction(item.user_id, 'Suspended')} className="p-3 rounded-2xl bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white transition-all shadow-sm" title="Reject / Suspend">
                              <X size={18} strokeWidth={2.5} />
                            </button>
                          </>
                        )}

                        {activeTab === 'Active' && (
                          <button onClick={() => handleAction(item.user_id, 'Suspended')} className="py-3 px-5 rounded-2xl bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white transition-all shadow-sm flex items-center gap-2 text-[10px] font-black uppercase tracking-widest italic">
                            <ShieldAlert size={14} /> Suspend
                          </button>
                        )}

                        {activeTab === 'Suspended' && (
                          <button onClick={() => handleAction(item.user_id, 'Pending')} className="py-3 px-5 rounded-2xl bg-blue-50 text-[#00629B] hover:bg-[#00629B] hover:text-white transition-all shadow-sm flex items-center gap-2 text-[10px] font-black uppercase tracking-widest italic">
                            <User size={14} /> Restore
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.length === 0 && (
              <div className="py-24 flex flex-col items-center justify-center space-y-3 w-full">
  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
    <User className="text-slate-300" size={24} />
  </div>
  {/* 🌟 ضفنا text-center هون عشان النص يتوسط حتى لو نزل على سطرين */}
  <p className="text-[10px] font-black text-slate-300 uppercase italic tracking-[0.4em] text-center px-4">
    Zero {activeTab} Entries Found
  </p>
</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VolunteerMemberships;