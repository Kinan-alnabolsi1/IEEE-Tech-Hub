import React, { useState, useEffect, useRef } from 'react';
import { chapterService } from '../../../services/chapterService';
import { volunteerService } from '../../../services/volunteerService';
import { UserMinus, ChevronDown, Loader2, UserPlus, Crown } from 'lucide-react';
import BaseModal from '../../../components/ui/BaseModal';
import toast from 'react-hot-toast';

const MemberManagementModal = ({ isOpen, onClose, chapter, onSuccess }) => {
  const [currentMembers, setCurrentMembers] = useState([]);
  const [allVolunteers, setAllVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const dropdownRef = useRef(null);
  const branchId = localStorage.getItem('branch_id');

  // جلب البيانات (مطابق لـ API رقم 4)
  const fetchMemberData = async () => {
    try {
      setLoading(true);
      const chapterRes = await chapterService.getMembers(chapter.chapter_id);
      setCurrentMembers(chapterRes.data?.members || chapterRes.data?.data?.members || []);

      // جلب متطوعين الفرع للدروب داون (مع Mock Data في حال الـ API لسا مو شغال)
      try {
        const volRes = await volunteerService.getByBranch(branchId);
        setAllVolunteers(volRes.data?.data || volRes.data || []);
      } catch {
        setAllVolunteers([
          { user_id: 101, full_name: "Shahd (Mock)" },
          { user_id: 102, full_name: "Ahmad (Mock)" },
          { user_id: 103, full_name: "Lina (Mock)" }
        ]);
      }
    } catch (err) {
      toast.error("Failed to sync chapter details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (isOpen) fetchMemberData(); }, [isOpen]);

  // إغلاق الدروب داون عند النقر خارجه
  useEffect(() => {
    const handleClick = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsDropdownOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // 🌟 إضافة عضو (API رقم 7)
  const handleAdd = async (userId) => {
    setActionLoading(true);
    try {
      await chapterService.addMember(chapter.chapter_id, userId, 'Member');
      toast.success("Member added successfully");
      setIsDropdownOpen(false);
      fetchMemberData();
    } catch (err) { toast.error("Failed to add member"); }
    finally { setActionLoading(false); }
  };

  // 🌟 إزالة عضو (API رقم 8)
  const handleRemove = async (userId) => {
    setActionLoading(true);
    try {
      await chapterService.removeMember(chapter.chapter_id, userId);
      toast.success("Member removed");
      fetchMemberData();
    } catch (err) { toast.error("Failed to remove member"); }
    finally { setActionLoading(false); }
  };

  // 🌟 تعيين رئيس (API رقم 6)
  const handleAssignChair = async (userId) => {
    if(!window.confirm("Are you sure you want to make this user the Chapter Chair?")) return;
    setActionLoading(true);
    try {
      await chapterService.assignChair(chapter.chapter_id, userId);
      toast.success("Chapter Chair updated!");
      fetchMemberData();
      if(onSuccess) onSuccess(); // تحديث الجدول الرئيسي عشان يظهر اسم الرئيس الجديد
    } catch (err) { toast.error("Failed to assign chair"); }
    finally { setActionLoading(false); }
  };

  const availableOptions = allVolunteers.filter(v => !currentMembers.some(m => m.user_id === v.user_id));

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Manage Chapter Members" subtitle={chapter?.name}>
      <div className="space-y-8 min-h-[400px]">
        
        {/* Dropdown للإضافة */}
        <div className="space-y-2" ref={dropdownRef}>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assign New Volunteer</label>
          <div className="relative">
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-full flex items-center justify-between bg-[#F8FAFC] border-2 rounded-[1.5rem] px-6 py-4 text-xs font-bold transition-all ${isDropdownOpen ? 'border-blue-100 bg-white shadow-sm' : 'border-transparent'}`}
            >
              <div className="flex items-center gap-3">
                <UserPlus size={16} className="text-[#00629B]" />
                <span className="text-slate-400">Select volunteer to add...</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-[#00629B] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute z-[100] w-full mt-2 bg-white border border-slate-100 rounded-[1.8rem] shadow-2xl max-h-[200px] overflow-y-auto p-2 no-scrollbar">
                {availableOptions.length > 0 ? availableOptions.map((v) => (
                  <div key={v.user_id} onClick={() => handleAdd(v.user_id)} className="flex items-center justify-between px-5 py-3 rounded-xl cursor-pointer hover:bg-blue-50 text-slate-600 hover:text-[#00629B] transition-all mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-tight">{v.full_name}</span>
                  </div>
                )) : (
                  <div className="p-4 text-center text-[10px] font-bold text-slate-300 uppercase">No available volunteers</div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="h-px bg-slate-50" />

        {/* قائمة الأعضاء */}
        <div className="space-y-4 relative z-10">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Roster ({currentMembers.length})</label>
          <div className="space-y-3">
            {loading ? <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-500" /></div> :
              currentMembers.length > 0 ? currentMembers.map(m => {
                const isChair = chapter.chair_id === m.user_id; // فحص إذا كان العضو هو الرئيس
                return (
                  <div key={m.user_id} className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-[1.5rem] border border-transparent hover:border-blue-100 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs shadow-sm ${isChair ? 'bg-amber-100 text-amber-600' : 'bg-white text-[#00629B]'}`}>
                        {isChair ? <Crown size={16} /> : m.full_name?.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-800 uppercase flex items-center gap-2">
                          {m.full_name} 
                          {isChair && <span className="px-2 py-0.5 bg-amber-100 text-amber-600 rounded-lg text-[8px] tracking-widest">CHAIR</span>}
                        </div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{m.pivot?.role_in_chapter || 'Member'}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* 🌟 زر تعيين الرئيس */}
                      {!isChair && (
                        <button onClick={() => handleAssignChair(m.user_id)} disabled={actionLoading} className="p-2.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all" title="Make Chapter Chair">
                          <Crown size={16} />
                        </button>
                      )}
                      {/* زر الحذف */}
                      <button onClick={() => handleRemove(m.user_id)} disabled={actionLoading} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Remove Member">
                        <UserMinus size={16} />
                      </button>
                    </div>
                  </div>
                );
              }) : (
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