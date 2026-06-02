import { getData } from '../api/apiMethods';

export const taskService = {
  getProjectTasks: (projectId) => {
    return getData(`/tasks?project_id=${projectId}`);
  }
};