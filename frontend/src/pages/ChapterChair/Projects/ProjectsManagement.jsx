import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { Plus, Users, Edit2, Trash2, Clock, Briefcase, CheckSquare, ShieldAlert } from 'lucide-react';
import { projectService } from '../../../services/projectService';
import ProjectFormModal from './ProjectFormModal';
import LeaderManagementModal from './LeaderManagementModal'; // 🌟 استيراد مودال القائد
import Loader from '../../../components/ui/Loader';
import toast from 'react-hot-toast';

const ProjectsManagement = () => {
  const navigate = useNavigate(); 
  
  // States للمشاريع
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States لمودال إنشاء/تعديل المشروع
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  
  // States لمودال إدارة القائد
  const [isLeaderModalOpen, setIsLeaderModalOpen] = useState(false);
  const [projectForLeader, setProjectForLeader] = useState(null);

  // 1️⃣ جلب المشاريع من الـ API الحقيقي
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const chapterId = localStorage.getItem('chapter_id');
      if (!chapterId) return;

      const response = await projectService.getChapterProjects(chapterId);
      setProjects(response.data?.data || response.data || []);
    } catch (_error) {
      toast.error("Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchProjects(); 
  }, []);

  // 2️⃣ حذف المشروع
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) return;
    
    const loadingToast = toast.loading("Deleting project...");
    try {
      await projectService.deleteProject(id);
      toast.success("Project deleted successfully", { id: loadingToast });
      fetchProjects(); // تحديث القائمة فوراً
    } catch (_error) {
      toast.error("Failed to delete project", { id: loadingToast });
    }
  };

  if (loading) return <Loader message="Syncing Projects..." />;

  return (
    <div className="p-2 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
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

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {projects.length === 0 ? (
          <div className="col-span-full py-24 text-center bg-white rounded-[40px] border border-slate-50 shadow-sm">
              <p className="text-[10px] font-black text-slate-300 uppercase italic tracking-[0.4em]">
                No projects found. Create one!
              </p>
          </div>
        ) : (
          projects.map((project) => (
            <div key={project.project_id} className="bg-white p-8 rounded-[40px] shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-slate-50 relative group transition-all hover:shadow-xl flex flex-col">
              
              {/* Actions Menu (Edit & Delete) */}
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

              {/* Split Actions Layout */}
              <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                {/* 🌟 زر إدارة القائد */}
                <button 
                  onClick={() => { setProjectForLeader(project); setIsLeaderModalOpen(true); }}
                  className="flex-1 py-4 bg-slate-50 text-slate-600 font-black text-[10px] uppercase tracking-[0.1em] rounded-[20px] hover:bg-slate-100 hover:text-slate-800 transition-all flex items-center justify-center gap-2 border border-slate-100"
                >
                  <ShieldAlert size={16} className="text-amber-500" /> Manage Leader
                </button>
                
                {/* 🌟 زر عرض المهام */}
                <button 
                  onClick={() => navigate(`/chapter-chair/tasks?project_id=${project.project_id}&title=${encodeURIComponent(project.title)}`)}
                  className="flex-1 py-4 bg-[#005587] text-white font-black text-[10px] uppercase tracking-[0.1em] rounded-[20px] hover:-translate-y-0.5 hover:shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2"
                >
                  <CheckSquare size={16} /> View Tasks
                </button>
              </div>

            </div>
          ))
        )}
      </div>

      {/* 🌟 مودال إنشاء وتعديل المشاريع */}
      <ProjectFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        projectToEdit={selectedProject} 
        onSuccess={() => { setIsModalOpen(false); fetchProjects(); }} 
      />

      {/* 🌟 مودال إدارة القائد (تعيين / عزل) */}
      <LeaderManagementModal 
        isOpen={isLeaderModalOpen}
        onClose={() => setIsLeaderModalOpen(false)}
        project={projectForLeader}
        onSuccess={() => { setIsLeaderModalOpen(false); fetchProjects(); }}
      />
      
    </div>
  );
};

export default ProjectsManagement;