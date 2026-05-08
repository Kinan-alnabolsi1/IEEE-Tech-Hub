import React, { useState, useEffect } from 'react';
import { volunteerService } from '../../services/volunteerService';
import Loader from '../../components/ui/Loader';
import { Star, Award, CheckCircle2, MessageSquare, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const VolunteerDashboard = () => {
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOverview = async () => {
            try {
                const profileRes = await volunteerService.getProfile();
                const userId = profileRes.data?.data?.user_id || profileRes.data?.user_id || profileRes.data?.data?.id || profileRes.data?.id;

                if (userId) {
                    const overviewRes = await volunteerService.getOverview(userId);
                    setOverview(overviewRes.data?.data || overviewRes.data);
                }
            } catch (error) {
                console.error("Overview Fetch Error:", error);
                toast.error("Failed to load dashboard data.");
            } finally {
                setLoading(false);
            }
        };
        fetchOverview();
    }, []);

    if (loading) return <Loader message="Loading your performance..." />;
    if (!overview) return <div className="p-10 text-center font-bold text-slate-500">No data available.</div>;

    const { user_info, performance, task_feedbacks } = overview;
    const avgRating = parseFloat(performance?.average_rating || 0).toFixed(1);

    return (
        <div className="p-3 md:p-10 animate-in fade-in duration-700 max-w-5xl mx-auto space-y-6 md:space-y-8">
            
            <div className="mb-4 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-black text-[#00629B] uppercase italic tracking-tight">My Overview</h1>
                <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] md:tracking-[0.4em] mt-2">Welcome back, {user_info?.full_name}</p>
            </div>

            {/* 🌟 قسم الإحصائيات - Responsive Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="bg-gradient-to-br from-[#00629B] to-blue-500 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] text-white shadow-xl shadow-blue-200 relative overflow-hidden flex items-center justify-between">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                    <div className="relative z-10">
                        <p className="text-[9px] font-black uppercase tracking-widest text-blue-200 mb-2">Average Rating</p>
                        <div className="flex items-end gap-2 md:gap-3">
                            <h2 className="text-4xl md:text-6xl font-black tracking-tighter">{avgRating}</h2>
                            <span className="text-lg md:text-xl font-bold text-blue-200 mb-1 md:mb-2">/ 5.0</span>
                        </div>
                        <div className="flex gap-0.5 mt-3">
                            {[1, 2, 3, 4, 5].map(star => (
                                <Star key={star} size={16} className={star <= Math.round(avgRating) ? "text-amber-400 fill-amber-400" : "text-blue-300 opacity-50"} />
                            ))}
                        </div>
                    </div>
                    <div className="p-3 md:p-4 bg-white/10 rounded-[1.2rem] md:rounded-[2rem] backdrop-blur-sm border border-white/20 relative z-10 shrink-0">
                        <Award size={32} className="md:w-12 md:h-12 text-amber-300" />
                    </div>
                </div>

                <div className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Evaluated Tasks</p>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tighter">{performance?.total_evaluated_tasks || 0}</h2>
                        <p className="text-[10px] font-bold text-[#00629B] mt-2 flex items-center gap-1.5 uppercase"><CheckCircle2 size={12}/> Completed Missions</p>
                    </div>
                    <div className="p-4 md:p-5 bg-slate-50 rounded-[1.2rem] md:rounded-[2rem] border border-slate-100 shrink-0">
                        <CheckCircle2 size={32} className="md:w-10 md:h-10 text-emerald-500" />
                    </div>
                </div>
            </div>

            {/* 💬 قسم التقييمات - Responsive Cards */}
            <div className="bg-white p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <h3 className="text-xs md:text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <MessageSquare size={16} className="text-[#00629B]" /> Leaders Feedbacks
                </h3>

                <div className="space-y-4 md:space-y-6">
                    {task_feedbacks && task_feedbacks.length > 0 ? (
                        task_feedbacks.map((item, idx) => (
                            <div key={idx} className="p-5 md:p-6 bg-slate-50/50 rounded-2xl md:rounded-3xl border border-slate-100 hover:border-blue-100 transition-all overflow-hidden">
                                {/* Header: Title + Rating + Date */}
                                <div className="flex flex-col gap-4 md:gap-0 md:flex-row md:justify-between md:items-center mb-4">
                                    <div className="min-w-0 flex-1">
                                        <h4 className="text-sm font-black text-slate-800 truncate uppercase tracking-tight">{item.task_name}</h4>
                                        <p className="text-[9px] font-bold text-[#00629B] uppercase tracking-wider mt-1 truncate">{item.project_name}</p>
                                    </div>
                                    
                                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                                        <div className="flex gap-0.5 bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <Star key={star} size={12} className={star <= item.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"} />
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap bg-white px-2 py-1.5 rounded-xl border border-slate-100 shadow-sm">
                                            <Clock size={10}/> {new Date(item.evaluated_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                {/* Feedback Content */}
                                <div className="p-4 bg-white rounded-xl md:rounded-2xl border border-slate-100 text-[11px] md:text-xs font-bold text-slate-600 leading-relaxed italic relative">
                                    <MessageSquare size={14} className="absolute top-4 left-3 text-slate-100 md:text-slate-200" />
                                    <p className="pl-6 break-words">{item.feedback || "Good job! No textual feedback provided."}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-[1.5rem] md:rounded-[2rem] opacity-50">
                            <Star size={32} className="mx-auto text-slate-200 mb-3" />
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">No evaluations yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VolunteerDashboard;