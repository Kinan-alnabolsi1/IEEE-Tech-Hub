// src/services/projectService.js
import { getData, patchData } from '../api/apiMethods';

export const projectService = {
  // جلب مشاريع الفرع
  getByBranch: (branchId) => getData(`/branches/${branchId}/projects`),
  
  // الموافقة على مشروع
  approve: (projectId) => patchData(`/projects/${projectId}/approve`),
  
  // رفض مشروع
  reject: (projectId, reason) => patchData(`/projects/${projectId}/reject`, { reason }),
  
  // جلب تفاصيل مشروع (إن وجد API مخصص)
  getDetails: (projectId) => getData(`/projects/${projectId}`)
};