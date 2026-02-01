import api, { handleApiError } from './client';
// Applications API
export const applicationsApi = {
    async create(data) {
        try {
            const response = await api.post('/api/applications', data);
            return response.data.data;
        }
        catch (error) {
            throw handleApiError(error);
        }
    },
    async getAll(page = 1, limit = 20) {
        try {
            const response = await api.get('/api/applications', {
                params: { page, limit },
            });
            return response.data;
        }
        catch (error) {
            throw handleApiError(error);
        }
    },
    async getById(id) {
        try {
            const response = await api.get(`/api/applications/${id}`);
            return response.data.data;
        }
        catch (error) {
            throw handleApiError(error);
        }
    },
    async update(id, data) {
        try {
            const response = await api.patch(`/api/applications/${id}`, data);
            return response.data.data;
        }
        catch (error) {
            throw handleApiError(error);
        }
    },
    async submit(id) {
        try {
            const response = await api.post(`/api/applications/${id}/submit`);
            return response.data.data;
        }
        catch (error) {
            throw handleApiError(error);
        }
    },
    async delete(id) {
        try {
            await api.delete(`/api/applications/${id}`);
        }
        catch (error) {
            throw handleApiError(error);
        }
    },
};
export default applicationsApi;
