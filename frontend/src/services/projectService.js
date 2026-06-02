import { getData, postData, putData, deleteData, patchData } from '../api/apiMethods';

export const projectService = {
  getByBranch: (branchId, approvalStatus = 'Pending') => 
    getData(`/branches/${branchId}/projects?approval_status=${approvalStatus}`),
  
  getChapterProjects: (chapterId, approvalStatus = 'Pending') => 
    getData(`/chapters/${chapterId}/projects?approval_status=${approvalStatus}`),

  getVolunteerProjects: (chapterId) => 
    getData(`/chapters/${chapterId}/projects?approval_status=Approved&status=Open`),

  approveProject: (projectId) => patchData(`/projects/${projectId}/approve`),
  rejectProject: (projectId) => patchData(`/projects/${projectId}/reject`),

  getProjectApplications: (projectId, status = 'Pending') => 
    getData(`/projects/${projectId}/applications?status=${status}`),

  createProject: (data) => postData('/projects', data),
  updateProject: (projectId, data) => putData(`/projects/${projectId}`, data),
  deleteProject: (projectId) => deleteData(`/projects/${projectId}`),
  
  updateStatus: (projectId, status) => patchData(`/projects/${projectId}/status`, { status }),
  
  getLeaderApplications: (projectId) => 
    getData(`/projects/${projectId}/applications?status=Pending&role=${encodeURIComponent('Project Leader')}`),

  assignProjectLeader: (projectId, userId) => 
    patchData(`/projects/${projectId}/assign-leader`, { user_id: userId }),

  removeProjectLeader: (projectId) => 
    deleteData(`/projects/${projectId}/leader`),

  getProjectDetails: (projectId) => 
    getData(`/projects/${projectId}`),
    
  getProjectStats: (projectId) => 
    getData(`/projects/${projectId}/stats`),

  approveProjectMember: (projectId, userId) => 
    postData(`/projects/${projectId}/approve-member`, { user_id: userId }),

  rejectProjectMember: (projectId, userId) => 
    postData(`/projects/${projectId}/reject-member`, { user_id: userId }),


  getSkills: () => getData('/skills'),

  getProjectTasks: (projectId, params = {}) => {
    const queryParams = new URLSearchParams({ project_id: projectId, ...params }).toString();
    return getData(`/tasks?${queryParams}`);
  },

  evaluateMember: (taskId, userId, data) => postData(`/tasks/${taskId}/evaluate-member/${userId}`, data),
  
  getMyTasks: () => 
    getData('/my-tasks'),

  createTask: (data) => postData('/tasks', data),
  
  updateTask: (taskId, data) => patchData(`/tasks/${taskId}`, data),
  
  deleteTask: (taskId) => deleteData(`/tasks/${taskId}`),


  getAiRecommendations: (projectId, roleName) => 
    getData(`/projects/${projectId}/recommendations?role=${encodeURIComponent(roleName)}`)

};