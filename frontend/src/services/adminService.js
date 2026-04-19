import { getData, patchData } from '../api/apiMethods';

export const adminService = {
  // 1. جلب مدراء الفروع (Branch Admins) حسب الحالة (pending, active, suspended)
  // هاد بيطابق مسار: /users?role=Branch Admin&status=Active
  getBranchAdmins: (status) => 
    getData(`/users?role=Branch Admin&status=${status}`),

  // 2. تحديث حالة المدير (Approve, Reject, Suspend, Reactivate)
  updateAdminStatus: (userId, newStatus) => 
    patchData(`/users/${userId}/status`, { status: newStatus }),

  // 🌟 3. جلب بيانات الداشبورد (الإحصائيات والشارتات)
  // هاد بيطابق مسار: /admin/stats
  getDashboardStats: () => 
    getData('/admin/stats'), 
};