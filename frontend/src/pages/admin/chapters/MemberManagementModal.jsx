import React, { useState, useEffect, useRef } from 'react';
import { chapterService } from '../../../services/chapterService';
import { volunteerService } from '../../../services/volunteerService';
import { UserMinus, ChevronDown, Loader2, UserPlus, Crown, ShieldX, Mail, Search } from 'lucide-react';
import BaseModal from '../../../components/ui/BaseModal';
import toast from 'react-hot-toast';

const MemberManagementModal = ({ isOpen, onClose, chapter, onSuccess }) => {
    const [currentMembers, setCurrentMembers] = useState([]);
    const [allVolunteers, setAllVolunteers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    // تتبع حالة الرئيس محلياً لضمان سرعة استجابة الواجهة
    const [localChairId, setLocalChairId] = useState(chapter?.chair_id);

    const dropdownRef = useRef(null);
    const branchId = localStorage.getItem('branch_id');

    // إغلاق الدروب داون عند الضغط بالخارج
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        setLocalChairId(chapter?.chair_id);
    }, [chapter]);

    const fetchMemberData = async () => {
        if (!chapter?.chapter_id) return;
        try {
            setLoading(true);
            // 1. جلب أعضاء الفصل الحاليين
            const chapterRes = await chapterService.getMembers(chapter.chapter_id);
            const members = chapterRes.data?.members || chapterRes.data?.data?.members || [];
            setCurrentMembers(members);

            // 2. جلب كافة متطوعي الفرع النشطين
            try {
                const volRes = await volunteerService.getByBranch(branchId, 'active');
                const volunteersList = volRes.data?.data || volRes.data || [];
                setAllVolunteers(volunteersList);
                console.log("Branch Volunteers Loaded:", volunteersList);
            } catch (err) {
                console.error("Error loading branch volunteers", err);
                setAllVolunteers([]); 
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to sync chapter details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (isOpen) fetchMemberData(); }, [isOpen, chapter]);

    // --- Actions ---

    const handleAdd = async (userId) => {
        setActionLoading(true);
        try {
            await chapterService.addMember(chapter.chapter_id, userId);
            toast.success("Volunteer added to chapter successfully");
            setIsDropdownOpen(false);
            fetchMemberData();
            if (onSuccess) onSuccess();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to add member");
        } finally {
            setActionLoading(false);
        }
    };

    const handleAssignChair = async (userId) => {
        if (!window.confirm("Make this user the Chapter Chair?")) return;
        setActionLoading(true);
        try {
            await chapterService.assignChair(chapter.chapter_id, userId);
            setLocalChairId(userId);
            toast.success("Chapter Chair updated successfully");
            if (onSuccess) onSuccess(); 
        } catch (err) {
            toast.error("Failed to assign chair");
        } finally {
            setActionLoading(false);
        }
    };

    const handleRemoveChair = async () => {
        if (!window.confirm("Remove this user from the Chair position?")) return;
        setActionLoading(true);
        try {
            await chapterService.removeChair(chapter.chapter_id);
            setLocalChairId(null);
            toast.success("Chair position is now vacant");
            if (onSuccess) onSuccess(); 
        } catch (err) {
            toast.error("Failed to remove chair");
        } finally {
            setActionLoading(false);
        }
    };

    const handleRemoveMember = async (userId) => {
        if (!window.confirm("Remove this member from the chapter?")) return;
        setActionLoading(true);
        try {
            await chapterService.removeMember(chapter.chapter_id, userId);
            if (localChairId === userId) setLocalChairId(null);
            toast.success("Member removed from roster");
            fetchMemberData();
            if (onSuccess) onSuccess();
        } catch (err) {
            toast.error("Failed to remove member");
        } finally {
            setActionLoading(false);
        }
    };

    // --- Filtering Logic ---

    // فلترة المتطوعين المتاحين للإضافة (نشطين وغير مضافين حالياً)
    const availableOptions = allVolunteers.filter(v => {
        const vId = String(v.user_id || v.id);
        const isAlreadyMember = currentMembers.some(m => String(m.user_id || m.id) === vId);
        const isActive = v.status?.toLowerCase() === 'active' || v.account_status?.toLowerCase() === 'active';
        return !isAlreadyMember && isActive;
    });

    // ترتيب القائمة لعرض الرئيس أولاً
    const sortedMembers = [...currentMembers].sort((a, b) => {
        if (a.user_id === localChairId) return -1;
        if (b.user_id === localChairId) return 1;
        return 0;
    });

    return (
        <BaseModal isOpen={isOpen} onClose={onClose} title="Manage Members" subtitle={chapter?.name}>
            <div className="space-y-8 min-h-[450px]">
                
                {/* 1. Add Volunteer Section */}
                <div className="space-y-3" ref={dropdownRef}>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Add Volunteer</label>
                    <div className="relative">
                        <button
                            type="button"
                            disabled={actionLoading || loading}
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className={`w-full flex items-center justify-between bg-[#F8FAFC] border-2 rounded-[1.5rem] px-6 py-4 text-xs font-bold transition-all ${isDropdownOpen ? 'border-blue-100 bg-white shadow-md' : 'border-transparent'}`}
                        >
                            <div className="flex items-center gap-3">
                                {loading ? <Loader2 size={16} className="animate-spin text-blue-500" /> : <Search size={16} className="text-[#00629B]" />}
                                <span className={isDropdownOpen ? "text-slate-800" : "text-slate-400"}>
                                    {loading ? "Syncing branch data..." : "Search active branch volunteers..."}
                                </span>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-[#00629B] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute z-[100] w-full mt-2 bg-white border border-slate-100 rounded-[2rem] shadow-2xl max-h-[250px] overflow-y-auto p-2 no-scrollbar animate-in fade-in zoom-in-95 duration-200">
                                {availableOptions.length > 0 ? availableOptions.map((v) => (
                                    <div 
                                        key={v.user_id || v.id} 
                                        onClick={() => handleAdd(v.user_id || v.id)} 
                                        className="flex items-center justify-between px-5 py-4 rounded-2xl cursor-pointer hover:bg-blue-50 transition-all mb-1 group"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-black uppercase text-slate-700">{v.full_name}</span>
                                            <div className="flex items-center gap-1.5 text-[8px] text-slate-400 font-bold mt-0.5">
                                                <Mail size={10} /> {v.email}
                                            </div>
                                        </div>
                                        <UserPlus size={16} className="text-slate-300 group-hover:text-[#00629B] group-hover:scale-110 transition-all" />
                                    </div>
                                )) : (
                                    <div className="p-8 text-center space-y-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase italic">No candidates available</p>
                                        <p className="text-[8px] text-slate-300 font-bold leading-relaxed px-4">Only active branch members who haven't joined this chapter yet will appear here.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="h-px bg-slate-50 mx-2" />

                {/* 2. Chapter Roster List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Chapter Roster</label>
                        <span className="text-[9px] font-black bg-blue-50 text-[#00629B] px-3 py-1 rounded-full uppercase tracking-widest">
                            {currentMembers.length} Members
                        </span>
                    </div>

                    <div className="space-y-3">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center p-12 space-y-3">
                                <Loader2 className="animate-spin text-[#00629B]" size={32} />
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Updating roster...</span>
                            </div>
                        ) : sortedMembers.length > 0 ? sortedMembers.map(m => {
                            const isChair = localChairId === m.user_id;
                            return (
                                <div
                                    key={m.user_id || m.id}
                                    className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-[1.8rem] border border-transparent hover:border-blue-100 transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-11 h-11 rounded-[1.1rem] flex items-center justify-center font-black text-xs shadow-sm transition-all ${isChair ? "bg-amber-100 text-amber-600 scale-105 border border-amber-200" : "bg-white text-[#00629B] border border-slate-100"}`}>
                                            {isChair ? <Crown size={18} /> : m.full_name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="text-xs font-black text-slate-800 uppercase flex items-center gap-2">
                                                {m.full_name}
                                                {isChair && (
                                                    <span className="px-2.5 py-0.5 bg-amber-100 text-amber-600 rounded-lg text-[7px] font-black tracking-[0.2em] border border-amber-200">
                                                        CHAIR
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">
                                                {isChair ? "Chapter Executive Lead" : (m.pivot?.role_in_chapter || "Standard Member")}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                        {isChair ? (
                                            <button
                                                onClick={handleRemoveChair}
                                                disabled={actionLoading}
                                                className="p-3 text-amber-600 hover:bg-amber-100 rounded-2xl transition-all"
                                                title="Revoke Chair Position"
                                            >
                                                <ShieldX size={16} />
                                            </button>
                                        ) : (
                                            !localChairId && (
                                                <button
                                                    onClick={() => handleAssignChair(m.user_id)}
                                                    disabled={actionLoading}
                                                    className="p-3 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-2xl transition-all"
                                                    title="Promote to Chair"
                                                >
                                                    <Crown size={16} />
                                                </button>
                                            )
                                        )}

                                        <button
                                            onClick={() => handleRemoveMember(m.user_id)}
                                            disabled={actionLoading}
                                            className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                                            title="Remove from Chapter"
                                        >
                                            <UserMinus size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="p-12 text-center bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-100">
                                <p className="text-[10px] font-black text-slate-300 uppercase italic tracking-widest">No members enrolled in this chapter yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </BaseModal>
    );
};

export default MemberManagementModal;