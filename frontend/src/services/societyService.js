import { getData, postData, putData, deleteData } from '../api/apiMethods';

export const societyService = {
    // 1. جلب كل الجمعيات (مع فلترة اختيارية حسب الحالة)
    // المسار: /api/societies أو /api/societies?status=Active
    getAll: (status = '') => {
        const query = status ? `?status=${status}` : '';
        return getData(`/societies${query}`);
    },

    // 2. جلب تفاصيل جمعية محددة باستخدام الـ ID
    // المسار: /api/societies/{id}
    getById: (id) => getData(`/societies/${id}`),

    // 3. إنشاء جمعية جديدة (للسوبر أدمن)
    // المسار: /api/societies
    create: (data) => postData('/societies', data),

    // 4. تعديل بيانات جمعية (للسوبر أدمن)
    // المسار: /api/societies/{id}
    update: (id, data) => putData(`/societies/${id}`, data),

    // 5. حذف الجمعية من النظام نهائياً (للسوبر أدمن)
    // المسار: /api/societies/{id}
    delete: (id) => deleteData(`/societies/${id}`),

    // ==========================================
    // 🌟 دوال الربط الخاصة بمدير الفرع (Branch Admin)
    // ==========================================

    // 6. ربط مجموعة من الجمعيات بفرع محدد (Attach)
    // المسار: /api/branches/{branchId}/societies
    // نمرر مصفوفة IDs: { society_ids: [1, 2, 3] }
    attachToBranch: (branchId, societyIds) => 
        postData(`/branches/${branchId}/societies`, { society_ids: societyIds }),

    // 7. إلغاء ربط جمعية واحدة بفرع محدد (Detach)
    // المسار: /api/branches/{branchId}/societies/{societyId}
    detachFromBranch: (branchId, societyId) => 
        deleteData(`/branches/${branchId}/societies/${societyId}`)
};