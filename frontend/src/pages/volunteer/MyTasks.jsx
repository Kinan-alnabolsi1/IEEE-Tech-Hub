import React, { useState, useEffect } from 'react';
import { volunteerService } from '../../services/volunteerService';
import { CheckCircle2, Clock, LayoutList, MessageSquare, Loader2, Search, Target, Calendar, Percent } from 'lucide-react';
import toast from 'react-hot-toast';
import Loader from '../../components/ui/Loader'; 
import BaseModal from '../../components/ui/BaseModal'; // تأكدي إنو هاد الـ Import موجود

const MyTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // 🌟 حالات النافذة الجديدة لتحديث النسبة
    const [progressModal, setProgressModal] = useState({ isOpen: false, taskId: null, pct: 0 });
    const [progressSubmitting, setProgressSubmitting] = useState(false);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await volunteerService.getMyTasks();
            const realData = response.data?.data || response.data || [];
            setTasks(realData);
        } catch (error) {
            console.error("Error fetching tasks:", error);
            if (error.response?.status === 500) {
                toast.error("Server Error: Unable to sync tasks from database.");
            } else {
                toast.error("Failed to fetch your tasks");
            }
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        fetchTasks(); 
    }, []);

    // 🌟 دالة لفتح النافذة بدل الـ prompt المزعج
    const openProgressModal = (taskId, currentPct) => {
        setProgressModal({ isOpen: true, taskId, pct: currentPct });
    };

    // 🌟 دالة حفظ النسبة الجديدة بعد التأكيد من النافذة
    const submitProgressUpdate = async () => {
        const { taskId, pct } = progressModal;
        
        setProgressSubmitting(true);
        try {
            await volunteerService.updateTaskProgress(taskId, { completion_pct: pct });
            
            // تحديث الواجهة فوراً
            setTasks(prevTasks => prevTasks.map(t => 
                (t.id === taskId || t.task_id === taskId) 
                ? { ...t, completion_pct: pct } 
                : t
            ));
            
            toast.success("Progress updated! Keep up the good work! 🚀");
            setProgressModal({ isOpen: false, taskId: null, pct: 0 }); // إغلاق النافذة
        } catch (error) {
            console.error("Update Progress Error:", error);
            toast.error(error.response?.data?.message || "Failed to update progress");
        } finally {
            setProgressSubmitting(false);
        }
    };

    const filteredTasks = tasks.filter(t => {
        const title = t.task?.title || t.title || "";
        const projectName = t.project?.name || t.project?.title || "";
        return title.toLowerCase().includes(searchQuery.toLowerCase()) ||
               projectName.toLowerCase().includes(searchQuery.toLowerCase());
    });

    if (loading) return <Loader message="Syncing missions from command center..." />;

    return (
        <div className="p-4 md:p-10 animate-in fade-in duration-700 max-w-7xl mx-auto h-full flex flex-col">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                <div>
                    <h1 className="text-3xl md:text-5xl font-[900] text-[#00629B] italic tracking-tight uppercase leading-none">
                        My Operations
                    </h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-4 flex items-center gap-2">
                        <LayoutList size={14} /> Mission Control Center
                    </p>
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input 
                        type="text"
                        placeholder="Search assignments..."
                        className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-6 text-xs font-bold shadow-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Empty State */}
            {filteredTasks.length === 0 ? (
                <div className="py-32 text-center bg-white rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col items-center gap-6">
                    <div className="p-6 bg-slate-50 rounded-full text-slate-200"><Target size={48} /></div>
                    <div className="space-y-2">
                        <p className="text-sm font-black text-slate-700 uppercase italic tracking-widest">No Active Assignments</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Check back later for new mission deployments</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-20">
                    {filteredTasks.map((assignment) => {
                        const taskData = assignment.task || assignment;
                        const taskId = assignment.id || assignment.task_id;
                        const pct = assignment.completion_pct || 0;
                        const isDone = pct === 100;

                        return (
                            <div key={taskId} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
                                
                                <div className="flex items-center justify-between mb-6">
                                    <span className="px-4 py-1.5 bg-blue-50 text-[#00629B] text-[9px] font-black uppercase tracking-widest rounded-xl border border-blue-100">
                                        {assignment.project?.name || assignment.project?.title || "Assigned Mission"}
                                    </span>
                                    {isDone && (
                                        <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-xl border border-emerald-100 flex items-center gap-1">
                                            <CheckCircle2 size={10} /> Completed
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xl font-black text-slate-800 leading-tight group-hover:text-[#00629B] transition-colors uppercase italic tracking-tight">
                                        {taskData.title}
                                    </h3>
                                    <p className="text-xs font-medium text-slate-500 leading-relaxed line-clamp-2">
                                        {taskData.description || "No additional briefing provided for this task."}
                                    </p>
                                </div>

                                <div className="mt-10 space-y-4">
                                    <div className="flex justify-between items-end">
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Efficiency Rate</span>
                                            <div className="text-2xl font-black text-[#00629B]">{pct}%</div>
                                        </div>
                                        <button 
                                            disabled={isDone}
                                            onClick={() => openProgressModal(taskId, pct)}
                                            className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#00629B] transition-all disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed shadow-lg active:scale-95"
                                        >
                                            <Clock size={12} /> Update Progress
                                        </button>
                                    </div>
                                    
                                    {/* Progress Bar */}
                                    <div className="h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-1000 ${isDone ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-gradient-to-r from-[#00629B] to-blue-400'}`}
                                            style={{ width: `${pct}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-slate-400">
                                        <div className="flex items-center gap-1.5">
                                            <MessageSquare size={14} />
                                            <span className="text-[10px] font-bold uppercase tracking-tighter">Report Active</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-rose-400">
                                        <Calendar size={13} />
                                        <span className="text-[9px] font-black uppercase italic">
                                            Deadline: {taskData.due_date || "No Date"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* 🌟 النافذة الفخمة لتحديث النسبة */}
            <BaseModal 
                isOpen={progressModal.isOpen} 
                onClose={() => !progressSubmitting && setProgressModal({ ...progressModal, isOpen: false })} 
                title="UPDATE TASK PROGRESS"
            >
                <div className="space-y-8 py-2">
                    
                    {/* عرض النسبة الكبيرة بالنص */}
                    <div className="text-center space-y-2 bg-blue-50/50 py-6 rounded-[2rem] border border-blue-50">
                        <div className="flex justify-center items-center text-[#00629B]">
                            <span className="text-6xl font-[900] tracking-tighter">{progressModal.pct}</span>
                            <Percent size={32} className="opacity-50 ml-1" />
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Current Completion Rate</p>
                    </div>

                    {/* شريط السحب (Slider) */}
                    <div className="space-y-4 px-2">
                        <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            step="5"
                            value={progressModal.pct}
                            onChange={(e) => setProgressModal({ ...progressModal, pct: parseInt(e.target.value) })}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#00629B]"
                        />
                        <div className="flex justify-between text-[10px] font-black text-slate-300">
                            <span>0%</span>
                            <span>50%</span>
                            <span>100%</span>
                        </div>
                    </div>

                    {/* أزرار النسب السريعة */}
                    <div className="grid grid-cols-5 gap-2">
                        {[0, 25, 50, 75, 100].map(val => (
                            <button
                                key={val}
                                type="button"
                                onClick={() => setProgressModal({ ...progressModal, pct: val })}
                                className={`py-3 rounded-xl text-[11px] font-black transition-all ${progressModal.pct === val ? 'bg-[#00629B] text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-100'}`}
                            >
                                {val}%
                            </button>
                        ))}
                    </div>

                    {/* زر الحفظ */}
                    <button 
                        onClick={submitProgressUpdate}
                        disabled={progressSubmitting}
                        className="w-full bg-[#00629B] text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        {progressSubmitting ? (
                            <><Loader2 size={16} className="animate-spin"/> SYNCING DATA...</>
                        ) : (
                            <><CheckCircle2 size={16}/> CONFIRM PROGRESS</>
                        )}
                    </button>
                </div>
            </BaseModal>
        </div>
    );
};

export default MyTasks;