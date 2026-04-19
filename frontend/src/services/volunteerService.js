import { getData } from '../api/apiMethods';

export const volunteerService = {
  // جلب الملف الشخصي للمتطوع (حسب الـ ID الخاص به)
  getProfile: (userId) => 
    getData(`/users/${userId}`),

  // إذا كان المتطوع يحتاج لرؤية قائمة الفروع المتاحة للانضمام إليها
  getBranches: () => 
    getData('/branches'),

  // جلب الفصول (Chapters) التابعة لفرع معين
  getChapters: (branchId) => 
    getData(`/chapters?branch_id=${branchId}`),
};