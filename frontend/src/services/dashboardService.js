import { getData } from '../api/apiMethods';

/**
 * جلب إحصائيات النظام للـ Super Admin
 */
export const getSuperAdminStats = () => {
  return getData('/admin/stats');
};

/**
 * جلب إحصائيات الفصل للـ Chapter Chair
 * الرابط: /chapters/{id}/stats
 */
export const getChapterStats = (chapterId) => {
  return getData(`/chapters/${chapterId}/stats`);
};