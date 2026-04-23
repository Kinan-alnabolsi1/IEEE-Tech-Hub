import { getData, postData, putData, deleteData } from '@/api/apiMethods';

export const societyService = {
    // جلب كل الجمعيات
    getAll: () => getData('/societies'),

    // إضافة جمعية جديدة
    create: (data) => postData('/societies', data),

    // تعديل جمعية
    update: (id, data) => putData(`/societies/${id}`, data),

    // حذف جمعية من النظام نهائياً
    delete: (id) => deleteData(`/societies/${id}`),

    // ✅ ربط جمعية بفرع (Attach)
    attachToBranch: (branchId, societyIds) => 
        postData(`/branches/${branchId}/societies`, { society_ids: societyIds }),

    // 🌟 الدالة الجديدة: إلغاء ربط جمعية واحدة بفرع (Detach)
    detachFromBranch: (branchId, societyId) => 
        deleteData(`/branches/${branchId}/societies/${societyId}`)
};