import React, { useState, useEffect, useRef } from 'react';
import { Users, Filter, ShieldCheck, Mail, Circle, LayoutGrid, ChevronDown, Check, UserX } from 'lucide-react';
import { chapterService } from '../../../services/chapterService'; 
import Loader from '../../../components/ui/Loader';
import toast from 'react-hot-toast';

const ChapterMembers = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [isRoleOpen, setIsRoleOpen] = useState(false);
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const roleRef = useRef(null);
    const statusRef = useRef(null);

    const getRoleBadgeConfig = (role) => {
        if (role === 'Project Leader') return 'bg-purple-50 text-purple-600 border-purple-100';
        return 'bg-blue-50 text-[#00629B] border-blue-100';
    };

    const getStatusColor = (status) => {
        if (status === 'Active') return 'text-emerald-500 fill-emerald-500';
        return 'text-slate-300 fill-slate-300';
    };

    const fetchMembers = async () => {
        const chapterId = localStorage.getItem('chapter_id');
        const currentUserId = localStorage.getItem('user_id'); 

        if (!chapterId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const response = await chapterService.getChapterMembers(chapterId, roleFilter, statusFilter);
            const allData = response.data?.data || response.data || [];
            
            // 🌟 فلترة صارمة لإخفاء حسابك (عن طريق الرتبة أو الـ ID)
            const filteredMembers = allData.filter(member => {
                const isChapterChair = member.role === 'Chapter Chair';
                const isMe = currentUserId && String(member.user_id) === String(currentUserId);
                return !isChapterChair && !isMe;
            });

            setMembers(filteredMembers);
        } catch (error) {
            toast.error("Failed to load chapter members.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchMembers(); }, [roleFilter, statusFilter]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (roleRef.current && !roleRef.current.contains(event.target)) setIsRoleOpen(false);
            if (statusRef.current && !statusRef.current.contains(event.target)) setIsStatusOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const roleOptions = [
        { label: 'All Technical Roles', value: '' },
        { label: 'Volunteers', value: 'Volunteer' },
        { label: 'Project Leaders', value: 'Project Leader' },
    ];

    const statusOptions = [
        { label: 'All Members', value: '' },
        { label: 'Active Member', value: 'Active' },
        { label: 'Inactive Member', value: 'Inactive' },
    ];

    return (
        <div className="p-2 md:p-6 animate-in fade-in duration-700 max-w-7xl mx-auto min-h-screen">
            
            <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-end mb-10">
                <div>
                    <h1 className="text-3xl md:text-4xl font-[900] text-[#00629B] italic tracking-tight uppercase">Chapter Members</h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-3 ml-1 flex items-center gap-2">
                        <Users size={14} /> Volunteer Roster
                    </p>
                </div>
                <div className="flex gap-4 bg-white p-3 rounded-3xl border border-slate-100 shadow-sm w-full lg:w-auto">
                    <div className="px-5 py-2 bg-slate-50 rounded-2xl flex flex-col items-center flex-1">
                        <span className="text-xl font-black text-[#00629B]">{members.length}</span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
                    </div>
                    <div className="px-5 py-2 bg-emerald-50 rounded-2xl flex flex-col items-center flex-1">
                        <span className="text-xl font-black text-emerald-600">{members.filter(m => m.status === 'Active').length}</span>
                        <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">Active</span>
                    </div>
                </div>
            </div>

            <div className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm mb-12 flex flex-col md:flex-row gap-6 items-center relative z-[100]">
                <div className="flex items-center gap-3 text-[#00629B] px-4 shrink-0">
                    <div className="p-2 bg-blue-50 rounded-xl"><Filter size={18} strokeWidth={2.5} /></div>
                    <span className="text-[11px] font-[900] uppercase tracking-[0.2em]">Filter</span>
                </div>
                <div className="h-10 w-px bg-slate-100 hidden md:block"></div>
                <div className="flex-1 w-full flex flex-col sm:flex-row gap-8">
                    <div className="relative flex-1" ref={roleRef}>
                        <label className="absolute -top-2.5 left-5 bg-white px-2 text-[8px] font-black uppercase tracking-widest text-slate-400 z-20">Role</label>
                        <button onClick={() => {setIsRoleOpen(!isRoleOpen); setIsStatusOpen(false);}} className={`w-full bg-slate-50/50 border rounded-2xl py-4 px-6 text-[11px] font-black text-slate-600 flex justify-between items-center transition-all ${isRoleOpen ? 'border-[#00629B] bg-white shadow-md' : 'border-slate-100 hover:border-blue-200'}`}>
                            {roleOptions.find(o => o.value === roleFilter)?.label}
                            <ChevronDown size={16} className={`transition-transform duration-300 ${isRoleOpen ? 'rotate-180 text-[#00629B]' : 'text-slate-300'}`} />
                        </button>
                        {isRoleOpen && (
                            <div className="absolute top-[110%] left-0 w-full bg-white border border-slate-100 rounded-[1.8rem] shadow-2xl p-2 z-[110] animate-in zoom-in-95 duration-200">
                                {roleOptions.map((opt) => (
                                    <button key={opt.value} onClick={() => { setRoleFilter(opt.value); setIsRoleOpen(false); }} className={`w-full text-left px-5 py-3.5 rounded-2xl text-[10px] font-[800] uppercase tracking-widest flex justify-between items-center transition-colors mb-1 last:mb-0 ${roleFilter === opt.value ? 'bg-blue-50 text-[#00629B]' : 'text-slate-500 hover:bg-slate-50'}`}>
                                        {opt.label}{roleFilter === opt.value && <Check size={14} strokeWidth={3} />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="relative flex-1" ref={statusRef}>
                        <label className="absolute -top-2.5 left-5 bg-white px-2 text-[8px] font-black uppercase tracking-widest text-slate-400 z-20">Status</label>
                        <button onClick={() => {setIsStatusOpen(!isStatusOpen); setIsRoleOpen(false);}} className={`w-full bg-slate-50/50 border rounded-2xl py-4 px-6 text-[11px] font-black text-slate-600 flex justify-between items-center transition-all ${isStatusOpen ? 'border-[#00629B] bg-white shadow-md' : 'border-slate-100 hover:border-blue-200'}`}>
                            {statusOptions.find(o => o.value === statusFilter)?.label}
                            <ChevronDown size={16} className={`transition-transform duration-300 ${isStatusOpen ? 'rotate-180 text-[#00629B]' : 'text-slate-300'}`} />
                        </button>
                        {isStatusOpen && (
                            <div className="absolute top-[110%] left-0 w-full bg-white border border-slate-100 rounded-[1.8rem] shadow-2xl p-2 z-[110] animate-in zoom-in-95 duration-200">
                                {statusOptions.map((opt) => (
                                    <button key={opt.value} onClick={() => { setStatusFilter(opt.value); setIsStatusOpen(false); }} className={`w-full text-left px-5 py-3.5 rounded-2xl text-[10px] font-[800] uppercase tracking-widest flex justify-between items-center transition-colors mb-1 last:mb-0 ${statusFilter === opt.value ? 'bg-emerald-50 text-emerald-600' : 'text-slate-500 hover:bg-slate-50'}`}>
                                        {opt.label}{statusFilter === opt.value && <Check size={14} strokeWidth={3} />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {loading ? (
                <Loader message="Syncing member database..." />
            ) : members.length === 0 ? (
                <div className="py-32 text-center bg-white rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col items-center gap-6">
                    <div className="p-6 bg-slate-50 rounded-full text-slate-200"><UserX size={48} /></div>
                    <p className="text-xs font-black text-slate-400 uppercase italic tracking-[0.3em]">No members found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {members.map((member) => (
                        <div key={member.user_id} className="bg-white rounded-[2.8rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all group flex flex-col relative overflow-hidden">
                            <div className="flex justify-between items-start mb-8 relative z-10">
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-[#00629B] to-[#004266] text-white flex items-center justify-center text-2xl font-black shadow-xl group-hover:rotate-6 transition-all duration-500">
                                        {member.full_name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white shadow-sm ${member.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                </div>
                                <span className={`px-4 py-2 text-[8px] font-[900] uppercase tracking-widest rounded-xl border shadow-sm ${getRoleBadgeConfig(member.role)}`}>
                                    {member.role || 'Volunteer'}
                                </span>
                            </div>
                            <div className="space-y-2 mb-8 flex-1 relative z-10">
                                <h3 className="text-lg font-black text-slate-800 truncate group-hover:text-[#00629B] transition-colors tracking-tight">{member.full_name}</h3>
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Mail size={12} className="shrink-0" /><p className="text-[10px] font-bold truncate">{member.email}</p>
                                </div>
                            </div>
                            <hr className="border-slate-50 mb-6" />
                            <div className="flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-2">
                                    <Circle size={8} className={`${getStatusColor(member.status)} ${member.status === 'Active' ? 'animate-pulse' : ''}`} />
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                        {member.status === 'Active' ? 'Active Member' : 'Inactive Member'}
                                    </span>
                                </div>
                                {member.role === 'Project Leader' && (
                                    <div className="p-2.5 bg-purple-50 rounded-xl text-purple-500 shadow-sm border border-purple-100">
                                        <ShieldCheck size={18} strokeWidth={2.5} />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ChapterMembers;