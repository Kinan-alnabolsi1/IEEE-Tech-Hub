import { getData, postData, patchData, putData } from '../api/apiMethods'; 

export const volunteerService = {
  getProfile: () => getData('/profile'),
  completeOnboarding: (data) => postData('/profile/onboarding', data),
  getSkills: () => getData('/skills'), 
  
  updateProfile: (data) => putData('/profile/update', data),

  getMyJourney: () => getData('/my-journey'),

  getChapterProjects: (chapterId) => getData(`/chapters/${chapterId}/projects`),
  getProjectDetails: (projectId) => getData(`/projects/${projectId}`),
  joinProject: (projectId, roleName) => 
    postData(`/projects/${projectId}/join`, { role: roleName }),

  getMyProjects: () => getData('/my-projects'),
  getMyTasks: () => getData('/my-tasks'),
  
  updateTaskProgress: (assignmentId, data) => 
    patchData(`/tasks/assignments/${assignmentId}/progress`, data),

    getUserOverview: (userId, projectId) => 
        getData(`/users/${userId}/overview?project_id=${projectId}`),

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

