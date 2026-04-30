import React, { useState, useEffect } from 'react';
import { Plus, Users, Edit2, Trash2, ArrowLeft, CheckCircle2, XCircle, Clock, ExternalLink, Briefcase, Settings } from 'lucide-react';
import { projectService } from '../../../services/projectService';
import ProjectFormModal from './ProjectFormModal';
import Loader from '../../../components/ui/Loader';
import toast from 'react-hot-toast';

const ProjectsManagement = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  
  const [viewMode, setViewMode] = useState('list'); 
  const [activeProject, setActiveProject] = useState(null);
  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);

  // 1️⃣ جلب المشاريع
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const chapterId = localStorage.getItem('chapter_id');
      const response = await projectService.getChapterProjects(chapterId);
      setProjects(response.data.data);
    } catch (_error) {
      toast.error("Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  // 2️⃣ حذف المشروع 🗑️
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) return;
    
    const loadingToast = toast.loading("Deleting project...");
    try {
      await projectService.deleteProject(id);
      toast.success("Project deleted successfully", { id: loadingToast });
      fetchProjects(); // تحديث القائمة
    } catch (_error) {
      toast.error("Failed to delete project", { id: loadingToast });
    }
  };

  // 3️⃣ تغيير حالة المشروع (Open/Closed) 🔄
  const handleToggleStatus = async (project) => {
    const newStatus = project.status === 'Open' ? 'Closed' : 'Open';
    const loadingToast = toast.loading(`Updating status to ${newStatus}...`);
    try {
      await projectService.updateStatus(project.project_id, newStatus);
      toast.success(`Project is now ${newStatus}`, { id: loadingToast });
      fetchProjects(); // تحديث القائمة
    } catch (_error) {
      toast.error("Failed to update status", { id: loadingToast });
    }
  };

  // 4️⃣ جلب طلبات الانضمام
  const fetchApplications = async (projectId) => {
    try {
      setAppsLoading(true);
      const response = await projectService.getProjectApplications(projectId, 'Pending');
      setApplications(response.data.data);
    } catch (_error) {
      toast.error("Failed to load applications");
    } finally {
      setAppsLoading(false);
    }
  };

  if (loading) return <Loader message="Syncing Projects..." />;
  if (appsLoading) return <Loader message="Loading Applications..." />;

  return (
    <div className="p-2 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-[38px] font-[900] text-[#005587] italic tracking-tight leading-none uppercase">
            {viewMode === 'list' ? 'Projects Overview' : 'Applications Review'}
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-3 ml-1">
            {viewMode === 'list' ? 'Manage Chapter Initiatives' : `Reviewing ${activeProject?.title}`}
          </p>
        </div>

        {viewMode === 'list' ? (
          <button 
            onClick={() => { setSelectedProject(null); setIsModalOpen(true); }}
            className="bg-[#005587] text-white px-10 py-4 rounded-[20px] font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-blue-100 hover:-translate-y-1 transition-all flex items-center gap-3"
          >
            <Plus size={18} strokeWidth={3} /> New Project
          </button>
        ) : (
          <button onClick={() => setViewMode('list')} className="flex items-center gap-2 text-slate-400 hover:text-[#005587] font-black text-[11px] uppercase tracking-[0.2em] transition-all">
            <ArrowLeft size={18} strokeWidth={3} /> Back to projects
          </button>
        )}
      </div>

      {viewMode === 'list' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {projects.map((project) => (
            <div key={project.project_id} className="bg-white p-8 rounded-[40px] shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-slate-50 relative group transition-all hover:shadow-xl">
              
              {/* Actions Menu */}
              <div className="absolute top-8 right-8 flex gap-2">
                <button 
                  onClick={() => handleToggleStatus(project)}
                  title="Toggle Status"
                  className="p-3 bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-[#005587] rounded-xl transition-all"
                >
                  <Settings size={16} />
                </button>
                <button 
                  onClick={() => { setSelectedProject(project); setIsModalOpen(true); }}
                  className="p-3 bg-slate-50 text-slate-400 hover:bg-amber-50 hover:text-amber-600 rounded-xl transition-all"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(project.project_id)}
                  className="p-3 bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Status */}
              <div className="flex items-center gap-3 mb-8">
                <div className={`${project.status === 'Open' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'} p-3 rounded-2xl`}>
                  <Briefcase size={20} />
                </div>
                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                  project.status === 'Open' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200'
                }`}>
                  {project.status}
                </span>
              </div>

              <h3 className="text-2xl font-[900] text-slate-800 mb-8 uppercase tracking-tight italic group-hover:text-[#005587] transition-colors">
                {project.title}
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50/50 p-5 rounded-[25px] border border-transparent">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 leading-none">Leader</p>
                  <div className="text-slate-700 font-bold text-xs flex items-center gap-2">
                    <Users size={14} className="text-[#005587]" /> {project.leader?.full_name || 'N/A'}
                  </div>
                </div>
                <div className="bg-slate-50/50 p-5 rounded-[25px] border border-transparent">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 leading-none">Volunteers</p>
                  <div className="text-slate-700 font-bold text-xs flex items-center gap-2">
                    <Clock size={14} className="text-[#005587]" /> {project.members?.length || 0} Joined
                  </div>
                </div>
              </div>

              <button 
                onClick={() => { setActiveProject(project); setViewMode('applications'); fetchApplications(project.project_id); }}
                className="w-full py-5 bg-slate-50 text-[#005587] font-black text-[11px] uppercase tracking-[0.2em] rounded-[22px] hover:bg-[#005587] hover:text-white transition-all flex items-center justify-center gap-3"
              >
                Manage Applications <ExternalLink size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        /* Applications View (كما هي) */
        <div className="grid gap-6 animate-in slide-in-from-right">
           {/* ... كود الـ Applications نفس السابق ... */}
        </div>
      )}

      {/* الـ Modal جاهز لاستقبال بيانات التعديل */}
      <ProjectFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        projectToEdit={selectedProject} 
        onSuccess={() => { setIsModalOpen(false); fetchProjects(); }} 
      />
    </div>
  );
};

export default ProjectsManagement;