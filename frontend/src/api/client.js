import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
// Token storage
let accessToken = null;
let refreshToken = null;
// Load tokens from localStorage on init
if (typeof window !== 'undefined') {
    accessToken = localStorage.getItem('accessToken');
    refreshToken = localStorage.getItem('refreshToken');
}
// Token management
export const setTokens = (access, refresh) => {
    accessToken = access;
    localStorage.setItem('accessToken', access);
    if (refresh) {
        refreshToken = refresh;
        localStorage.setItem('refreshToken', refresh);
    }
};
export const clearTokens = () => {
    accessToken = null;
    refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
};
export const getAccessToken = () => accessToken;
export const getRefreshToken = () => refreshToken;
// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Enable cookies
});
// Request interceptor - add auth token
api.interceptors.request.use((config) => {
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
}, (error) => Promise.reject(error));
// Response interceptor - handle token refresh
let isRefreshing = false;
let failedQueue = [];
const processQueue = (error, token = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        }
        else {
            resolve(token);
        }
    });
    failedQueue = [];
};
api.interceptors.response.use((response) => response, async (error) => {
    const originalRequest = error.config;
    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry && refreshToken) {
        if (isRefreshing) {
            // Wait for the refresh to complete
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return api(originalRequest);
            });
        }
        originalRequest._retry = true;
        isRefreshing = true;
        try {
            const response = await axios.post(`${API_URL}/api/auth/refresh`, {
                refreshToken,
            });
            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;
            setTokens(newAccessToken, newRefreshToken);
            processQueue(null, newAccessToken);
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
        }
        catch (refreshError) {
            processQueue(refreshError, null);
            clearTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
        }
        finally {
            isRefreshing = false;
        }
    }
    return Promise.reject(error);
});
// API error handler
export class ApiError extends Error {
    statusCode;
    code;
    errors;
    constructor(message, statusCode, code, errors) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.errors = errors;
    }
}
export const handleApiError = (error) => {
    if (axios.isAxiosError(error)) {
        const response = error.response?.data;
        return new ApiError(response?.error || error.message || 'An error occurred', error.response?.status || 500, response?.code, response?.errors);
    }
    if (error instanceof Error) {
        return new ApiError(error.message, 500);
    }
    return new ApiError('An unexpected error occurred', 500);
};
export default api;
