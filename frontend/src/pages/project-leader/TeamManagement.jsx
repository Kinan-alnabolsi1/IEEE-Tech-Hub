import React, { useState, useEffect } from 'react';
import { projectService } from '../../services/projectService';
import { volunteerService } from '../../services/volunteerService';
import { 
    Users, Check, X, Clock, CheckCircle2, XCircle, LayoutDashboard, 
    Sparkles, BrainCircuit, Target, Loader2, BarChart2 
} from 'lucide-react';
import Loader from '../../components/ui/Loader';
import toast from 'react-hot-toast';

const TeamManagement = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiResults, setAiResults] = useState(null);

    const [activeStatusTab, setActiveStatusTab] = useState('pending');
    const [activeRoleTab, setActiveRoleTab] = useState('All');

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                let projectId = localStorage.getItem('managed_project_id');
                if (!projectId || projectId === 'undefined') {
                    const profileRes = await volunteerService.getProfile();
                    const userData = profileRes.data?.data || profileRes.data;
                    const leaderProject = userData?.projects?.find(p => p.role_in_project === 'Project Leader' || p.role_in_project === 'project_leader');
                    if (leaderProject) {
                        projectId = leaderProject.project_id;
                        localStorage.setItem('managed_project_id', String(projectId));
                    }
                }
                if (!projectId) return setLoading(false);

                setLoading(true);
                const fetchByStatus = async (status) => {
                    try {
                        const res = await projectService.getProjectApplications(projectId, status);
                        let data = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : (res.data?.applications || []));
                        return data.map(app => ({ ...app, __kanban_status: status }));
                    } catch { return []; }
                };

                const [pendingApps, approvedApps, rejectedApps] = await Promise.all([
                    fetchByStatus('pending'), fetchByStatus('approved'), fetchByStatus('rejected')
                ]);
                
                // 🌟 فلترة لمنع ظهور قائد المشروع في القائمة
                const allApps = [...pendingApps, ...approvedApps, ...rejectedApps];
                const filteredFromLeader = allApps.filter(app => {
                    const role = (app.pivot?.role || app.pivot?.role_name || app.role_in_project || app.role || "").toLowerCase();
                    return !role.includes('leader');
                });

                setApplications(filteredFromLeader);
            } catch (error) {
                toast.error("Failed to load team data.");
            } finally {
                setLoading(false);
            }
        };
        fetchApplications();
    }, []);

    const handleRunAiAnalysis = async () => {
        if (activeRoleTab === 'All') return toast.error("Please select a specific role first.");
        const projectId = localStorage.getItem('managed_project_id');
        setAiLoading(true);
        try {
            const res = await projectService.getAiRecommendations(projectId, activeRoleTab);
            const rawAiData = res.data?.data || res.data || res;
            const aiRecommendations = Array.isArray(rawAiData) ? rawAiData : Object.values(rawAiData);
            
            const matchedResults = aiRecommendations.map(rec => {
                const realUser = applications.find(app => (app.user?.id === rec.user_id) || (app.user_id === rec.user_id));
                
                // 🌟 الحساب النظامي والدقيق: جمع السكورات وقسمتها على عددها
                let averageScore = 0;
                let breakdownTags = [];

                if (rec.scores_breakdown) {
                    try {
                        // التعامل مع البيانات سواء كانت Object أو JSON string
                        const breakdownObj = typeof rec.scores_breakdown === 'string' ? JSON.parse(rec.scores_breakdown) : rec.scores_breakdown;
                        const keys = Object.keys(breakdownObj);
                        const values = Object.values(breakdownObj);
                        
                        if (keys.length > 0) {
                            // جمع القيم
                            const sum = values.reduce((a, b) => Number(a) + Number(b), 0);
                            // القسمة على العدد الكلي للمقاييس
                            averageScore = (sum / keys.length).toFixed(1);
                            
                            // تحويل المفاتيح لتاغات للديزاين الجديد
                            breakdownTags = keys.map(k => ({
                                name: k.replace(/_/g, ' '), // تحويل ai_skills_match لـ ai skills match
                                score: Number(breakdownObj[k]).toFixed(0)
                            }));
                        }
                    } catch (e) { console.error("Score Parsing Error:", e); }
                }

                return realUser ? { 
                    ...realUser, 
                    ai_avg_score: averageScore || rec.final_score || '0',
                    ai_tags: breakdownTags
                } : null;
            }).filter(Boolean); // فلترة اللي ما لقينالهم يوزر حقيقي

            // 🌟 ترتيب تصاعدي (الأقوى أولاً)
            matchedResults.sort((a, b) => Number(b.ai_avg_score) - Number(a.ai_avg_score));

            // منع تكرار المستخدمين في اللوحة
            const uniqueMatched = matchedResults.filter((v, i, a) => a.findIndex(t => (t.user_id === v.user_id)) === i);
            
            setAiResults(uniqueMatched);
            toast.success("AI Analysis Complete!");
        } catch (error) {
            toast.error("AI service is currently busy.");
        } finally {
            setAiLoading(false);
        }
    };

    const handleAction = async (userId, actionName) => {
        try {
            const projectId = localStorage.getItem('managed_project_id');
            setActionLoading(userId);
            if (actionName === 'approve') {
                await projectService.approveProjectMember(projectId, userId);
                toast.success("Member approved! 🎉");
            } else {
                await projectService.rejectProjectMember(projectId, userId);
                toast.error("Rejected.");
            }
            // تحديث الحالة محلياً
            setApplications(prev => prev.map(app => {
                const idToCheck = app.user_id || app.user?.id || app.id;
                return idToCheck === userId ? { ...app, __kanban_status: actionName === 'approve' ? 'approved' : 'rejected' } : app;
            }));
            // إزالة من لوحة الـ AI إذا كان موجوداً
            if (aiResults) setAiResults(prev => prev.filter(item => (item.user_id || item.user?.id) !== userId));
        } catch (error) { toast.error("Action failed."); } finally { setActionLoading(null); }
    };

    const getRole = (app) => app.pivot?.role || app.pivot?.role_name || app.role_in_project || app.role || "Member";
    const getStatus = (app) => app.__kanban_status;
    const roles = ['All', ...new Set(applications.filter(app => getStatus(app) === activeStatusTab).map(getRole))];
    
    // إخفاء العناصر المعروضة في لوحة الـ AI من القائمة السفلية
    const displayedApps = applications.filter(app => {
        const matchesStatus = getStatus(app) === activeStatusTab;
        const matchesRole = activeRoleTab === 'All' || getRole(app) === activeRoleTab;
        const isShownInAi = aiResults?.some(ai => (ai.user_id || ai.user?.id) === (app.user_id || app.user?.id));
        return matchesStatus && matchesRole && !isShownInAi;
    });

    const counts = {
        pending: applications.filter(app => getStatus(app) === 'pending').length,
        approved: applications.filter(app => getStatus(app) === 'approved').length,
        rejected: applications.filter(app => getStatus(app) === 'rejected').length,
    };

    // 🌟 مكون كرت المتطوع (ديزاين احترافي وموحد)
    const UserCard = ({ app, isAi = false, index = 0 }) => {
        const user = app.user || app;
        const userId = user.id || app.user_id;
        const status = getStatus(app);

        return (
            <div className={`p-6 rounded-[2.5rem] shadow-sm border transition-all bg-white relative overflow-hidden flex flex-col h-full ${isAi ? 'border-purple-200 bg-purple-50/10' : status === 'pending' ? 'border-amber-100 shadow-amber-50/50' : status === 'approved' ? 'border-emerald-100 shadow-emerald-50/50' : 'border-rose-100 shadow-rose-50/50'}`}>
                {isAi && (
                    <>
                        <div className="absolute top-0 left-0 bg-purple-600 text-white px-4 py-2 rounded-br-[1.5rem] text-xs font-black shadow-md z-10 tracking-widest">#{index + 1} RANK</div>
                        <div className="absolute top-4 right-4 bg-purple-600 text-white px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 shadow-sm">
                            <Sparkles size={10} /> {app.ai_avg_score}% AVG SCORE
                        </div>
                    </>
                )}
                
                <div className={`flex items-center gap-4 mb-4 ${isAi ? 'mt-4' : ''}`}>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl border shadow-sm shrink-0 ${isAi ? 'bg-purple-600 text-white border-purple-400' : status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                        {(user.full_name || "V").charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight line-clamp-1">{user.full_name}</h3>
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${isAi ? 'text-purple-600' : 'text-[#00629B]'}`}>{getRole(app)}</p>
                    </div>
                </div>

                {/* 🌟 الديزاين الجديد الاحترافي لعرض تفاصيل التقييم (Breakdown) */}
                {isAi ? (
                    <div className="bg-white p-5 rounded-2xl mb-6 border border-purple-100 shadow-inner flex-1">
                        <p className="text-[9px] font-black text-purple-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                            <BarChart2 size={12} /> AI Analysis Breakdown
                        </p>
                        <div className="flex flex-wrap gap-2.5">
                            {app.ai_tags && app.ai_tags.length > 0 ? app.ai_tags.map((tag, idx) => (
                                <div key={idx} className="bg-purple-50 px-2.5 py-1.5 rounded-lg border border-purple-100 flex items-center gap-2">
                                    <span className="text-[9px] font-bold text-purple-700 capitalize tracking-tight">{tag.name}</span>
                                    <span className="text-[10px] font-black text-purple-900 bg-purple-200/50 px-1.5 rounded">{tag.score}%</span>
                                </div>
                            )) : (
                                <span className="text-[10px] text-purple-400 italic">No detailed metrics available from AI.</span>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="bg-slate-50/50 p-4 rounded-2xl mb-6 border border-slate-100 flex-1">
                        <p className="text-xs font-bold text-slate-500 line-clamp-3 italic leading-relaxed">
                            "{user.bio || "No biography provided."}"
                        </p>
                    </div>
                )}

                {status === 'pending' && (
                    <div className="flex items-center gap-3 mt-auto">
                        <button onClick={() => handleAction(userId, 'reject')} disabled={actionLoading === userId} className="flex-1 py-3.5 bg-white text-rose-500 border border-rose-100 hover:bg-rose-50 rounded-xl text-[10px] font-black uppercase transition-all active:scale-95 disabled:opacity-50">Reject</button>
                        <button onClick={() => handleAction(userId, 'approve')} disabled={actionLoading === userId} className="flex-1 py-3.5 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase shadow-md hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50">Accept</button>
                    </div>
                )}
            </div>
        );
    };

    if (loading) return <Loader message="Setting up Team Management Board..." />;

    return (
        <div className="space-y-8 animate-in fade-in duration-700 h-full flex flex-col pb-10 max-w-[1700px] mx-auto">
            <div className="flex justify-between items-center gap-4">
                <h1 className="text-3xl font-black text-[#00629B] uppercase italic flex items-center gap-3 tracking-tight"><LayoutDashboard size={28} /> Team Overview</h1>
                {activeStatusTab === 'pending' && activeRoleTab !== 'All' && (
                    <button onClick={handleRunAiAnalysis} disabled={aiLoading} className="bg-purple-600 text-white px-7 py-4 rounded-[1.8rem] shadow-xl shadow-purple-200 flex items-center gap-3 hover:bg-purple-700 transition-all active:scale-95 group disabled:opacity-50 shrink-0">
                        {aiLoading ? <Loader2 size={18} className="animate-spin" /> : <BrainCircuit size={18} />}
                        <span className="text-[11px] font-black uppercase tracking-widest">Run AI Scout Analysis</span>
                    </button>
                )}
            </div>

            {/* الأزرار الملونة للتابات الرئيسية */}
            <div className="bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-4">
                <div className="grid grid-cols-3 gap-2.5">
                    {/* Pending Tab */}
                    <button onClick={() => {setActiveStatusTab('pending'); setActiveRoleTab('All'); setAiResults(null);}} className={`flex items-center justify-center gap-3 py-4 rounded-[1.5rem] transition-all ${activeStatusTab === 'pending' ? 'bg-amber-50 border border-amber-200 shadow-sm' : 'hover:bg-slate-50 text-slate-500 border border-transparent'}`}>
                        <Clock size={18} className={activeStatusTab === 'pending' ? 'text-amber-500' : 'text-slate-400'} />
                        <span className={`text-[11px] font-black uppercase tracking-widest ${activeStatusTab === 'pending' ? 'text-amber-600' : 'text-slate-500'}`}>Pending Applications</span>
                        <span className={`px-2.5 py-0.5 rounded text-[11px] font-black ${activeStatusTab === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>{counts.pending}</span>
                    </button>
                    {/* Approved Tab */}
                    <button onClick={() => {setActiveStatusTab('approved'); setActiveRoleTab('All'); setAiResults(null);}} className={`flex items-center justify-center gap-3 py-4 rounded-[1.5rem] transition-all ${activeStatusTab === 'approved' ? 'bg-emerald-50 border border-emerald-200 shadow-sm' : 'hover:bg-slate-50 text-slate-500 border border-transparent'}`}>
                        <CheckCircle2 size={18} className={activeStatusTab === 'approved' ? 'text-emerald-500' : 'text-slate-400'} />
                        <span className={`text-[11px] font-black uppercase tracking-widest ${activeStatusTab === 'approved' ? 'text-emerald-600' : 'text-slate-500'}`}>Approved Team</span>
                        <span className={`px-2.5 py-0.5 rounded text-[11px] font-black ${activeStatusTab === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>{counts.approved}</span>
                    </button>
                    {/* Rejected Tab */}
                    <button onClick={() => {setActiveStatusTab('rejected'); setActiveRoleTab('All'); setAiResults(null);}} className={`flex items-center justify-center gap-3 py-4 rounded-[1.5rem] transition-all ${activeStatusTab === 'rejected' ? 'bg-rose-50 border border-rose-200 shadow-sm' : 'hover:bg-slate-50 text-slate-500 border border-transparent'}`}>
                        <XCircle size={18} className={activeStatusTab === 'rejected' ? 'text-rose-500' : 'text-slate-400'} />
                        <span className={`text-[11px] font-black uppercase tracking-widest ${activeStatusTab === 'rejected' ? 'text-rose-600' : 'text-slate-500'}`}>Rejected History</span>
                        <span className={`px-2.5 py-0.5 rounded text-[11px] font-black ${activeStatusTab === 'rejected' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>{counts.rejected}</span>
                    </button>
                </div>
                {/* تابات الأدوار */}
                <div className="flex gap-2.5 overflow-x-auto px-2 pb-2 custom-scrollbar">
                    {roles.map(role => (
                        <button key={role} onClick={() => { setActiveRoleTab(role); setAiResults(null); }} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeRoleTab === role ? 'bg-[#00629B] text-white shadow-md' : 'bg-slate-50 text-slate-500 border border-slate-100 hover:bg-slate-100'}`}>{role}</button>
                    ))}
                </div>
            </div>

            {/* AI Recommendations Section */}
            {aiResults && activeStatusTab === 'pending' && (
                <div className="bg-purple-50/30 border border-purple-100 rounded-[3rem] p-8 animate-in slide-in-from-top-4 relative mb-4">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3"><div className="p-3 bg-purple-600 text-white rounded-2xl shadow-lg shadow-purple-200"><Sparkles size={20} /></div><div><h2 className="text-xl font-black text-purple-900 uppercase italic">AI Talent Selection</h2><p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mt-0.5">Top Matches for {activeRoleTab} Role</p></div></div>
                        <button onClick={() => setAiResults(null)} className="p-2 hover:bg-purple-100 rounded-full text-purple-400 transition-colors"><X size={20} /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                        {aiResults.map((app, i) => <UserCard key={i} app={app} isAi={true} index={i} />)}
                    </div>
                </div>
            )}

            {/* Main Application Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6 pb-10">
                {displayedApps.length > 0 ? displayedApps.map((app, i) => <UserCard key={i} app={app} />) : (
                    <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200 animate-in fade-in"><Users size={40} className="text-slate-200 mx-auto mb-4" /><p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No members found in this selection</p></div>
                )}
            </div>
        </div>
    );
};

export default TeamManagement;