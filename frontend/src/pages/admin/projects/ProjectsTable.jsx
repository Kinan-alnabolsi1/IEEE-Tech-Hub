// src/pages/admin/projects/components/ProjectsTable.jsx
import React from 'react';
import { Eye, CheckCircle2, XCircle, Clock, FolderOpen } from 'lucide-react';

const ProjectsTable = ({ projects, onView, onApprove, onReject, activeTab }) => {
  // 🌟 دالة للحصول على الحالة الصحيحة لعرضها بالبادج
  const getDisplayStatus = (project) => {
    // إذا كان المشروع ناطر موافقة أو مرفوض، بنعرض حالة الموافقة
    if (project.approval_status === 'Pending') return 'Pending Approval';
    if (project.approval_status === 'Rejected') return 'Rejected';
    // إذا كان مقبول، بنعرض حالته التشغيلية الفعلية
    return project.status || 'Unknown';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending Approval':
      case 'Pending':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-amber-100"><Clock size={12} /> Pending</span>;
      case 'Open':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-emerald-100">Open</span>;
      case 'Ongoing':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-[#00629B] rounded-xl text-[9px] font-black uppercase tracking-widest border border-blue-100">Ongoing</span>;
      case 'Completed':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-emerald-100">Completed</span>;
      case 'Cancelled':
      case 'Rejected':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-red-100">{status}</span>;
      default:
        return <span className="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-xl text-[9px] font-black uppercase tracking-widest">{status}</span>;
    }
  };

  return (
    <div className="w-full overflow-x-auto no-scrollbar">
      <table className="w-full text-left min-w-[900px]">
        <thead className="bg-[#F8FAFC]">
          <tr>
            {["Project Name", "Chapter", "Leader", "Status", "Actions"].map(
              (head, i) => (
                <th
                  key={i}
                  className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest"
                >
                  {head}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {projects.length > 0 ? (
            projects.map((project) => (
              <tr
                key={project.project_id}
                className="hover:bg-[#F8FAFC] transition-colors group"
              >
                <td className="px-8 py-5">
                  <span className="text-xs font-black text-slate-800 uppercase">
                    {project.title || project.name}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <span className="text-xs font-bold text-slate-500">
                    {project.chapter?.name || project.chapter || "N/A"}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <span className="text-xs font-bold text-slate-600">
                    {project.leader?.full_name || project.leader || "N/A"}
                  </span>
                </td>
                
                {/* 🌟 التعديل هنا: استخدام الدالة الجديدة بدل status المباشر */}
                <td className="px-8 py-5">{getStatusBadge(getDisplayStatus(project))}</td>
                
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onView(project)}
                      className="p-2.5 text-slate-400 hover:text-[#00629B] hover:bg-blue-50 rounded-xl transition-all"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>

                    {/* أزرار القبول والرفض تظهر فقط للمشاريع التي تنتظر الموافقة */}
                    {activeTab === "Pending" && (
                      <>
                        <button
                          onClick={() => onApprove(project.project_id)}
                          className="p-2.5 text-amber-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"
                          title="Approve"
                        >
                          <CheckCircle2 size={16} />
                        </button>
                        <button
                          onClick={() => onReject(project.project_id)}
                          className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          title="Reject"
                        >
                          <XCircle size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="px-8 py-32">
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                    <FolderOpen className="text-slate-300" size={24} />
                  </div>
                  <p className="text-[10px] font-black text-slate-300 uppercase italic tracking-[0.4em]">
                    No {activeTab} Projects Found
                  </p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectsTable;