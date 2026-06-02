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

    // 🌟 رجعنا الحالات الأصلية للأعضاء (Active / Inactive) فقط
    const getStatusBgColor = (status) => {
        return (status === 'Active' || !status) ? 'bg-emerald-500' : 'bg-slate-300';
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
        // نطلب كل الأعضاء بدون فلتر حالة للسيرفر
        const response = await chapterService.getChapterMembers(chapterId, roleFilter, '');
        const allData = response.data?.data || response.data || [];
        
        const filteredMembers = allData.filter(member => {
            const isMe = currentUserId && String(member.user_id) === String(currentUserId);
            const isChapterChair = member.role === 'Chapter Chair';
            
            // 🌟 تنظيف مسمى الحالة القادم من السيرفر
            const dbStatus = String(member.status || '').toLowerCase().trim();
            const filterValue = statusFilter.toLowerCase().trim();
            
            let matchesStatus = true;

            if (filterValue === 'active') {
                // نعتبره نشط إذا كان active أو إذا كان الحقل فارغاً
                matchesStatus = (dbStatus === 'active' || dbStatus === '');
            } else if (filterValue === 'inactive') {
                // 🌟 التعديل الجوهري: نعتبره غير نشط إذا كان suspended أو inactive
                matchesStatus = (dbStatus === 'suspended' || dbStatus === 'inactive');
            }

            return !isChapterChair && !isMe && matchesStatus;
        });

        setMembers(filteredMembers);
    } catch (error) {
        toast.error("Failed to load chapter members.",error);
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
        /* 🌟 حل مشكلة التداخل: استخدام relative بدون margin-left ضخم يضرب السايد بار */
        <div className="w-full p-6 md:p-10 animate-in fade-in duration-500 relative z-10">
            
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-end mb-12 relative z-10">
                <div className="lg:ml-4">
                    <h1 className="text-4xl md:text-5xl font-[900] text-[#00629B] italic tracking-tight uppercase leading-tight">
                        Chapter Members
                    </h1>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.5em] mt-4 ml-1 flex items-center gap-2">
                        <Users size={16} /> Volunteer Roster
                    </p>
                </div>
                
                <div className="flex gap-4 bg-white p-3 rounded-[2rem] border border-slate-100 shadow-sm mr-4">
                    <div className="px-8 py-3 bg-slate-50 rounded-2xl flex flex-col items-center min-w-[100px]">
                        <span className="text-2xl font-black text-[#00629B]">{members.length}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
                    </div>
                    <div className="px-8 py-3 bg-emerald-50 rounded-2xl flex flex-col items-center min-w-[100px]">
                        <span className="text-2xl font-black text-emerald-600">
                            {members.filter(m => m.status === 'Active' || !m.status).length}
                        </span>
                        <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Active</span>
                    </div>
                </div>
            </div>

            {/* Filter Bar - z-index أقل من السايد بار لضمان عدم التداخل */}
            <div className="bg-white p-6 rounded-[3rem] border border-slate-100 shadow-sm mb-16 flex flex-col md:flex-row gap-8 items-center relative z-20 max-w-[98%] mx-auto">
                <div className="flex items-center gap-4 text-[#00629B] px-6 border-r border-slate-100 hidden md:flex">
                    <div className="p-3 bg-blue-50 rounded-2xl"><Filter size={20} strokeWidth={3} /></div>
                    <span className="text-sm font-[900] uppercase tracking-[0.2em]">Filter</span>
                </div>
                
                <div className="flex-1 w-full flex flex-col sm:flex-row gap-10">
                    <div className="relative flex-1" ref={roleRef}>
                        <label className="absolute -top-3 left-6 bg-white px-3 text-[10px] font-black uppercase tracking-widest text-slate-400 z-10">Role</label>
                        <button onClick={() => {setIsRoleOpen(!isRoleOpen); setIsStatusOpen(false);}} className={`w-full bg-slate-50/50 border rounded-[1.8rem] py-5 px-8 text-xs font-black text-slate-600 flex justify-between items-center transition-all ${isRoleOpen ? 'border-[#00629B] bg-white shadow-md' : 'border-slate-50'}`}>
                            {roleOptions.find(o => o.value === roleFilter)?.label}
                            <ChevronDown size={18} className={`transition-transform duration-300 ${isRoleOpen ? 'rotate-180 text-[#00629B]' : 'text-slate-300'}`} />
                        </button>
                        {isRoleOpen && (
                            <div className="absolute top-[115%] left-0 w-full bg-white border border-slate-100 rounded-[2rem] shadow-2xl p-3 z-30">
                                {roleOptions.map((opt) => (
                                    <button key={opt.value} onClick={() => { setRoleFilter(opt.value); setIsRoleOpen(false); }} className={`w-full text-left px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest flex justify-between items-center transition-all ${roleFilter === opt.value ? 'bg-blue-50 text-[#00629B]' : 'text-slate-500 hover:bg-slate-50'}`}>
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="relative flex-1" ref={statusRef}>
                        <label className="absolute -top-3 left-6 bg-white px-3 text-[10px] font-black uppercase tracking-widest text-slate-400 z-10">Status</label>
                        <button onClick={() => {setIsStatusOpen(!isStatusOpen); setIsRoleOpen(false);}} className={`w-full bg-slate-50/50 border rounded-[1.8rem] py-5 px-8 text-xs font-black text-slate-600 flex justify-between items-center transition-all ${isStatusOpen ? 'border-[#00629B] bg-white shadow-md' : 'border-slate-50'}`}>
                            {statusOptions.find(o => o.value === statusFilter)?.label}
                            <ChevronDown size={18} className={`transition-transform duration-300 ${isStatusOpen ? 'rotate-180 text-[#00629B]' : 'text-slate-300'}`} />
                        </button>
                        {isStatusOpen && (
                            <div className="absolute top-[115%] left-0 w-full bg-white border border-slate-100 rounded-[2rem] shadow-2xl p-3 z-30">
                                {statusOptions.map((opt) => (
                                    <button key={opt.value} onClick={() => { setStatusFilter(opt.value); setIsStatusOpen(false); }} className={`w-full text-left px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest flex justify-between items-center transition-all ${statusFilter === opt.value ? 'bg-blue-50 text-[#00629B]' : 'text-slate-500 hover:bg-slate-50'}`}>
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {loading ? (
                <Loader />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 px-4 pb-20">
                    {members.map((member) => (
                        <div key={member.user_id} className="bg-white rounded-[3.5rem] p-10 border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 group flex flex-col items-center text-center relative overflow-visible">
                            
                            <div className="relative mb-8">
                                <div className="w-24 h-24 rounded-[2.5rem] bg-[#00629B] text-white flex items-center justify-center text-3xl font-black shadow-xl group-hover:rotate-6 transition-transform duration-500">
                                    {member.full_name?.charAt(0).toUpperCase()}
                                </div>
                                
                                <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-[6px] border-white shadow-md ${getStatusBgColor(member.status)}`}></div>
                                
                                <div className="absolute -top-4 -right-12">
                                    <span className={`px-4 py-1.5 text-[8px] font-black uppercase tracking-widest rounded-xl shadow-sm border ${getRoleBadgeConfig(member.role)}`}>
                                        {member.role || 'Volunteer'}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3 mb-8 w-full">
                                <h3 className="text-xl font-[900] text-slate-800 uppercase tracking-tight truncate px-2">{member.full_name}</h3>
                                <div className="flex items-center justify-center gap-2 text-slate-400">
                                    <Mail size={14} /><p className="text-[11px] font-bold truncate max-w-[150px]">{member.email}</p>
                                </div>
                            </div>

                            <div className="w-full pt-8 border-t border-slate-50 flex items-center justify-center gap-3">
                                <div className={`w-2.5 h-2.5 rounded-full ${getStatusBgColor(member.status)}`} />
                                <span className="text-[10px] font-[900] text-slate-400 uppercase tracking-[0.2em]">
                                    {member.status === 'Active' ? 'Active Member' : 'Inactive Member'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ChapterMembers;