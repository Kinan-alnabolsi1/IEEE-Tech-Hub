import { getData, patchData } from '../api/apiMethods';

export const volunteerService = {
  // جلب الملف الشخصي للمتطوع
  getProfile: (userId) => 
    getData(`/users/${userId}`),

  // جلب الفروع
  getBranches: () => 
    getData('/branches'),

  // جلب الفصول التابعة لفرع
  getChapters: (branchId) => 
    getData(`/chapters?branch_id=${branchId}`),

  // 🌟 جلب المتطوعين مع دعم الفلترة حسب الحالة (Active, Pending, Suspended)
  getByBranch: (branchId, status = '') => {
    const query = status ? `?status=${status}` : '';
    return getData(`/branches/${branchId}/volunteers${query}`);
  },

  // 🌟 تغيير حالة المتطوع (قبول، رفض/إيقاف، إرجاع للانتظار)
  updateStatus: (userId, status) => 
    patchData(`/users/${userId}/status`, { status }),
};