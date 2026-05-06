import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { Plus, Users, Edit2, Trash2, Clock, Briefcase, CheckSquare, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';
import { projectService } from '../../../services/projectService';
import ProjectFormModal from './ProjectFormModal';
import LeaderManagementModal from './LeaderManagementModal'; 
import Loader from '../../../components/ui/Loader';
import toast from 'react-hot-toast';

const ProjectsManagement = () => {
  const navigate = useNavigate(); 
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  
  const [isLeaderModalOpen, setIsLeaderModalOpen] = useState(false);
  const [projectForLeader, setProjectForLeader] = useState(null);

  const [activeTab, setActiveTab] = useState('Pending'); 

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const chapterId = localStorage.getItem('chapter_id');
      if (!chapterId) return;

      const response = await projectService.getChapterProjects(chapterId, activeTab);
      setProjects(response.data?.data || response.data || []);
    } catch (_error) {
      toast.error(`Failed to fetch ${activeTab} projects`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchProjects(); 
  }, [activeTab]); 

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) return;
    
    const loadingToast = toast.loading("Deleting project...");
    try {
      await projectService.deleteProject(id);
      toast.success("Project deleted successfully", { id: loadingToast });
      fetchProjects(); 
    } catch (_error) {
      toast.error("Failed to delete project", { id: loadingToast });
    }
  };

  // 🌟 1. دالة ذكية لتحديد الكلمة اللي رح تظهر بالبادج
  const getDisplayStatus = (project) => {
    if (project.approval_status === 'Pending') return 'Pending Approval';
    if (project.approval_status === 'Rejected') return 'Rejected';
    // إذا كان مقبول، بنعرض حالته التشغيلية (Open, Ongoing, Completed)
    return project.status || 'Unknown';
  };

  // 🌟 2. تحديث الألوان لتشمل الـ Pending والـ Rejected
  const getStatusColors = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending approval':
      case 'pending': 
        return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' };
      case 'rejected': 
        return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100' };
      case 'open': 
        return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' };
      case 'ongoing': 
        return { bg: 'bg-blue-50', text: 'text-[#005587]', border: 'border-blue-100' };
      case 'completed': 
        return { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-100' };
      case 'cancelled': 
        return { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' };
      default: 
        return { bg: 'bg-slate-100', text: 'text-slate-400', border: 'border-slate-200' };
    }
  };

  return (
    <>
      {loading && <Loader message={`Syncing ${activeTab} Projects...`} />}
      
      <div className="p-2 animate-in fade-in duration-700">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-[38px] font-[900] text-[#005587] italic tracking-tight leading-none uppercase">
              Projects Overview
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-3 ml-1">
              Manage Chapter Initiatives
            </p>
          </div>

          <button 
            onClick={() => { setSelectedProject(null); setIsModalOpen(true); }}
            className="bg-[#005587] text-white px-10 py-4 rounded-[20px] font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-blue-100 hover:-translate-y-1 transition-all flex items-center gap-3"
          >
            <Plus size={18} strokeWidth={3} /> New Project
          </button>
        </div>

        <div className="flex gap-2 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm w-fit mb-8">
            <button 
                onClick={() => setActiveTab('Approved')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'Approved' ? 'bg-emerald-50 text-emerald-600 shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}
            >
                <CheckCircle2 size={14} /> Approved
            </button>
            <button 
                onClick={() => setActiveTab('Pending')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'Pending' ? 'bg-amber-50 text-amber-600 shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}
            >
                <Clock size={14} /> Pending
            </button>
            <button 
                onClick={() => setActiveTab('Rejected')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'Rejected' ? 'bg-rose-50 text-rose-600 shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}
            >
                <XCircle size={14} /> Rejected
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {!loading && projects.length === 0 ? (
            <div className="col-span-full py-24 text-center bg-white rounded-[40px] border border-slate-50 shadow-sm">
                <p className="text-[10px] font-black text-slate-300 uppercase italic tracking-[0.4em]">
                  No {activeTab} projects found.
                </p>
            </div>
          ) : (
            projects.map((project) => {
              // 🌟 3. تطبيق الدالة الجديدة لمعرفة شو نعرض
              const displayStatus = getDisplayStatus(project);
              const statusColors = getStatusColors(displayStatus); 
              
              return (
                <div key={project.project_id} className="bg-white p-8 rounded-[40px] shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-slate-50 relative group transition-all hover:shadow-xl flex flex-col">
                  
                  <div className="absolute top-8 right-8 flex gap-2">
                    <button 
                      onClick={() => { setSelectedProject(project); setIsModalOpen(true); }}
                      className="p-3 bg-slate-50 text-slate-400 hover:bg-amber-50 hover:text-amber-600 rounded-xl transition-all"
                      title="Edit Project"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(project.project_id)}
                      className="p-3 bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all"
                      title="Delete Project"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex items-center gap-3 mb-8">
                    <div className={`${statusColors.bg} ${statusColors.text} p-3 rounded-2xl`}>
                      <Briefcase size={20} />
                    </div>
                    {/* 🌟 4. عرض الكلمة الصحيحة هنا */}
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}>
                      {displayStatus}
                    </span>
                  </div>

                  <h3 className="text-2xl font-[900] text-slate-800 mb-8 uppercase tracking-tight italic group-hover:text-[#005587] transition-colors">
                    {project.title}
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-8 flex-1">
                    <div className="bg-slate-50/50 p-5 rounded-[25px] border border-transparent">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 leading-none">Leader</p>
                      <div className="text-slate-700 font-bold text-xs flex items-center gap-2">
                        <Users size={14} className="text-[#005587]" /> {project.leader?.full_name || 'Not Assigned'}
                      </div>
                    </div>
                    <div className="bg-slate-50/50 p-5 rounded-[25px] border border-transparent">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 leading-none">Volunteers</p>
                      <div className="text-slate-700 font-bold text-xs flex items-center gap-2">
                        <Clock size={14} className="text-[#005587]" /> {project.members?.length || 0} Joined
                      </div>
                    </div>
                  </div>

                  {/* 🌟 إخفاء أزرار إدارة المهام إذا كان المشروع مرفوض أو لسا قيد الانتظار */}
                  {activeTab === 'Approved' && (
                    <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                      <button 
                        onClick={() => { setProjectForLeader(project); setIsLeaderModalOpen(true); }}
                        className="flex-1 py-4 bg-slate-50 text-slate-600 font-black text-[10px] uppercase tracking-[0.1em] rounded-[20px] hover:bg-slate-100 hover:text-slate-800 transition-all flex items-center justify-center gap-2 border border-slate-100"
                      >
                        <ShieldAlert size={16} className="text-amber-500" /> Manage Leader
                      </button>
                      
                      <button 
                        onClick={() => navigate(`/chapter-chair/tasks?project_id=${project.project_id}&title=${encodeURIComponent(project.title)}`)}
                        className="flex-1 py-4 bg-[#005587] text-white font-black text-[10px] uppercase tracking-[0.1em] rounded-[20px] hover:-translate-y-0.5 hover:shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2"
                      >
                        <CheckSquare size={16} /> View Tasks
                      </button>
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

        <ProjectFormModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          projectToEdit={selectedProject} 
          onSuccess={() => { setIsModalOpen(false); fetchProjects(); }} 
        />

        <LeaderManagementModal 
          isOpen={isLeaderModalOpen}
          onClose={() => setIsLeaderModalOpen(false)}
          project={projectForLeader}
          onSuccess={() => { setIsLeaderModalOpen(false); fetchProjects(); }}
        />
        
      </div>
    </>
  );
};

export default ProjectsManagement;