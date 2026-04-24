import { getData, postData, deleteData, patchData, putData } from '../api/apiMethods';

export const chapterService = {
  // 1. جلب جميع الفصول (مع إمكانية الفلترة حسب الحالة Active/Inactive)
  getAll: (status = '') => 
    getData(`/chapters${status ? `?status=${status}` : ''}`),

  // 2. جلب فصول فرع محدد (للعرض في الجدول)
  getByBranch: (branchId) => 
    getData(`/branches/${branchId}/chapters`),

  // 3. إنشاء فصل جديد
  create: (data) => 
    postData('/chapters', data),

  // 4. جلب تفاصيل الفصل (بيجيب تفاصيل الفصل مع مصفوفة الـ members)
  getMembers: (chapterId) => 
    getData(`/chapters/${chapterId}`),

  // 5. تعديل بيانات الفصل (الاسم، الوصف، الحالة، إلخ)
  update: (id, data) => 
    putData(`/chapters/${id}`, data),

  // 6. تعيين رئيس للفصل (Assign Chair)
  assignChair: (chapterId, userId) => 
    patchData(`/chapters/${chapterId}/assign-chair`, { user_id: userId }),

  // 7. إضافة متطوع للفصل
  addMember: (chapterId, userId, role = 'Member') => 
    postData(`/chapters/${chapterId}/members`, { user_id: userId, role_in_chapter: role }),

  // 8. إزالة متطوع من الفصل
  removeMember: (chapterId, userId) => 
    deleteData(`/chapters/${chapterId}/members/${userId}`),
};