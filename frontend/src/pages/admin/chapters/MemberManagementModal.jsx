import React, { useState, useEffect, useRef } from 'react';
import { chapterService } from '../../../services/chapterService';
import { volunteerService } from '../../../services/volunteerService';
import { UserMinus, ChevronDown, Loader2, UserPlus, Crown, ShieldX } from 'lucide-react';
import BaseModal from '../../../components/ui/BaseModal';
import toast from 'react-hot-toast';

const MemberManagementModal = ({ isOpen, onClose, chapter, onSuccess }) => {
  const [currentMembers, setCurrentMembers] = useState([]);
  const [allVolunteers, setAllVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // 🌟 الحل لمشكلة الريفريش: تتبع حالة الرئيس محلياً فوراً
  const [localChairId, setLocalChairId] = useState(chapter?.chair_id);

  const dropdownRef = useRef(null);
  const branchId = localStorage.getItem('branch_id');

  // تحديث الرئيس المحلي إذا تغير الفصل اللي جاي من الأب
  useEffect(() => {
    setLocalChairId(chapter?.chair_id);
  }, [chapter]);

  const fetchMemberData = async () => {
    try {
      setLoading(true);
      const chapterRes = await chapterService.getMembers(chapter.chapter_id);
      setCurrentMembers(chapterRes.data?.members || chapterRes.data?.data?.members || []);

      try {
        const volRes = await volunteerService.getByBranch(branchId);
        setAllVolunteers(volRes.data?.data || volRes.data || []);
      } catch {
        setAllVolunteers([]); 
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to sync chapter details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (isOpen) fetchMemberData(); }, [isOpen]);

  const handleRemoveChair = async () => {
    if(!window.confirm("Are you sure you want to remove this user from the Chair position? They will remain a member.")) return;
    setActionLoading(true);
    try {
      await chapterService.removeChair(chapter.chapter_id);
      setLocalChairId(null); // 🌟 تحديث فوري للـ UI
      toast.success("Chair removed. Position is now vacant.");
      if(onSuccess) onSuccess(); 
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove chair");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignChair = async (userId) => {
    if(!window.confirm("Make this user the Chapter Chair?")) return;
    setActionLoading(true);
    try {
      await chapterService.assignChair(chapter.chapter_id, userId);
      setLocalChairId(userId); // 🌟 تحديث فوري للـ UI بدون ريفريش
      toast.success("New Chair assigned!");
      if(onSuccess) onSuccess(); 
    } catch (err) {
      console.error(err);
       toast.error("Failed to assign chair"); }
    finally { setActionLoading(false); }
  };

  const handleAdd = async (userId) => {
    setActionLoading(true);
    try {
      await chapterService.addMember(chapter.chapter_id, userId);
      toast.success("Member added");
      setIsDropdownOpen(false);
      fetchMemberData();
    } catch (err) {
      console.error(err);
       toast.error("Failed to add member"); }
    finally { setActionLoading(false); }
  };

  const handleRemoveMember = async (userId) => {
    setActionLoading(true);
    try {
      await chapterService.removeMember(chapter.chapter_id, userId);
      
      // إذا حذفنا العضو وهو أصلاً الرئيس، منفضّي الكرسي
      if (localChairId === userId) {
        setLocalChairId(null);
      }
      
      toast.success("Member removed");
      fetchMemberData();
    } catch (err) {
      console.error(err);
       toast.error("Failed to remove member"); }
    finally { setActionLoading(false); }
  };

  // 🌟 الحل لمشكلة الترتيب: رفع الرئيس لأول القائمة دائماً
  const sortedMembers = [...currentMembers].sort((a, b) => {
    if (a.user_id === localChairId) return -1; // ارفع a لفوق إذا كان هو الرئيس
    if (b.user_id === localChairId) return 1;  // ارفع b لفوق إذا كان هو الرئيس
    return 0; // اترك الباقي على ترتيبهم الطبيعي
  });

  // 🚨 التعديل هون: فلترة للـ Active فقط بالإضافة لاستبعاد الموجودين مسبقاً
  const availableOptions = allVolunteers.filter(v => 
    !currentMembers.some(m => m.user_id === v.user_id) && 
    (v.status?.toLowerCase() === 'active' || v.account_status?.toLowerCase() === 'active') // تأكدنا من جلب الـ Active فقط
  );

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Manage Members" subtitle={chapter?.name}>
      <div className="space-y-8 min-h-[400px]">
        
        {/* Dropdown للإضافة */}
        <div className="space-y-2" ref={dropdownRef}>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Add Volunteer</label>
          <div className="relative">
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-full flex items-center justify-between bg-[#F8FAFC] border-2 rounded-[1.5rem] px-6 py-4 text-xs font-bold transition-all ${isDropdownOpen ? 'border-blue-100 bg-white' : 'border-transparent'}`}
            >
              <div className="flex items-center gap-3">
                <UserPlus size={16} className="text-[#00629B]" />
                <span className="text-slate-400">Search active branch volunteers...</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-[#00629B] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute z-[100] w-full mt-2 bg-white border border-slate-100 rounded-[1.8rem] shadow-2xl max-h-[200px] overflow-y-auto p-2 no-scrollbar">
                {availableOptions.length > 0 ? availableOptions.map((v) => (
                  <div key={v.user_id} onClick={() => handleAdd(v.user_id)} className="flex items-center justify-between px-5 py-3 rounded-xl cursor-pointer hover:bg-blue-50 transition-all mb-1">
                    <span className="text-[11px] font-bold uppercase">{v.full_name}</span>
                  </div>
                )) : <div className="p-4 text-center text-[10px] text-slate-300">No active volunteers available</div>}
              </div>
            )}
          </div>
        </div>

        <div className="h-px bg-slate-50" />

        {/* قائمة الأعضاء */}
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Chapter Roster ({currentMembers.length})</label>
          <div className="space-y-3">
            {loading ? <div className="flex justify-center p-8"><Loader2 className="animate-spin text-[#00629B]" /></div> :
              /* 🌟 استخدمنا sortedMembers بدل currentMembers */
              sortedMembers.map(m => {
                const isChair = localChairId === m.user_id; // 🌟 فحص الرئيس بناءً على الحالة المحلية
                return (
                  <div key={m.user_id} className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-[1.5rem] border border-transparent hover:border-blue-100 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs shadow-sm transition-all ${isChair ? 'bg-amber-100 text-amber-600 scale-105' : 'bg-white text-[#00629B]'}`}>
                        {isChair ? <Crown size={16} /> : m.full_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-800 uppercase flex items-center gap-2">
                          {m.full_name} 
                          {isChair && <span className="px-2 py-0.5 bg-amber-100 text-amber-600 rounded-lg text-[8px] tracking-widest animate-in zoom-in duration-300">CHAIR</span>}
                        </div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">
                          {m.pivot?.role_in_chapter || 'Member'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {isChair ? (
                        <button onClick={handleRemoveChair} disabled={actionLoading} className="p-2.5 text-amber-600 hover:bg-amber-100 rounded-xl transition-all" title="Remove as Chair">
                          <ShieldX size={16} />
                        </button>
                      ) : (
                        <button onClick={() => handleAssignChair(m.user_id)} disabled={actionLoading} className="p-2.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all" title="Assign as Chair">
                          <Crown size={16} />
                        </button>
                      )}

                      <button onClick={() => handleRemoveMember(m.user_id)} disabled={actionLoading} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Remove Member">
                        <UserMinus size={16} />
                      </button>
                    </div>
                  </div>
                );
              })
            }
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default MemberManagementModal;