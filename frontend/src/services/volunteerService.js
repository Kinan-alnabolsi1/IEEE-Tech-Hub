// src/services/volunteerService.js
import { getData, postData, patchData } from '../api/apiMethods';

export const volunteerService = {
  // --- 👤 Profile & Onboarding ---
  getProfile: () => getData('/profile'),
  completeOnboarding: (data) => postData('/profile/onboarding', data),
  getSkills: () => getData('/skills'), // 🌟 الإضافة الجديدة لجلب المهارات

  // --- 🔍 Projects Exploration ---
  getChapterProjects: (chapterId) => getData(`/chapters/${chapterId}/projects`),
  getProjectDetails: (projectId) => getData(`/projects/${projectId}`),
  joinProject: (projectId, roleName) => 
    postData(`/projects/${projectId}/join`, { role: roleName }),

  // --- 📁 Applications & Tasks ---
  getMyProjects: () => getData('/my-projects'),
  getMyTasks: () => getData('/my-tasks'),
  updateTaskProgress: (assignmentId, completionPct, note) => 
    patchData(`/tasks/assignments/${assignmentId}/progress`, {
      completion_pct: completionPct,
      progress_note: note
    }),

  // --- 🏢 Admin Utils ---
  getBranches: () => getData('/branches'),
  getChapters: (branchId) => getData(`/chapters?branch_id=${branchId}`),
  
  // جلب المتطوعين مع التأكد من إرسال حالة active افتراضياً
  getByBranch: (branchId, status = 'active') => {
    const query = status ? `?status=${status}` : '';
    return getData(`/branches/${branchId}/volunteers${query}`);
  },

  updateStatus: (userId, status) => 
    patchData(`/users/${userId}/status`, { status }),
};