import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const resolveApiUrl = (): string => {
  const configuredApiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  if (configuredApiUrl) {
    return configuredApiUrl.replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined') {
    const runtimeApiUrl = (window as any).__API_URL__ as string | undefined;
    if (runtimeApiUrl && runtimeApiUrl.trim()) {
      return runtimeApiUrl.trim().replace(/\/+$/, '');
    }
    const { hostname, port, protocol, origin } = window.location;
    const isTravelxpressaDomain =
      hostname === 'travelxpressa.com' || hostname === 'www.travelxpressa.com';
    const isLocalHost =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0';

    // Local Vite dev fallback
    if (isLocalHost && port === '5173') {
      return `${protocol}//${hostname}:3000`;
    }

    // Prefer same-origin for our custom domain so Vercel rewrites can proxy /api and /uploads.
    if (isTravelxpressaDomain) {
      return origin;
    }

    // Production/default same-origin fallback
    return origin;
  }

  return 'http://localhost:3000';
};

const API_URL = resolveApiUrl();
export const getApiBaseUrl = () => API_URL;

// Token storage
let accessToken: string | null = null;
let refreshToken: string | null = null;

// Load tokens from localStorage on init
if (typeof window !== 'undefined') {
  accessToken = localStorage.getItem('accessToken');
  refreshToken = localStorage.getItem('refreshToken');
}

// Token management
export const setTokens = (access: string, refresh?: string) => {
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

const isHtmlPayload = (payload: unknown): boolean => {
  if (typeof payload !== 'string') return false;
  const head = payload.trim().slice(0, 200).toLowerCase();
  return head.startsWith('<!doctype') || head.startsWith('<html');
};

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable cookies
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    if (isHtmlPayload(response.data)) {
      return Promise.reject(
        new Error('API returned HTML. Check VITE_API_URL or your /api proxy configuration.')
      );
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

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
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API error handler
export class ApiError extends Error {
  public statusCode: number;
  public code?: string;
  public errors?: Array<{ field: string; message: string }>;

  constructor(message: string, statusCode: number, code?: string, errors?: Array<{ field: string; message: string }>) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
  }
}

export const handleApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const response = error.response?.data as ApiResponse;
    return new ApiError(
      response?.error || response?.message || error.message || 'An error occurred',
      error.response?.status || 500,
      (response as any)?.code,
      response?.errors
    );
  }
  if (error instanceof Error) {
    return new ApiError(error.message, 500);
  }
  return new ApiError('An unexpected error occurred', 500);
};

export default api;
