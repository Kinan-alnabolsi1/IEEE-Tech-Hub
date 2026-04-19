import { getData } from '../api/apiMethods';

/**
 * جلب إحصائيات النظام للـ Super Admin
 * الرابط: /admin/stats
 */
export const getSuperAdminStats = () => {
  return getData('/admin/stats');
};
