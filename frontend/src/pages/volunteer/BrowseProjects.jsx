import React, { useState, useEffect } from 'react';
import { volunteerService } from '../../services/volunteerService';
import { projectService } from '../../services/projectService';
import { Rocket, Target, Users, Search, ChevronRight, Send, Loader2, AlertCircle } from 'lucide-react';
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
        
        if (!storedChapterId || storedChapterId === 'null' || storedChapterId === 'undefined') {
            console.warn("Chapter ID missing - User might not be assigned to a chapter.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await projectService.getVolunteerProjects(storedChapterId);
            const data = response.data?.data || response.data || [];
            setProjects(data);
        } catch (error) {
            console.error("Fetch Projects Error:", error);
            toast.error("Could not fetch available projects");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleOpenDetails = (project) => {
        console.log("Project Data from Backend:", project);
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
            const msg = error.response?.data?.message || "Already applied or error occurred";
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const filteredProjects = projects.filter(p => 
        (p.name || p.title)?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <Loader message="Scanning Missions..." />;

    const chapterId = localStorage.getItem('chapter_id');

    return (
        <div className="p-4 md:p-10 animate-in fade-in duration-700 max-w-7xl mx-auto">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-[900] text-[#00629B] italic uppercase tracking-tight">Explore Missions</h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-4 flex items-center gap-2">
                        <Rocket size={14} /> Available Projects in your Chapter
                    </p>
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input 
                        type="text"
                        placeholder="Search by project name..."
                        className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-6 text-xs font-bold shadow-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {(!chapterId || chapterId === 'null') && (
                <div className="mb-10 p-6 bg-amber-50 border border-amber-100 rounded-[2rem] flex items-center gap-4 text-amber-700">
                    <AlertCircle size={24} />
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-widest leading-none mb-1">Chapter Assignment Missing</p>
                        <p className="text-xs font-bold opacity-80">You aren't assigned to any chapter. Please contact your Chapter Chair to view projects.</p>
                    </div>
                </div>
            )}

            {filteredProjects.length === 0 ? (
                <div className="py-32 text-center bg-white rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col items-center gap-6">
                    <div className="p-6 bg-slate-50 rounded-full text-slate-200"><Target size={48} /></div>
                    <p className="text-xs font-black text-slate-400 uppercase italic tracking-[0.3em]">No projects found at the moment</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                    {filteredProjects.map((project) => (
                        <div key={project.id || project.project_id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-[#00629B] mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                                <Rocket size={28} />
                            </div>
                            
                            <h3 className="text-xl font-[900] text-slate-800 uppercase italic mb-3 tracking-tight group-hover:text-[#00629B] transition-colors line-clamp-1">
                                {project.name || project.title}
                            </h3>
                            
                            <p className="text-xs text-slate-500 line-clamp-3 mb-8 font-medium leading-relaxed min-h-[4.5rem]">
                                {project.description}
                            </p>

                            <button 
                                onClick={() => handleOpenDetails(project)}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#00629B] transition-all shadow-lg active:scale-95"
                            >
                                View Opportunities <ChevronRight size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <BaseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Mission Details">
                {selectedProject ? (
                    <div className="space-y-10 py-2">
                        <div className="space-y-4">
                            <h2 className="text-3xl font-[900] text-[#00629B] italic uppercase leading-none tracking-tight">
                                {selectedProject.name || selectedProject.title}
                            </h2>
                            <p className="text-[13px] text-slate-500 leading-relaxed font-medium">
                                {selectedProject.description}
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-2">
                                <div className="h-px flex-1 bg-slate-100"></div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Open Positions</h4>
                                <div className="h-px flex-1 bg-slate-100"></div>
                            </div>

                            <div className="grid gap-4">
                                {/* 🌟 التعديل الأساسي هنا: فحص required_roles أو roles تحسباً لرد الباك إند */}
                                {(selectedProject.required_roles || selectedProject.roles)?.length > 0 ? (
                                    (selectedProject.required_roles || selectedProject.roles).map((roleObj, idx) => {
                                        const roleName = typeof roleObj === 'string' ? roleObj : (roleObj.role_name || roleObj.name);
                                        return (
                                            <div key={idx} className="flex flex-col sm:flex-row items-center justify-between p-5 bg-slate-50/50 rounded-[1.8rem] border border-slate-100 group hover:border-blue-200 transition-all">
                                                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                                                    <div className="p-3 bg-white rounded-xl shadow-sm group-hover:text-[#00629B] transition-colors">
                                                        <Users size={18} />
                                                    </div>
                                                    <span className="text-xs font-black text-slate-700 uppercase tracking-wide">{roleName}</span>
                                                </div>
                                                <button 
                                                    disabled={submitting}
                                                    onClick={() => handleJoinRequest(roleName)}
                                                    className="w-full sm:w-auto px-8 py-3 bg-[#00629B] text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 shadow-md hover:shadow-blue-200/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
                                                >
                                                    {submitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />} Apply Now
                                                </button>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-center text-[11px] font-bold text-slate-400 py-4 italic uppercase tracking-widest">No specific roles defined for this project.</p>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="py-20 relative">
                        <Loader message="Intel incoming..." />
                    </div>
                )}
            </BaseModal>
        </div>
    );
};

export default BrowseProjects;