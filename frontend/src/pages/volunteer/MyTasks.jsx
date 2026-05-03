import React, { useState, useEffect } from 'react';
import { volunteerService } from '../../services/volunteerService';
import { CheckCircle2, Clock, LayoutList, MessageSquare, ClipboardCheck, Loader2, Search, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const MyTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    // 🌟 بيانات وهمية للمعاينة (Mock Data)
    const mockTasks = [
        {
            id: 1,
            completion_pct: 75,
            progress_note: "Working on the secondary pages",
            project: { name: "IEEE Tech Hub Website" },
            task: { 
                title: "Frontend Development - UI Kit", 
                description: "Implement the reusable UI components using Tailwind CSS and Lucide icons.",
                due_date: "2026-05-15"
            }
        },
        {
            id: 2,
            completion_pct: 100,
            progress_note: "All assets delivered",
            project: { name: "IEEE Brand Identity" },
            task: { 
                title: "Social Media Graphics", 
                description: "Design 10 templates for Instagram posts regarding the upcoming workshop.",
                due_date: "2026-05-01"
            }
        },
        {
            id: 3,
            completion_pct: 30,
            progress_note: "Initial research completed",
            project: { name: "Robotics Workshop" },
            task: { 
                title: "Content Writing", 
                description: "Write the curriculum for the basic Arduino module and prepare the slides.",
                due_date: "2026-06-10"
            }
        }
    ];

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await volunteerService.getMyTasks();
            const realData = response.data?.data || response.data || [];
            
            // 🌟 إذا لم تتوفر بيانات من السيرفر، نعرض البيانات الوهمية
            setTasks(realData.length > 0 ? realData : mockTasks);
        } catch (error) {
            console.log("Using Mock Data for preview...");
            setTasks(mockTasks); // عرض البيانات الوهمية في حال فشل الـ API
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTasks(); }, []);

    // ... باقي الدوال (handleUpdateProgress, Filter) تبقى كما هي ...

    const handleUpdateProgress = async (assignmentId, currentPct) => {
        const newPct = prompt("Enter new completion percentage (0-100):", currentPct);
        if (newPct === null || newPct === "") return;
        
        const pctValue = parseInt(newPct);
        if (isNaN(pctValue) || pctValue < 0 || pctValue > 100) {
            toast.error("Invalid percentage");
            return;
        }

        // ملاحظة: هنا سنقوم بتحديث الحالة محلياً فقط للمعاينة إذا كانت البيانات وهمية
        setTasks(tasks.map(t => t.id === assignmentId ? { ...t, completion_pct: pctValue } : t));
        toast.success("Progress updated locally (Preview Mode)");
    };

    const filteredTasks = tasks.filter(t => 
        t.task?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.project?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
            <Loader2 className="animate-spin text-[#00629B]" size={40} />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Syncing missions...</span>
        </div>
    );

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

            {/* Banner Mode (Optional) */}
            <div className="mb-8 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-3 text-amber-700">
                <AlertCircle size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">Preview Mode: Displaying sample tasks</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {filteredTasks.map((assignment) => (
                    <div key={assignment.id} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
                        
                        <div className="flex items-center gap-2 mb-6">
                            <span className="px-4 py-1.5 bg-blue-50 text-[#00629B] text-[9px] font-black uppercase tracking-widest rounded-xl border border-blue-100">
                                {assignment.project?.name}
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
                                    onClick={() => handleUpdateProgress(assignment.id, assignment.completion_pct)}
                                    className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#00629B] transition-all"
                                >
                                    <Clock size={12} /> Update
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
                                Deadline: {assignment.task?.due_date}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyTasks;