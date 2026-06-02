import { getData } from '../api/apiMethods';

export const getSuperAdminStats = () => {
  return getData('/admin/stats');
};

export const getChapterStats = (chapterId) => {
  return getData(`/chapters/${chapterId}/stats`);
};