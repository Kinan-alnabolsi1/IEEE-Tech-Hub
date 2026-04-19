import { getData, postData, putData, deleteData } from '@/api/apiMethods';

export const societyService = {
    // جلب كل الجمعيات
    getAll: () => getData('/societies'),

    // إضافة جمعية جديدة
    create: (data) => postData('/societies', data),

    // تعديل جمعية (قيد الإنشاء في السيرفر)
    update: (id, data) => putData(`/societies/${id}`, data),

    // حذف جمعية
    delete: (id) => deleteData(`/societies/${id}`),

    // ربط جمعية بفرع (قيد الإنشاء في السيرفر)
    attachToBranch: (branchId, societyIds) => 
        postData(`/branches/${branchId}/societies`, { society_ids: societyIds })
};