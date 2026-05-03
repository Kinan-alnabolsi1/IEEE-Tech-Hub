// src/pages/admin/projects/components/ProjectDetailsModal.jsx
import React from 'react';
import BaseModal from '@/components/ui/BaseModal';
import { Target, Calendar, User, FileText } from 'lucide-react';

const ProjectDetailsModal = ({ isOpen, onClose, project }) => {
  if (!project) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Project Details"
      subtitle={`Proposed by ${project.chapter_name}`}
    >
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="p-6 bg-[#F8FAFC] rounded-[2rem] border border-slate-100 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white text-[#00629B] rounded-xl shadow-sm">
              <Target size={20} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Project Name
              </p>
              <h3 className="text-sm font-black text-slate-800 uppercase">
                {project.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-white text-[#00629B] rounded-xl shadow-sm">
              <User size={20} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Project Leader
              </p>
              <h3 className="text-xs font-bold text-slate-700">
                {project.leader ? project.leader : "N/A"}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-white text-[#00629B] rounded-xl shadow-sm">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Timeline
              </p>
              <h3 className="text-xs font-bold text-slate-700">
                {project.start_date} - {project.end_date}
              </h3>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
            <FileText size={14} className="text-[#00629B]" /> Description &
            Goals
          </label>
          <div className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm text-xs font-bold text-slate-600 leading-relaxed">
            {project.description ||
              "No detailed description provided by the chapter yet."}
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default ProjectDetailsModal;