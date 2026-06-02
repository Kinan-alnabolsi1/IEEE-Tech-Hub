import { getData, postData, updateData, deleteData, patchData } from '../api/apiMethods';

export const branchService = {
  getAll: () => getData('/branches'),
  
  getById: (id) => getData(`/branches/${id}`),

  create: (data) => postData('/branches', data),
  update: (id, data) => updateData(`/branches/${id}`, data),
  delete: (id) => deleteData(`/branches/${id}`),
  
  toggleStatus: async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    return patchData(`/branches/${id}/status`, { status: newStatus });
  },
  
  getAttachedSocieties: (branchId) => getData(`/branches/${branchId}/societies`),

  detachSociety: (branchId, societyId) => deleteData(`/branches/${branchId}/societies/${societyId}`),
};