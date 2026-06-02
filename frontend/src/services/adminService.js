import { getData, patchData } from '../api/apiMethods';

export const adminService = {

  getBranchAdmins: (status) =>
    getData(`/users?role=Branch Admin&status=${status}`),

  updateAdminStatus: (userId, newStatus) =>
    patchData(`/users/${userId}/status`, { status: newStatus }),


  getDashboardStats: () => getData("/admin/stats"),

  getBranchDashboardStats: (branchId) => getData(`/branches/${branchId}/stats`),

  getMembers: (branchId, status) =>
    getData(`/branches/${branchId}/volunteers?status=${status}`),

  updateMemberStatus: (userId, newStatus) =>
    patchData(`/users/${userId}/status`, { status: newStatus }),
};