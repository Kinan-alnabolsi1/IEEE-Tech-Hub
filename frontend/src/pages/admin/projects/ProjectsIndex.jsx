// src/pages/admin/projects/ProjectsIndex.jsx
import React, { useState, useEffect } from 'react';
import { projectService } from '../../../services/projectService';
import { Activity } from 'lucide-react';
import ProjectsTable from './ProjectsTable';
import ProjectDetailsModal from './ProjectDetailsModal';
import toast from 'react-hot-toast';

const ProjectsIndex = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const branchId = localStorage.getItem('branch_id');

  // داتا وهمية (Mock Data) للتجريب حتى يجهز الباك إند
  const mockProjects = [
    { project_id: 1, name: "AI Hackathon 2026", chapter_name: "Computer Society", leader_name: "Ahmad Ali", status: "Pending Approval", start_date: "Oct 10", end_date: "Oct 12", description: "A 48-hour hackathon focusing on AI solutions for branch members." },
    { project_id: 2, name: "Robotics Workshop", chapter_name: "RAS", leader_name: "Lina Omar", status: "Ongoing", start_date: "Sep 01", end_date: "Oct 30", description: "Weekly sessions to build a line-follower robot." },
    { project_id: 3, name: "Women in Tech Panel", chapter_name: "WIE", leader_name: "Shahd", status: "Completed", start_date: "Aug 15", end_date: "Aug 15", description: "Discussion panel with industry leaders." },
  ];

  const fetchProjects = async () => {
    try {
      setLoading(true);
      // محاولة الجلب من الباك إند
      const res = await projectService.getByBranch(branchId);
      setProjects(res.data?.data || res.data || []);
    } catch (err) {
      // 🌟 بمجرد أن يجهز الباك إند، احذفي هذا الـ Catch واستخدمي toast.error فقط
      console.warn("API not ready, using Mock Data");
      setProjects(mockProjects);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (branchId) fetchProjects(); }, [branchId]);

  const handleApprove = async (projectId) => {
    try {
      // await projectService.approve(projectId); // نفعلها عند جهوزية الـ API
      setProjects(prev => prev.map(p => p.project_id === projectId ? { ...p, status: 'Ongoing' } : p));
      toast.success("Project Approved Successfully");
    } catch (err) { toast.error("Failed to approve"); }
  };

  const handleReject = async (projectId) => {
    if (!window.confirm("Are you sure you want to reject this project?")) return;
    try {
      // await projectService.reject(projectId, "Admin decision"); // نفعلها لاحقاً
      setProjects(prev => prev.map(p => p.project_id === projectId ? { ...p, status: 'Rejected' } : p));
      toast.success("Project Rejected");
    } catch (err) { toast.error("Failed to reject"); }
  };

  return (
    <div className="p-4 md:p-8 space-y-10 animate-in fade-in duration-700 max-w-[1600px] mx-auto">
      
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

      {/* Table */}
      <ProjectsTable 
        projects={projects}
        onView={(p) => { setSelectedProject(p); setIsModalOpen(true); }}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      {/* Modal */}
      <ProjectDetailsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        project={selectedProject}
      />
    </div>
  );
};

export default ProjectsIndex;