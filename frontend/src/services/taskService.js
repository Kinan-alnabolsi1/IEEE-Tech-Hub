// src/services/taskService.js
import { getData } from '../api/apiMethods';

export const taskService = {
  // جلب مهام مشروع محدد بناءً على الـ API الخاص بكِ
  getProjectTasks: (projectId) => {
    return getData(`/tasks?project_id=${projectId}`);
  }
};