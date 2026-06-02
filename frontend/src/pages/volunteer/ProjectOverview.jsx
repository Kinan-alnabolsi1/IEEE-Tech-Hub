import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { volunteerService } from '../../services/volunteerService';
import { 
    Trophy, Star, ArrowLeft, 
    ShieldCheck, CheckCircle2, MessageSquare, Briefcase, Award
} from 'lucide-react';
import Loader from '../../components/ui/Loader';
import toast from 'react-hot-toast';

const ProjectOverview = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [overviewData, setOverviewData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOverview = async () => {
            try {
                setLoading(true);
                const userId = localStorage.getItem('user_id'); 
                
                const res = await volunteerService.getUserOverview(userId, projectId);
                const data = res.data?.data || res.data;

                setOverviewData(data);
            } catch (error) {
                console.error("Overview Error:", error);
                toast.error("Failed to load project overview.");
            } finally {
                setLoading(false);
            }
        };
        fetchOverview();
    }, [projectId]);

    if (loading) return <Loader message="Analyzing your achievements..." />;
    if (!overviewData) return <div className="p-20 text-center uppercase font-black italic">No Overview Found</div>;

    const userInfo = overviewData.user_info || {};
    const performance = overviewData.performance || {};
    const feedbacks = overviewData.task_feedbacks || [];
    const skills = overviewData.skills || [];

    const projectName = feedbacks.length > 0 ? feedbacks[0].project_name : "Project Overview";
    
    const rawRating = Number(performance.average_rating) || 0;
    const percentageScore = rawRating <= 5 ? rawRating * 20 : (rawRating <= 10 ? rawRating * 10 : rawRating);

    return (
        <div className="p-4 md:p-10 animate-in slide-in-from-bottom-10 duration-700 max-w-7xl mx-auto space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-400 hover:text-[#00629B] transition-colors font-bold uppercase text-[11px] tracking-widest bg-white px-5 py-2.5 rounded-full shadow-sm border border-slate-100 w-fit"
                >
                    <ArrowLeft size={16} /> Back to Journey
                </button>
                <div className="bg-emerald-50 text-emerald-600 px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-[0.2em] shadow-sm flex items-center gap-2 border border-emerald-100">
                    <ShieldCheck size={16} /> Mission Completed
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl flex flex-col items-center justify-center text-center relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-50/50 rounded-full blur-2xl"></div>
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest relative mb-6">Final Performance</h2>
                        
                        <div className="relative">
                            <svg className="w-52 h-52 transform -rotate-90">
                                <circle cx="104" cy="104" r="96" stroke="#f1f5f9" strokeWidth="12" fill="none" />
                                <circle cx="104" cy="104" r="96" stroke="#00629B" strokeWidth="12" fill="none" 
                                    strokeDasharray={603} strokeDashoffset={603 - (603 * percentageScore) / 100}
                                    strokeLinecap="round" className="transition-all duration-1500 ease-out"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-5xl font-black italic text-[#00629B]">{rawRating}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Avg Rating</span>
                            </div>
                        </div>

                        <div className="mt-8">
                            <h3 className="text-lg font-black text-slate-800 uppercase italic leading-tight">{projectName}</h3>
                            <p className="text-[11px] font-bold text-[#00629B] uppercase tracking-widest mt-2 flex items-center justify-center gap-1.5">
                                <Briefcase size={14} /> {userInfo.role || 'Volunteer'}
                            </p>
                        </div>
                    </div>

                    <div className="bg-[#00629B] rounded-[2.5rem] p-8 text-white shadow-lg relative overflow-hidden">
                        <Trophy className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10" />
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-blue-200 mb-6 flex items-center gap-2">
                            <Award size={16} /> Project Metrics
                        </h3>
                        <div className="space-y-4 relative z-10">
                            <div className="flex items-center justify-between bg-white/10 px-5 py-4 rounded-2xl">
                                <span className="text-xs font-bold text-blue-100 uppercase tracking-wider flex items-center gap-2">
                                    <CheckCircle2 size={16} className="text-emerald-400" /> Tasks Completed
                                </span>
                                <span className="text-xl font-black">{performance.completed_tasks_count || 0}</span>
                            </div>
                            <div className="flex items-center justify-between bg-white/10 px-5 py-4 rounded-2xl">
                                <span className="text-xs font-bold text-blue-100 uppercase tracking-wider flex items-center gap-2">
                                    <Star size={16} className="text-amber-400" /> Evaluated Tasks
                                </span>
                                <span className="text-xl font-black">{performance.total_evaluated_tasks || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white rounded-[3rem] p-8 md:p-10 border border-slate-100 shadow-sm h-full">
                        <div className="flex items-center gap-3 mb-8">
                            <MessageSquare className="text-[#00629B]" size={28} />
                            <div>
                                <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tight">Leader's Feedback</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Evaluations per task</p>
                            </div>
                        </div>

                        {feedbacks.length === 0 ? (
                            <div className="py-20 text-center flex flex-col items-center justify-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                                <MessageSquare size={40} className="text-slate-300 mb-4" />
                                <h3 className="text-sm font-black text-slate-600 uppercase">No Feedback Yet</h3>
                                <p className="text-[11px] font-bold text-slate-400 mt-2">Task evaluations will appear here.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {feedbacks.map((task, idx) => (
                                    <div key={idx} className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 hover:border-blue-100 transition-colors group">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                                            <div>
                                                <h4 className="text-sm font-black text-slate-800 uppercase leading-tight group-hover:text-[#00629B] transition-colors">{task.task_name}</h4>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                    {new Date(task.evaluated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                            <div className="bg-amber-50 text-amber-600 px-4 py-2 rounded-xl flex items-center gap-1.5 shrink-0 border border-amber-100">
                                                <Star size={14} className="fill-amber-500" />
                                                <span className="text-xs font-black">{task.rating} Rating</span>
                                            </div>
                                        </div>
                                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative">
                                            <div className="absolute top-0 left-6 -mt-2 w-4 h-4 bg-white border-t border-l border-slate-100 transform rotate-45"></div>
                                            <p className="text-xs font-bold text-slate-600 italic leading-relaxed relative z-10">
                                                "{task.feedback || "No written feedback provided for this task."}"
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {skills && skills.length > 0 && (
                            <div className="mt-10 pt-8 border-t border-slate-100">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Demonstrated Skills</h3>
                                <div className="flex flex-wrap gap-2">
                                    {skills.map((skill, idx) => (
                                        <span key={idx} className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                                            {skill.name || skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProjectOverview;