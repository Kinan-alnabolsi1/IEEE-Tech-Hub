import { getData, patchData } from '../api/apiMethods';

export const adminService = {
  // 1. جلب مدراء الفروع (Branch Admins) حسب الحالة (pending, active, suspended)
  // هاد بيطابق مسار: /users?role=Branch Admin&status=Active
  getBranchAdmins: (status) => 
    getData(`/users?role=Branch Admin&status=${status}`),

  // 2. تحديث حالة المدير (Approve, Reject, Suspend, Reactivate)
  updateAdminStatus: (userId, newStatus) => 
    patchData(`/users/${userId}/status`, { status: newStatus }),

  // 🌟 3. جلب بيانات الداشبورد العامة (للسوبر أدمن فقط)
  // هاد بيطابق مسار: /admin/stats
  getDashboardStats: () => 
    getData('/admin/stats'),

  // 🌟 4. جلب إحصائيات فرع معين (خاص لمدير الفرع - الـ Dashboard الجديد)
  // هاد بيطابق مسار: /branches/{branch_id}/stats
  getBranchDashboardStats: (branchId) => 
    getData(`/branches/${branchId}/stats`),
};