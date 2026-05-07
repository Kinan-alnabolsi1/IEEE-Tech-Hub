import React, { useState, useEffect } from 'react';
import { projectService } from '../../services/projectService';
import { volunteerService } from '../../services/volunteerService';
import { Users, Check, X, FileText, UserPlus, Clock } from 'lucide-react';
import Loader from '../../components/ui/Loader';
import toast from 'react-hot-toast';

const TeamManagement = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                let projectId = localStorage.getItem('managed_project_id');
                
                // 🌟 حماية ذكية: إذا الـ ID ضايع، بنجيبه من البروفايل متل الداشبورد
                if (!projectId || projectId === 'undefined') {
                    const profileRes = await volunteerService.getProfile();
                    const userData = profileRes.data?.data || profileRes.data;
                    const leaderProject = userData?.projects?.find(p => p.role_in_project === 'Project Leader' || p.role_in_project === 'project_leader');
                    if (leaderProject) {
                        projectId = leaderProject.project_id;
                        localStorage.setItem('managed_project_id', String(projectId));
                    }
                }

                if (!projectId) {
                    setLoading(false);
                    return toast.error("Project ID not found.");
                }

                setLoading(true);
                // 🌟 عم نبعت pending بحرف صغير احتياطاً (الباك إند أحياناً بيفضلها هيك)
                const res = await projectService.getProjectApplications(projectId, 'pending');
                
                // 🕵️‍♀️ تعي نشوف شو عم يبعت الباك إند بالضبط!
                console.log("🔥 Applications Data:", res.data);

                // استخراج الداتا بذكاء مهما كان شكلها
                let fetchedApps = [];
                if (Array.isArray(res.data?.data)) fetchedApps = res.data.data;
                else if (Array.isArray(res.data)) fetchedApps = res.data;
                else if (Array.isArray(res.data?.applications)) fetchedApps = res.data.applications;
                
                setApplications(fetchedApps);
            } catch (error) {
                console.error("Fetch Applications Error:", error);
                toast.error("Failed to load pending applications.");
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, []);

    const handleAction = async (userId, actionName) => {
        try {
            const projectId = localStorage.getItem('managed_project_id');
            setActionLoading(userId);
            if (actionName === 'approve') {
                await projectService.approveProjectMember(projectId, userId);
                toast.success("Member approved and added to the team! 🎉");
            } else {
                await projectService.rejectProjectMember(projectId, userId);
                toast.error("Application rejected.");
            }
            setApplications(prev => prev.filter(app => {
                const idToCheck = app.user_id || app.user?.id || app.id;
                return idToCheck !== userId;
            }));
        } catch (error) {
            console.error(`${actionName} Error:`, error);
            toast.error(`Failed to ${actionName} member.`);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return <Loader message="Loading team applications..." />;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-[#00629B] uppercase italic flex items-center gap-3">
                    <UserPlus size={32} /> Join Requests
                </h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-2 ml-1">
                    Review and Manage Volunteer Applications
                </p>
            </div>

            {/* Applications List */}
            {applications.length === 0 ? (
                <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-slate-100 text-center flex flex-col items-center justify-center">
                    <div className="w-24 h-24 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-6">
                        <Clock size={48} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl font-black text-slate-700 uppercase tracking-tight mb-2">No Pending Requests</h3>
                    <p className="text-sm font-bold text-slate-400">Your queue is empty. When volunteers apply to your project, they will appear here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {applications.map((app, idx) => {
                        const user = app.user || app; 
                        const userId = user.user_id || user.id;
                        const fullName = user.full_name || user.username || user.name || "Unknown Volunteer";
                        // إحضار المنصب من الباك إند
                        const appliedRole = app.role || app.pivot?.role || app.pivot?.role_name || "Team Member";
                        const bio = user.bio || "No bio provided by this volunteer.";

                        return (
                            <div key={idx} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-blue-50 text-[#00629B] rounded-full flex items-center justify-center font-black text-xl border border-blue-100">
                                                {fullName.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-black text-slate-800 line-clamp-1">{fullName}</h3>
                                                <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">{appliedRole}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-slate-50 p-4 rounded-2xl mb-6">
                                        <p className="text-xs font-bold text-slate-500 line-clamp-3 leading-relaxed flex items-start gap-2">
                                            <FileText size={14} className="text-slate-400 shrink-0 mt-0.5" />
                                            {bio}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 mt-auto">
                                    <button 
                                        onClick={() => handleAction(userId, 'reject')}
                                        disabled={actionLoading === userId}
                                        className="flex-1 py-3 bg-white text-rose-500 border border-rose-100 hover:bg-rose-50 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        <X size={14} /> Reject
                                    </button>
                                    <button 
                                        onClick={() => handleAction(userId, 'approve')}
                                        disabled={actionLoading === userId}
                                        className="flex-1 py-3 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        <Check size={14} /> Approve
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default TeamManagement;