import React, { useState, useEffect } from 'react';
import { volunteerService } from '../../services/volunteerService';
import { projectService } from '../../services/projectService';
import { Rocket, Target, Users, Search, ChevronRight, Send, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import BaseModal from '@/components/ui/BaseModal';
import Loader from '../../components/ui/Loader'; 

const BrowseProjects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchProjects = async () => {
        const storedChapterId = localStorage.getItem('chapter_id');
        if (!storedChapterId) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const response = await projectService.getVolunteerProjects(storedChapterId);
            setProjects(response.data?.data || response.data || []);
        } catch (error) {
            toast.error("Could not fetch available projects");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProjects(); }, []);

    const handleOpenDetails = (project) => {
        setSelectedProject(project); 
        setIsModalOpen(true);
    };

    const handleJoinRequest = async (roleName) => {
        if (!selectedProject) return;
        setSubmitting(true);
        try {
            await volunteerService.joinProject(selectedProject.id || selectedProject.project_id, roleName);
            toast.success(`Application sent for ${roleName}!`);
            setIsModalOpen(false);
        } catch (error) {
            toast.error(error.response?.data?.message || "Error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    const filteredProjects = projects.filter(p => (p.name || p.title)?.toLowerCase().includes(searchQuery.toLowerCase()));

    if (loading) return <Loader message="Scanning Missions..." />;

    return (
        <div className="p-4 md:p-10 animate-in fade-in duration-700 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-[900] text-[#00629B] italic uppercase tracking-tight">Explore Missions</h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-4 flex items-center gap-2"><Rocket size={14} /> Available Projects</p>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input type="text" placeholder="Search projects..." className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-6 text-xs font-bold shadow-sm outline-none transition-all focus:border-blue-200" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                {filteredProjects.map((project) => (
                    <div key={project.id || project.project_id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group">
                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-[#00629B] mb-6 group-hover:scale-110 transition-transform"><Rocket size={28} /></div>
                        <h3 className="text-xl font-[900] text-slate-800 uppercase italic mb-3 line-clamp-1">{project.name || project.title}</h3>
                        <p className="text-xs text-slate-500 line-clamp-3 mb-8 font-medium leading-relaxed">{project.description}</p>
                        <button onClick={() => handleOpenDetails(project)} className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#00629B] transition-all shadow-lg active:scale-95">View Opportunities <ChevronRight size={14} /></button>
                    </div>
                ))}
            </div>

            <BaseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Mission Details">
                {selectedProject && (
                    <div className="space-y-10 py-2">
                        <div className="space-y-4">
                            <h2 className="text-3xl font-[900] text-[#00629B] italic uppercase tracking-tight">{selectedProject.name || selectedProject.title}</h2>
                            <p className="text-[13px] text-slate-500 leading-relaxed font-medium">{selectedProject.description}</p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-2">
                                <div className="h-px flex-1 bg-slate-100"></div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Open Positions</h4>
                                <div className="h-px flex-1 bg-slate-100"></div>
                            </div>

                            <div className="grid gap-4">
                                {(() => {
                                    const allRoles = (selectedProject.required_roles || selectedProject.roles || []);
                                    
                                    // 🌟 الفلترة: استثناء منصب القائد (Leader) + إخفاء الأدوار المكتملة
                                    const filteredRoles = allRoles.filter(roleObj => {
                                        const name = roleObj.role_name || roleObj.name || roleObj;
                                        
                                        // ❌ استثناء القائد من القائمة التي يراها المتطوع
                                        if (name.toLowerCase().includes('leader')) return false;

                                        const reqCount = parseInt(roleObj.required_count || 1);
                                        const currentCount = selectedProject.members?.filter(m => 
                                            m.role?.toLowerCase() === name.toLowerCase() && 
                                            (m.status?.toLowerCase() === 'approved' || m.status?.toLowerCase() === 'active')
                                        ).length || 0;

                                        return currentCount < reqCount;
                                    });

                                    return filteredRoles.length > 0 ? filteredRoles.map((roleObj, idx) => {
                                        const name = roleObj.role_name || roleObj.name || roleObj;
                                        return (
                                            <div key={idx} className="flex flex-col sm:flex-row items-center justify-between p-5 bg-slate-50/50 rounded-[1.8rem] border border-slate-100 group transition-all hover:border-blue-200">
                                                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                                                    <div className="p-3 bg-white rounded-xl shadow-sm text-[#00629B] group-hover:bg-blue-50 transition-colors"><Users size={18} /></div>
                                                    <span className="text-xs font-black text-slate-700 uppercase tracking-wide">{name}</span>
                                                </div>
                                                <button disabled={submitting} onClick={() => handleJoinRequest(name)} className="w-full sm:w-auto px-8 py-3 bg-[#00629B] text-white rounded-xl text-[9px] font-black uppercase hover:bg-slate-900 shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95">
                                                    {submitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />} Apply Now
                                                </button>
                                            </div>
                                        );
                                    }) : (
                                        <div className="text-center py-8 bg-rose-50 rounded-[2rem] border border-rose-100 animate-in zoom-in-95">
                                            <p className="text-[10px] font-black text-rose-500 uppercase italic tracking-widest">🚨 Mission Accomplished! All roles are filled.</p>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                )}
            </BaseModal>
        </div>
    );
};

export default BrowseProjects;