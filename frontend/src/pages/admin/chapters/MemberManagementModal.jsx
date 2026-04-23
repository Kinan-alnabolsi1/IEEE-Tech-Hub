import React, { useState, useEffect, useRef } from 'react';
import { chapterService } from '../../../services/chapterService';
import { volunteerService } from '../../../services/volunteerService';
import { Trash2, Users, UserMinus, ChevronDown, Check, Loader2, UserPlus } from 'lucide-react';
import BaseModal from '../../../components/ui/BaseModal';
import toast from 'react-hot-toast';

const MemberManagementModal = ({ isOpen, onClose, chapter }) => {
  const [currentMembers, setCurrentMembers] = useState([]);
  const [allVolunteers, setAllVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // حالات الـ Dropdown الجديد
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const branchId = localStorage.getItem('branch_id');

  const fetchMemberData = async () => {
    try {
      setLoading(true);
      const [chapterRes, volRes] = await Promise.all([
        chapterService.getMembers(chapter.chapter_id),
        // منستخدم داتا وهمية إذا الـ API لسا مو جاهز (404) عشان ما يضرب المودال
        volunteerService.getByBranch(branchId).catch(() => ({
          data: [
            { user_id: 101, full_name: "Shahd IEEE (Mock)" },
            { user_id: 102, full_name: "Ahmad Ali (Mock)" },
            { user_id: 103, full_name: "Lina Khaled (Mock)" }
          ]
        }))
      ]);

      setCurrentMembers(chapterRes.data?.members || chapterRes.data?.data?.members || []);
      setAllVolunteers(volRes.data?.data || volRes.data || []);
    } catch (err) {
      toast.error("Sync failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (isOpen) fetchMemberData(); }, [isOpen]);

  // إغلاق الدروب داون عند الضغط براه
  useEffect(() => {
    const handleClick = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsDropdownOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleAdd = async (userId) => {
    setActionLoading(true);
    try {
      await chapterService.addMember(chapter.chapter_id, userId);
      toast.success("Member Added");
      setIsDropdownOpen(false);
      fetchMemberData();
    } catch (err) { toast.error("Failed to add"); }
    finally { setActionLoading(false); }
  };

  const handleRemove = async (userId) => {
    setActionLoading(true);
    try {
      await chapterService.removeMember(chapter.chapter_id, userId);
      toast.success("Member Removed");
      fetchMemberData();
    } catch (err) { toast.error("Failed to remove"); }
    finally { setActionLoading(false); }
  };

  // المتطوعين اللي مو موجودين بالشابتر
  const availableOptions = allVolunteers.filter(v => !currentMembers.some(m => m.user_id === v.user_id));

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Manage Members" subtitle={chapter?.name}>
      <div className="space-y-8 min-h-[400px]">
        
        {/* 🌟 الدروب داون الاحترافي */}
        <div className="space-y-2" ref={dropdownRef}>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assign New Volunteer</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-full flex items-center justify-between bg-[#F8FAFC] border-2 rounded-[1.5rem] px-6 py-4 text-xs font-bold transition-all ${isDropdownOpen ? 'border-blue-100 bg-white shadow-sm' : 'border-transparent'}`}
            >
              <div className="flex items-center gap-3">
                <UserPlus size={16} className="text-[#00629B]" />
                <span className="text-slate-400">Select a volunteer from branch...</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-[#00629B] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute z-[100] w-full mt-2 bg-white border border-slate-100 rounded-[1.8rem] shadow-2xl max-h-[220px] overflow-y-auto p-2 no-scrollbar animate-in slide-in-from-top-2 duration-200">
                {availableOptions.length > 0 ? availableOptions.map((v) => (
                  <div
                    key={v.user_id}
                    onClick={() => handleAdd(v.user_id)}
                    className="flex items-center justify-between px-5 py-3.5 rounded-xl cursor-pointer hover:bg-blue-50 text-slate-600 hover:text-[#00629B] transition-all mb-1 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black group-hover:bg-[#00629B] group-hover:text-white transition-colors">
                        {v.full_name?.charAt(0)}
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-tight">{v.full_name}</span>
                    </div>
                    <Plus size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                )) : (
                  <div className="p-6 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">All branch volunteers are assigned</div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="h-px bg-slate-50" />

        {/* قائمة الأعضاء الحاليين */}
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Members ({currentMembers.length})</label>
          <div className="space-y-3">
            {loading ? <div className="flex justify-center p-10"><Loader2 className="animate-spin text-slate-200" /></div> :
              currentMembers.length > 0 ? currentMembers.map(m => (
                <div key={m.user_id} className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-[1.5rem] border border-transparent hover:border-blue-100 hover:bg-white transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-[#00629B] font-black text-xs shadow-sm border border-slate-50">
                      {m.full_name?.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-800 uppercase italic">{m.full_name}</div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase mt-0.5 tracking-tighter">Chapter Member</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRemove(m.user_id)}
                    className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                  >
                    <UserMinus size={16} />
                  </button>
                </div>
              )) : (
                <div className="py-12 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-100">
                  <p className="text-[10px] font-black text-slate-300 uppercase italic">Chapter is empty</p>
                </div>
              )
            }
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default MemberManagementModal;