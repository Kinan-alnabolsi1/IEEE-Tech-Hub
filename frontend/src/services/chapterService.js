import { getData, postData, deleteData, patchData, putData } from '../api/apiMethods';

export const chapterService = {
  getAll: (status = "") =>
    getData(`/chapters${status ? `?status=${status}` : ""}`),

  getByBranch: (branchId) => getData(`/branches/${branchId}/chapters`),

  create: (data) => postData("/chapters", data),

  getMembers: (chapterId) => getData(`/chapters/${chapterId}`),

  update: (id, data) => putData(`/chapters/${id}`, data),

  assignChair: (chapterId, userId) =>
    patchData(`/chapters/${chapterId}/assign-chair`, { user_id: userId }),

  removeChair: (chapterId) => 
    deleteData(`/chapters/${chapterId}/chair`),

  addMember: (chapterId, userId, role = "Member") =>
    postData(`/chapters/${chapterId}/members`, {
      user_id: userId,
      role_in_chapter: role,
    }),

  removeMember: (chapterId, userId) =>
    deleteData(`/chapters/${chapterId}/members/${userId}`),

  delete: (chapterId) => deleteData(`/chapters/${chapterId}`),


  getChapterMembers: (chapterId, role = '', status = '') => {
    let queryParams = new URLSearchParams();
    
    if (role) queryParams.append('role', role);
    if (status) queryParams.append('status', status);
    
    const queryString = queryParams.toString();
    const endpoint = `/chapters/${chapterId}/members${queryString ? `?${queryString}` : ''}`;
    
    return getData(endpoint);
  }
};