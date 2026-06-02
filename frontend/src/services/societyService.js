import { getData, postData, putData, deleteData } from '../api/apiMethods';

export const societyService = {

    getAll: (status = '') => {
        const query = status ? `?status=${status}` : '';
        return getData(`/societies${query}`);
    },

    getById: (id) => getData(`/societies/${id}`),

    create: (data) => postData('/societies', data),

    update: (id, data) => putData(`/societies/${id}`, data),

    delete: (id) => deleteData(`/societies/${id}`),


    attachToBranch: (branchId, societyIds) => 
        postData(`/branches/${branchId}/societies`, { society_ids: societyIds }),

    detachFromBranch: (branchId, societyId) => 
        deleteData(`/branches/${branchId}/societies/${societyId}`)
};