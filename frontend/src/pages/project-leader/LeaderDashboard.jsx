import React, { useState, useEffect } from 'react';
import { projectService } from '../../services/projectService';
import { volunteerService } from '../../services/volunteerService';
import { 
    TrendingUp, Users, CheckCircle2, AlertTriangle, 
    Clock, Activity, ShieldCheck, UserCircle2 
} from 'lucide-react';
import Loader from '../../components/ui/Loader';
import toast from 'react-hot-toast';

const LeaderDashboard = () => {
    const [project, setProject] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                let projectId = localStorage.getItem('managed_project_id');
                
                if (!projectId || projectId === 'undefined' || projectId === 'null') {
                    console.log("Project ID not found in storage. Fetching from profile...");
                    const profileRes = await volunteerService.getProfile();
                    const userData = profileRes.data?.data || profileRes.data;
                    
                    const leaderProject = userData?.projects?.find(p => 
                        p.role_in_project === 'Project Leader' || p.role_in_project === 'project_leader'
                    );
                    
                    if (leaderProject) {
                        projectId = leaderProject.project_id;
                        localStorage.setItem('managed_project_id', String(projectId));
                    }
                }

                if (!projectId) {
                    toast.error("You are not assigned to any project as a leader.");
                    setLoading(false);
                    return;
                }

                const [projectRes, statsRes] = await Promise.all([
                    projectService.getProjectDetails(projectId),
                    projectService.getProjectStats(projectId)
                ]);

                setProject(projectRes.data?.data || projectRes.data);
                setStats(statsRes.data?.data || statsRes.data);

            } catch (error) {
                console.error("Dashboard Error:", error);
                toast.error("Failed to load project command center.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) return <Loader message="Initializing Command Center..." />;

    // 🌟 الفلترة الذكية: استخراج المتطوعين فقط واستثناء القائد من القائمة
    const activeVolunteers = project?.members?.filter(member => {
        const status = member.status || member.pivot?.status;
        const role = member.role || member.pivot?.role || member.pivot?.role_name || '';
        
        // التأكد من الحالة (مقبول) + التأكد أنه ليس القائد
        const isApproved = status && (status.toLowerCase() === 'approved' || status.toLowerCase() === 'active');
        const isNotLeader = !role.toLowerCase().includes('leader');

        return isApproved && isNotLeader;
    }) || [];

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            
            {/* 1️⃣ رأس الصفحة (بيانات المشروع) */}
            <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5">
                    <Activity size={180} />
                </div>
                <div className="relative z-10">
                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] mb-3 flex items-center gap-2">
                        <ShieldCheck size={14} /> Project Command Center
                    </p>
                    <h1 className="text-4xl md:text-5xl font-black text-[#00629B] uppercase italic tracking-tight mb-4">
                        {project?.title || project?.name || 'Loading Project...'}
                    </h1>
                    <p className="text-sm font-bold text-slate-500 leading-relaxed max-w-3xl">
                        {project?.description}
                    </p>
                </div>
            </div>

            {/* 2️⃣ الإحصائيات (Stats Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden group">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Overall Progress</p>
                    <div className="flex flex-col gap-3">
                        <span className="text-5xl font-black text-[#00629B]">{stats?.progress?.overall_percentage || 0}%</span>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-emerald-500 transition-all duration-1000" 
                                style={{width: `${stats?.progress?.overall_percentage || 0}%`}}
                            ></div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">{stats?.progress?.total_tasks || 0} Total Tasks</span>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-center">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl"><Clock size={20} /></div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">In Progress</p>
                    </div>
                    <span className="text-3xl font-black text-slate-800">{stats?.progress?.in_progress_tasks || 0}</span>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-center">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl"><CheckCircle2 size={20} /></div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completed</p>
                    </div>
                    <span className="text-3xl font-black text-slate-800">{stats?.progress?.completed_tasks || 0}</span>
                </div>

                <div className="flex flex-col gap-6">
                    <div className={`p-6 rounded-[2rem] border flex items-center justify-between ${stats?.progress?.overdue_tasks > 0 ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-white border-slate-100 text-slate-400'}`}>
                        <div className="flex items-center gap-3">
                            <AlertTriangle size={18} />
                            <p className="text-[10px] font-black uppercase tracking-widest">Overdue Tasks</p>
                        </div>
                        <span className="text-xl font-black">{stats?.progress?.overdue_tasks || 0}</span>
                    </div>
                    
                    <div className="p-6 rounded-[2rem] bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                            <Users size={18} />
                            <p className="text-[10px] font-black uppercase tracking-widest">Pending Joins</p>
                        </div>
                        <span className="text-xl font-black">{stats?.team?.pending_applications || 0}</span>
                    </div>
                </div>
            </div>

            {/* 3️⃣ فريق العمل (المتطوعين فقط) */}
            <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-slate-100">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tight">Active Squad</h2>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            {activeVolunteers.length} Volunteers on board
                        </p>
                    </div>
                </div>

                {activeVolunteers.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                        <UserCircle2 size={40} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No active volunteers assigned yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {activeVolunteers.map((member, idx) => {
                            const memberName = member.full_name || member.username || member.name || 'Volunteer';
                            const memberRole = member.role || member.pivot?.role || member.pivot?.role_name || 'Member';

                            return (
                                <div key={idx} className="p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 flex items-center gap-4 hover:border-blue-200 transition-colors">
                                    <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-[#00629B] font-black text-lg border border-slate-100 shrink-0">
                                        {memberName.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-black text-slate-800 truncate">{memberName}</p>
                                        <p className="text-[10px] font-bold text-[#00629B] uppercase tracking-widest mt-0.5 truncate">{memberRole}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

        </div>
    );
};

export default LeaderDashboard;