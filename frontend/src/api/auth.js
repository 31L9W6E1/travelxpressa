import api, { setTokens, clearTokens, handleApiError } from './client';
// Auth API functions
export const authApi = {
    async login(credentials) {
        try {
            const response = await api.post('/api/auth/login', credentials);
            const { accessToken, refreshToken, user } = response.data.data;
            setTokens(accessToken, refreshToken);
            return user;
        }
        catch (error) {
            throw handleApiError(error);
        }
    },
    async register(credentials) {
        try {
            const response = await api.post('/api/auth/register', credentials);
            const { accessToken, refreshToken, user } = response.data.data;
            setTokens(accessToken, refreshToken);
            return user;
        }
        catch (error) {
            throw handleApiError(error);
        }
    },
    async logout() {
        try {
            await api.post('/api/auth/logout');
        }
        catch {
            // Ignore errors on logout
        }
        finally {
            clearTokens();
        }
    },
    async logoutAll() {
        try {
            await api.post('/api/auth/logout-all');
        }
        catch {
            // Ignore errors
        }
        finally {
            clearTokens();
        }
    },
    async getCurrentUser() {
        try {
            const response = await api.get('/api/auth/me');
            return response.data.data.user;
        }
        catch (error) {
            throw handleApiError(error);
        }
    },
    async updateProfile(data) {
        try {
            const response = await api.patch('/api/auth/me', data);
            return response.data.data.user;
        }
        catch (error) {
            throw handleApiError(error);
        }
    },
    async changePassword(currentPassword, newPassword) {
        try {
            await api.post('/api/auth/change-password', { currentPassword, newPassword });
            clearTokens();
        }
        catch (error) {
            throw handleApiError(error);
        }
    },
    async refreshToken() {
        try {
            const response = await api.post('/api/auth/refresh');
            const { accessToken, refreshToken } = response.data.data;
            setTokens(accessToken, refreshToken);
        }
        catch (error) {
            clearTokens();
            throw handleApiError(error);
        }
    },
};
export default authApi;
