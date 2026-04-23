import { getData, postData, deleteData, patchData, putData } from '../api/apiMethods';

export const chapterService = {
  // جلب فصول فرع محدد (للعرض في الجدول)
  getByBranch: (branchId) => getData(`/branches/${branchId}/chapters`),

  // إنشاء فصل جديد
  create: (data) => postData('/chapters', data),

  // تعديل بيانات الفصل (الاسم، الوصف، الحالة)
  update: (id, data) => putData(`/chapters/${id}`, data),

  // حذف الفصل
  delete: (id) => deleteData(`/chapters/${id}`),

  // 🌟 إدارة الأعضاء (بناءً على التوثيق اللي بعتيه) 🌟

  // جلب تفاصيل الفصل (بيجيب مصفوفة الـ members)
  getMembers: (chapterId) => getData(`/chapters/${chapterId}`),

  // إضافة عضو للفصل
  addMember: (chapterId, userId, role = 'Member') => 
    postData(`/chapters/${chapterId}/members`, { user_id: userId, role_in_chapter: role }),

  // إزالة عضو من الفصل
  removeMember: (chapterId, userId) => 
    deleteData(`/chapters/${chapterId}/members/${userId}`),

  // تعيين رئيس للفصل (Assign Chair)
  assignChair: (chapterId, userId) => 
    patchData(`/chapters/${chapterId}/assign-chair`, { user_id: userId }),
};