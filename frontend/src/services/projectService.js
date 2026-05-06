import { getData, postData, putData, deleteData, patchData } from '../api/apiMethods';

export const projectService = {
  // 1. جلب مشاريع الفرع (للأدمن) مع فلتر حالة الموافقة
  getByBranch: (branchId, approvalStatus = 'Pending') => 
    getData(`/branches/${branchId}/projects?approval_status=${approvalStatus}`),
  
  // 2. جلب مشاريع الفصل (رئيس الفصل) مع فلتر حالة الموافقة
  getChapterProjects: (chapterId, approvalStatus = 'Pending') => 
    getData(`/chapters/${chapterId}/projects?approval_status=${approvalStatus}`),

  // 3. 🌟 جلب المشاريع للمتطوعين (موافق عليها + مفتوحة للتقديم حصراً)
  getVolunteerProjects: (chapterId) => 
    getData(`/chapters/${chapterId}/projects?approval_status=Approved&status=Open`),

  // 4. 🌟 دوال قبول ورفض المشاريع (للأدمن)
  approveProject: (projectId) => patchData(`/projects/${projectId}/approve`),
  rejectProject: (projectId) => patchData(`/projects/${projectId}/reject`),

  // 5. جلب طلبات الانضمام لمشروع محدد
  getProjectApplications: (projectId, status = 'Pending') => 
    getData(`/projects/${projectId}/applications?status=${status}`),

  // 6. إنشاء وتعديل وحذف المشروع
  createProject: (data) => postData('/projects', data),
  updateProject: (projectId, data) => putData(`/projects/${projectId}`, data),
  deleteProject: (projectId) => deleteData(`/projects/${projectId}`),
  
  // 7. تغيير حالة المشروع (Open / Ongoing / Completed / Cancelled)
  updateStatus: (projectId, status) => patchData(`/projects/${projectId}/status`, { status }),
  
  // --------------------------------------------------------
  // 🌟 دوال إدارة قادة المشاريع
  // --------------------------------------------------------
  getLeaderApplications: (projectId) => 
    getData(`/projects/${projectId}/applications?status=Pending&role=${encodeURIComponent('Project Leader')}`),

  assignProjectLeader: (projectId, userId) => 
    patchData(`/projects/${projectId}/assign-leader`, { user_id: userId }),

  removeProjectLeader: (projectId) => 
    deleteData(`/projects/${projectId}/leader`)
};