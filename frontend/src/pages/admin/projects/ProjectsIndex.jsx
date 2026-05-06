// src/pages/admin/projects/ProjectsIndex.jsx
import React, { useState, useEffect } from 'react';
import { projectService } from '../../../services/projectService';
import ProjectsTable from './ProjectsTable'; 
import ProjectDetailsModal from './ProjectDetailsModal'; 
import toast from 'react-hot-toast';
import Loader from '../../../components/ui/Loader';
import { Clock, CheckCircle2, XCircle } from 'lucide-react'; 

const ProjectsIndex = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 🌟 State الفلترة (التابات)
  const [activeTab, setActiveTab] = useState('Pending'); 

  const branchId = localStorage.getItem('branch_id');

  const fetchProjects = async () => {
    if (!branchId) return;
    try {
      setLoading(true);
      const res = await projectService.getByBranch(branchId, activeTab); 
      setProjects(res.data?.data || res.data || []);
    } catch (err) {
      toast.error(`Failed to fetch ${activeTab} projects`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchProjects(); 
  }, [branchId, activeTab]);

  const handleApprove = async (projectId) => {
    try {
      setLoading(true);
      await projectService.approveProject(projectId); 
      toast.success("Project Approved Successfully");
      fetchProjects(); 
    } catch (err) { 
      toast.error(err.response?.data?.message || "Failed to approve project"); 
    } finally {
        setLoading(false);
    }
  };

  const handleReject = async (projectId) => {
    if (!window.confirm("Are you sure you want to reject this project?")) return;
    try {
      setLoading(true);
      await projectService.rejectProject(projectId); 
      toast.success("Project Rejected");
      fetchProjects(); 
    } catch (err) { 
      toast.error(err.response?.data?.message || "Failed to reject project"); 
    } finally {
        setLoading(false);
    }
  };

  return (
    <>
      {loading && <Loader message={`Syncing ${activeTab} Projects...`} />}

      <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700 max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-[#00629B] uppercase italic tracking-tighter">
              Project Approvals
            </h1>
            <p className="text-[10px] text-slate-400 font-bold tracking-[0.4em] uppercase mt-1">
              Monitor & Oversee Chapter Activities
            </p>
          </div>
        </div>

        {/* 🌟 Tabs UI (فلترة الحالات) */}
        <div className="flex gap-2 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm w-fit">
            <button 
                onClick={() => setActiveTab('Pending')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'Pending' ? 'bg-amber-50 text-amber-600 shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}
            >
                <Clock size={14} /> Pending
            </button>
            <button 
                onClick={() => setActiveTab('Approved')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'Approved' ? 'bg-emerald-50 text-emerald-600 shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}
            >
                <CheckCircle2 size={14} /> Approved
            </button>
            <button 
                onClick={() => setActiveTab('Rejected')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'Rejected' ? 'bg-rose-50 text-rose-600 shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}
            >
                <XCircle size={14} /> Rejected
            </button>
        </div>

        {/* Table Wrapper */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 min-h-[400px]">
          {!loading && (
            <ProjectsTable 
              projects={projects}
              onView={(p) => { setSelectedProject(p); setIsModalOpen(true); }}
              onApprove={handleApprove}
              onReject={handleReject}
              activeTab={activeTab}
            />
          )}
        </div>

        <ProjectDetailsModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          project={selectedProject}
        />
      </div>
    </>
  );
};

export default ProjectsIndex;