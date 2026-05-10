// src/services/volunteerService.js
import { getData, postData, patchData, putData } from '../api/apiMethods'; // 🌟 ضفنا putData هون

export const volunteerService = {
  // --- 👤 Profile & Onboarding (بدون تغيير) ---
  getProfile: () => getData('/profile'),
  completeOnboarding: (data) => postData('/profile/onboarding', data),
  getSkills: () => getData('/skills'), 
  
  // 🌟 التعديل هنا: استخدام putData والمسار الصحيح بناءً على كلام الباك إند
  updateProfile: (data) => putData('/profile/update', data),

  getMyJourney: () => getData('/my-journey'),

  // --- 🔍 Projects Exploration (بدون تغيير) ---
  getChapterProjects: (chapterId) => getData(`/chapters/${chapterId}/projects`),
  getProjectDetails: (projectId) => getData(`/projects/${projectId}`),
  joinProject: (projectId, roleName) => 
    postData(`/projects/${projectId}/join`, { role: roleName }),

  // --- 📁 Applications & Tasks (تعديل آمن للدالة) ---
  getMyProjects: () => getData('/my-projects'),
  getMyTasks: () => getData('/my-tasks'),
  
  // 🌟 تعديل الدالة لتستقبل Object (data) بدل متغيرات منفصلة
  updateTaskProgress: (assignmentId, data) => 
    patchData(`/tasks/assignments/${assignmentId}/progress`, data),

  // الدالة الجديدة لجلب تقييم المتطوع في مشروع معين
    getUserOverview: (userId, projectId) => 
        getData(`/users/${userId}/overview?project_id=${projectId}`),

  // --- 🏢 Admin Utils (بدون تغيير) ---
  getBranches: () => getData('/branches'),
  getChapters: (branchId) => getData(`/chapters?branch_id=${branchId}`),
  
  getByBranch: (branchId, status = 'active') => {
    const query = status ? `?status=${status}` : '';
    return getData(`/branches/${branchId}/volunteers${query}`);
  },

  updateStatus: (userId, status) => 
    patchData(`/users/${userId}/status`, { status }),

  getOverview: (userId) => getData(`/users/${userId}/overview`),
  
};

