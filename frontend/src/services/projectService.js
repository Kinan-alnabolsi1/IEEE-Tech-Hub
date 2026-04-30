import { getData, postData, putData, deleteData, patchData } from '../api/apiMethods';

export const projectService = {
  // 1. جلب مشاريع الفرع (للأدمن)
  getByBranch: (branchId) => getData(`/branches/${branchId}/projects`),
  
  // 2. 🌟 جلب مشاريع الفصل (رئيس الفصل)
  getChapterProjects: (chapterId) => getData(`/chapters/${chapterId}/projects`),

  // 3. 🌟 جلب طلبات الانضمام لمشروع محدد مع فلتر الحالة
  getProjectApplications: (projectId, status = 'Pending') => 
    getData(`/projects/${projectId}/applications?status=${status}`),

  // 4. إنشاء مشروع جديد
  createProject: (data) => postData('/projects', data),

  // 5. تعديل مشروع
  updateProject: (projectId, data) => putData(`/projects/${projectId}`, data),

  // 6. حذف مشروع
  deleteProject: (projectId) => deleteData(`/projects/${projectId}`),
  
  // 7. تغيير حالة المشروع (Open / Closed)
  updateStatus: (projectId, status) => patchData(`/projects/${projectId}/status`, { status })
};