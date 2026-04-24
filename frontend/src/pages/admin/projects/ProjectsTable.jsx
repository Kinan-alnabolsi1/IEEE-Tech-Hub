// src/pages/admin/projects/components/ProjectsTable.jsx
import React from 'react';
import { Eye, CheckCircle2, XCircle, Clock } from 'lucide-react';

const ProjectsTable = ({ projects, onView, onApprove, onReject }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending Approval':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-amber-100"><Clock size={12} /> Pending</span>;
      case 'Ongoing':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-[#00629B] rounded-xl text-[9px] font-black uppercase tracking-widest border border-blue-100">Ongoing</span>;
      case 'Completed':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-emerald-100">Completed</span>;
      case 'Rejected':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-red-100">Rejected</span>;
      default:
        return <span className="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-xl text-[9px] font-black uppercase tracking-widest">{status}</span>;
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-x-auto no-scrollbar">
      <table className="w-full text-left border-separate border-spacing-0 min-w-[900px]">
        <thead>
          <tr>
            {['Project Name', 'Chapter', 'Leader', 'Status', 'Actions'].map((head, i) => (
              <th key={i} className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 bg-slate-50/50">
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {projects.length > 0 ? projects.map((project) => (
            <tr key={project.project_id} className="hover:bg-[#F8FAFC] transition-colors group">
              <td className="px-8 py-5">
                <span className="text-xs font-black text-slate-800 uppercase">{project.name}</span>
              </td>
              <td className="px-8 py-5">
                <span className="text-xs font-bold text-slate-500">{project.chapter_name}</span>
              </td>
              <td className="px-8 py-5">
                <span className="text-xs font-bold text-slate-600">{project.leader_name}</span>
              </td>
              <td className="px-8 py-5">
                {getStatusBadge(project.status)}
              </td>
              <td className="px-8 py-5">
                <div className="flex items-center gap-2">
                  <button onClick={() => onView(project)} className="p-2.5 text-slate-400 hover:text-[#00629B] hover:bg-blue-50 rounded-xl transition-all" title="View Details">
                    <Eye size={16} />
                  </button>
                  
                  {project.status === 'Pending Approval' && (
                    <>
                      <button onClick={() => onApprove(project.project_id)} className="p-2.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all" title="Approve">
                        <CheckCircle2 size={16} />
                      </button>
                      <button onClick={() => onReject(project.project_id)} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Reject">
                        <XCircle size={16} />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="5" className="px-8 py-12 text-center text-[11px] font-black text-slate-300 uppercase tracking-widest italic">
                No projects found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectsTable;