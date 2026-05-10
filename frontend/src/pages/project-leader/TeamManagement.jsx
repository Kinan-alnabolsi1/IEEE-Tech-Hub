import React, { useState, useEffect } from 'react';
import { projectService } from '../../services/projectService';
import { volunteerService } from '../../services/volunteerService';
import { 
    Users, Check, X, FileText, UserPlus, Clock, 
    CheckCircle2, XCircle, LayoutDashboard, Sparkles, BrainCircuit, Target, Loader2 
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
                    const res = await projectService.getProjectApplications(projectId, status);
                    let data = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : (res.data?.applications || []));
                    return data.map(app => ({ ...app, __kanban_status: status }));
                };

                const [pendingApps, approvedApps, rejectedApps] = await Promise.all([
                    fetchByStatus('pending'), fetchByStatus('approved'), fetchByStatus('rejected')
                ]);

                // 🌟 التعديل هنا: فلترة شاملة لاستبعاد أي Project Leader من الداتا الأساسية
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
        if (activeRoleTab === 'All') return;
        const projectId = localStorage.getItem('managed_project_id');
        setAiLoading(true);
        try {
            const res = await projectService.getAiRecommendations(projectId, activeRoleTab);
            setAiResults(res.data || res);
            toast.success("AI Scouting Complete!");
        } catch (error) {
            toast.error("AI service error.");
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
                toast.success("Member approved!");
            } else {
                await projectService.rejectProjectMember(projectId, userId);
                toast.error("Rejected.");
            }
            setApplications(prev => prev.map(app => {
                const idToCheck = app.user_id || app.user?.id || app.id;
                return idToCheck === userId ? { ...app, __kanban_status: actionName === 'approve' ? 'approved' : 'rejected' } : app;
            }));
        } catch (error) { toast.error("Action failed."); } finally { setActionLoading(null); }
    };

    const getRole = (app) => app.pivot?.role || app.pivot?.role_name || app.role_in_project || app.role || "Member";
    const getStatus = (app) => app.__kanban_status;
    
    // 🌟 التابات ستعتمد الآن على الداتا المفلترة أصلاً من الليدر
    const roles = ['All', ...new Set(applications.filter(app => getStatus(app) === activeStatusTab).map(getRole))];
    
    const displayedApps = applications.filter(app => {
        const matchesStatus = getStatus(app) === activeStatusTab;
        const matchesRole = activeRoleTab === 'All' || getRole(app) === activeRoleTab;
        return matchesStatus && matchesRole;
    });

    const counts = {
        pending: applications.filter(app => getStatus(app) === 'pending').length,
        approved: applications.filter(app => getStatus(app) === 'approved').length,
        rejected: applications.filter(app => getStatus(app) === 'rejected').length,
    };

    if (loading) return <Loader message="Accessing Team Board..." />;

    return (
        <div className="space-y-8 animate-in fade-in duration-700 h-full flex flex-col">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black text-[#00629B] uppercase italic flex items-center gap-3 tracking-tight">
                    <LayoutDashboard size={28} /> Team Overview
                </h1>

                {activeStatusTab === 'pending' && activeRoleTab !== 'All' && (
                    <button 
                        onClick={handleRunAiAnalysis}
                        disabled={aiLoading}
                        className="bg-purple-600 text-white px-6 py-4 rounded-[1.8rem] shadow-xl shadow-purple-200 flex items-center gap-3 hover:bg-purple-700 transition-all active:scale-95 group disabled:opacity-50"
                    >
                        {aiLoading ? <Loader2 size={18} className="animate-spin" /> : <BrainCircuit size={18} />}
                        <span className="text-[10px] font-black uppercase tracking-widest">AI Scout Analysis</span>
                    </button>
                )}
            </div>

            {/* AI Results */}
            {aiResults && activeStatusTab === 'pending' && (
                <div className="bg-purple-50 border border-purple-100 rounded-[2.5rem] p-8 animate-in slide-in-from-top-4 relative overflow-hidden mb-4">
                    <div className="flex items-center justify-between mb-6 relative">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-purple-600 text-white rounded-2xl"><Target size={20} /></div>
                            <h2 className="text-lg font-black text-purple-900 uppercase italic">AI Talent Scout</h2>
                        </div>
                        <button onClick={() => setAiResults(null)} className="p-2 hover:bg-purple-100 rounded-full text-purple-400"><X size={20} /></button>
                    </div>
                    <div className="grid gap-3">
                        {Array.isArray(aiResults) && aiResults.map((rec, i) => (
                            <div key={i} className="bg-white p-4 rounded-2xl border border-purple-100 flex items-center justify-between shadow-sm">
                                <div>
                                    <p className="text-xs font-black text-purple-900 uppercase">{rec.full_name || 'Volunteer'}</p>
                                    <p className="text-[10px] text-purple-500 italic mt-0.5">{rec.reason}</p>
                                </div>
                                <span className="text-sm font-black text-purple-600">{rec.match_score || '90%'}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-4">
                <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => {setActiveStatusTab('pending'); setActiveRoleTab('All'); setAiResults(null);}} className={`flex items-center justify-center gap-3 py-4 rounded-[1.5rem] transition-all ${activeStatusTab === 'pending' ? 'bg-amber-50 border border-amber-200' : 'hover:bg-slate-50 text-slate-500 border border-transparent'}`}>
                        <Clock size={18} className={activeStatusTab === 'pending' ? 'text-amber-500' : 'text-slate-400'} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${activeStatusTab === 'pending' ? 'text-amber-600' : 'text-slate-500'}`}>Pending</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${activeStatusTab === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>{counts.pending}</span>
                    </button>
                    <button onClick={() => {setActiveStatusTab('approved'); setActiveRoleTab('All'); setAiResults(null);}} className={`flex items-center justify-center gap-3 py-4 rounded-[1.5rem] transition-all ${activeStatusTab === 'approved' ? 'bg-emerald-50 border border-emerald-200' : 'hover:bg-slate-50 text-slate-500 border border-transparent'}`}>
                        <CheckCircle2 size={18} className={activeStatusTab === 'approved' ? 'text-emerald-500' : 'text-slate-400'} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${activeStatusTab === 'approved' ? 'text-emerald-600' : 'text-slate-500'}`}>Approved</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${activeStatusTab === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>{counts.approved}</span>
                    </button>
                    <button onClick={() => {setActiveStatusTab('rejected'); setActiveRoleTab('All'); setAiResults(null);}} className={`flex items-center justify-center gap-3 py-4 rounded-[1.5rem] transition-all ${activeStatusTab === 'rejected' ? 'bg-rose-50 border border-rose-200' : 'hover:bg-slate-50 text-slate-500 border border-transparent'}`}>
                        <XCircle size={18} className={activeStatusTab === 'rejected' ? 'text-rose-500' : 'text-slate-400'} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${activeStatusTab === 'rejected' ? 'text-rose-600' : 'text-slate-500'}`}>Rejected</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${activeStatusTab === 'rejected' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>{counts.rejected}</span>
                    </button>
                </div>

                <div className="flex gap-2 overflow-x-auto px-2 pb-2 custom-scrollbar">
                    {roles.map(role => (
                        <button key={role} onClick={() => { setActiveRoleTab(role); setAiResults(null); }} className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeRoleTab === role ? 'bg-[#00629B] text-white shadow-md' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}>
                            {role}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-10">
                {displayedApps.length > 0 ? displayedApps.map((app, i) => (
                    <div key={i} className={`p-6 rounded-[2.5rem] shadow-sm border bg-white ${activeStatusTab === 'pending' ? 'border-amber-100' : activeStatusTab === 'approved' ? 'border-emerald-100' : 'border-rose-100'}`}>
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl border shadow-sm ${activeStatusTab === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : activeStatusTab === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                {(app.full_name || app.username || "V").charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">{app.full_name || app.username}</h3>
                                <p className="text-[10px] font-bold text-[#00629B] uppercase tracking-widest">{getRole(app)}</p>
                            </div>
                        </div>
                        <div className="bg-slate-50/50 p-4 rounded-2xl mb-6 border border-slate-100">
                            <p className="text-xs font-bold text-slate-500 line-clamp-3 italic">"{app.bio || "No bio available."}"</p>
                        </div>
                        {activeStatusTab === 'pending' && (
                            <div className="flex items-center gap-3 mt-auto">
                                <button onClick={() => handleAction(app.user_id, 'reject')} disabled={actionLoading === app.user_id} className="flex-1 py-3 bg-white text-rose-500 border border-rose-100 hover:bg-rose-50 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Reject</button>
                                <button onClick={() => handleAction(app.user_id, 'approve')} disabled={actionLoading === app.user_id} className="flex-1 py-3 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-emerald-600 transition-all">Accept</button>
                            </div>
                        )}
                    </div>
                )) : (
                    <div className="col-span-full py-20 text-center bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
                         <Users size={40} className="text-slate-200 mx-auto mb-4" />
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No members found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeamManagement;