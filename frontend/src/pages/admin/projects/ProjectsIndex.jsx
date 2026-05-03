// src/pages/admin/projects/ProjectsIndex.jsx
import React, { useState, useEffect } from 'react';
import { projectService } from '../../../services/projectService';
import { Activity } from 'lucide-react'; // 🌟 أزلنا Loader2 من هنا
import ProjectsTable from './ProjectsTable'; 
import ProjectDetailsModal from './ProjectDetailsModal'; 
import toast from 'react-hot-toast';
import Loader from '../../../components/ui/Loader'; // 🌟 استيراد اللودر الموحد

const ProjectsIndex = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // جلب الـ branch_id من اللوكال ستوريج
  const branchId = localStorage.getItem('branch_id');

  const fetchProjects = async () => {
    if (!branchId) return;
    try {
      setLoading(true);
      const res = await projectService.getByBranch(branchId);
      // استخراج مصفوفة المشاريع
      setProjects(res.data?.data || res.data || []);
    } catch (err) {
      toast.error("Failed to fetch projects from server");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchProjects(); 
  }, [branchId]);

  // دالة الموافقة الحقيقية
  const handleApprove = async (projectId) => {
    try {
      await projectService.updateStatus(projectId, 'Ongoing'); 
      toast.success("Project Approved Successfully");
      fetchProjects(); // تحديث الجدول فوراً
    } catch (err) { 
      toast.error(err.response?.data?.message || "Failed to approve project"); 
    }
  };

  // دالة الرفض الحقيقية
  const handleReject = async (projectId) => {
    if (!window.confirm("Are you sure you want to reject this project?")) return;
    try {
      await projectService.updateStatus(projectId, 'Rejected');
      toast.success("Project Rejected");
      fetchProjects(); // تحديث الجدول فوراً
    } catch (err) { 
      toast.error(err.response?.data?.message || "Failed to reject project"); 
    }
  };

  return (
    <>
      {/* 🌟 اللودر الموحد يغطي الشاشة أثناء جلب البيانات */}
      {loading && <Loader message="Syncing Projects..." />}

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

        {/* 🌟 Table Wrapper (يتم عرض الجدول فقط عندما ينتهي اللودينغ) */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 min-h-[400px]">
          {!loading && (
            <ProjectsTable 
              projects={projects}
              onView={(p) => { setSelectedProject(p); setIsModalOpen(true); }}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          )}
        </div>

        {/* Modal */}
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