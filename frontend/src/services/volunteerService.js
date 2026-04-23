import { getData } from '../api/apiMethods';

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

  // 🌟 الدالة الجديدة والمهمة لإدارة الأعضاء:
  // جلب كل المستخدمين اللي بفرع معين (عشان نختار منهم أعضاء للشابتر)
  getByBranch: (branchId) => 
    getData(`/branches/${branchId}/volunteers`), 
};