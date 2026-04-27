// src/services/projectService.js
import { getData, patchData } from '../api/apiMethods';

export const projectService = {
  // جلب مشاريع الفرع
  getByBranch: (branchId) => getData(`/branches/${branchId}/projects`),
  
  // 🌟 تغيير حالة المشروع (موافقة أو رفض)
  updateStatus: (projectId, status) => patchData(`/projects/${projectId}/status`, { status }),
  
  // جلب تفاصيل مشروع (إن وجد API مخصص)
  getDetails: (projectId) => getData(`/projects/${projectId}`)
};