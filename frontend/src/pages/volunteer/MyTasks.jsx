import React, { useState, useEffect } from 'react';
import { volunteerService } from '../../services/volunteerService';
import { CheckCircle2, Clock, LayoutList, MessageSquare, Loader2, Search, Target } from 'lucide-react';
import toast from 'react-hot-toast';
import Loader from '../../components/ui/Loader'; // 🌟 استدعاء اللودر المخصص تبعك

const MyTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await volunteerService.getMyTasks();
            const realData = response.data?.data || response.data || [];
            setTasks(realData);
        } catch (error) {
            console.error("Error fetching tasks:", error);
            toast.error("Failed to fetch your tasks");
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        fetchTasks(); 
    }, []);

    const handleUpdateProgress = async (assignmentId, currentPct) => {
        const newPct = prompt("Enter new completion percentage (0-100):", currentPct);
        if (newPct === null || newPct === "") return;
        
        const pctValue = parseInt(newPct);
        if (isNaN(pctValue) || pctValue < 0 || pctValue > 100) {
            toast.error("Invalid percentage");
            return;
        }

        try {
            setUpdatingId(assignmentId);
            // استدعاء الـ API الحقيقي لتحديث النسبة
            await volunteerService.updateTaskProgress(assignmentId, { completion_pct: pctValue });
            
            // تحديث الواجهة بعد نجاح الطلب
            setTasks(tasks.map(t => t.id === assignmentId ? { ...t, completion_pct: pctValue } : t));
            toast.success("Progress updated successfully!");
        } catch (error) {
            console.error("Update Progress Error:", error);
            toast.error(error.response?.data?.message || "Failed to update progress");
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredTasks = tasks.filter(t => 
        t.task?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.project?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // 🌟 استخدام اللودر المخصص تبعك هنا
    if (loading) return <Loader message="Syncing missions..." />;

    return (
        <div className="p-4 md:p-10 animate-in fade-in duration-700 max-w-7xl mx-auto">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                <div>
                    <h1 className="text-3xl md:text-5xl font-[900] text-[#00629B] italic tracking-tight uppercase leading-none">
                        My Tasks
                    </h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-4 flex items-center justify-center md:justify-start gap-2">
                        <LayoutList size={14} /> Mission Control Center
                    </p>
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input 
                        type="text"
                        placeholder="Search missions..."
                        className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-6 text-xs font-bold shadow-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* حالة عدم وجود مهام (Empty State) */}
            {filteredTasks.length === 0 ? (
                <div className="py-32 text-center bg-white rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col items-center gap-6">
                    <div className="p-6 bg-slate-50 rounded-full text-slate-200"><Target size={48} /></div>
                    <p className="text-xs font-black text-slate-400 uppercase italic tracking-[0.3em]">No tasks assigned to you yet</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-20">
                    {filteredTasks.map((assignment) => (
                        <div key={assignment.id} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
                            
                            <div className="flex items-center gap-2 mb-6">
                                <span className="px-4 py-1.5 bg-blue-50 text-[#00629B] text-[9px] font-black uppercase tracking-widest rounded-xl border border-blue-100">
                                    {assignment.project?.name || "General"}
                                </span>
                                {assignment.completion_pct === 100 && (
                                    <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-xl border border-emerald-100 flex items-center gap-1">
                                        <CheckCircle2 size={10} /> Done
                                    </span>
                                )}
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xl font-black text-slate-800 leading-tight group-hover:text-[#00629B] transition-colors uppercase italic tracking-tight">
                                    {assignment.task?.title}
                                </h3>
                                <p className="text-xs font-medium text-slate-500 leading-relaxed line-clamp-2">
                                    {assignment.task?.description}
                                </p>
                            </div>

                            <div className="mt-10 space-y-4">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
                                        <div className="text-2xl font-black text-[#00629B]">{assignment.completion_pct}%</div>
                                    </div>
                                    <button 
                                        disabled={updatingId === assignment.id || assignment.completion_pct === 100}
                                        onClick={() => handleUpdateProgress(assignment.id, assignment.completion_pct)}
                                        className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#00629B] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {updatingId === assignment.id ? (
                                            <><Loader2 size={12} className="animate-spin" /> Updating...</>
                                        ) : (
                                            <><Clock size={12} /> Update</>
                                        )}
                                    </button>
                                </div>
                                
                                <div className="h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                    <div 
                                        className={`h-full transition-all duration-1000 ${assignment.completion_pct === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-[#00629B] to-blue-400'}`}
                                        style={{ width: `${assignment.completion_pct}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-4 text-slate-400">
                                    <div className="flex items-center gap-1.5">
                                        <MessageSquare size={14} />
                                        <span className="text-[10px] font-bold">{assignment.progress_note ? "Active Logs" : "No notes"}</span>
                                    </div>
                                </div>
                                <div className="text-[9px] font-black text-slate-300 uppercase italic">
                                    Deadline: {assignment.task?.due_date || "TBD"}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyTasks;