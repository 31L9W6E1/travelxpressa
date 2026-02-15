import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const resolveApiUrl = (): string => {
  if (typeof window !== 'undefined') {
    const { hostname, port, protocol, origin } = window.location;
    const isPrimaryDomain =
      hostname === 'travelxpressa.com' ||
      hostname === 'www.travelxpressa.com' ||
      hostname === 'visamn.com' ||
      hostname === 'www.visamn.com';
    const isLocalHost =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0';
    const isVercelPreview = hostname.endsWith('.vercel.app');

    // Local Vite dev fallback
    if (isLocalHost && port === '5173') {
      return `${protocol}//${hostname}:3000`;
    }

    // Prefer same-origin for our custom domain (and Vercel preview deployments)
    // so Vercel rewrites can proxy /api and /uploads.
    //
    // This is important even when VITE_API_URL is configured, because hitting the
    // Railway backend directly makes uploaded images cross-origin and they can be
    // blocked by `Cross-Origin-Resource-Policy: same-origin`.
    if (isPrimaryDomain || isVercelPreview) {
      return origin;
    }

    const runtimeApiUrl = (window as any).__API_URL__ as string | undefined;
    if (runtimeApiUrl && runtimeApiUrl.trim()) {
      return runtimeApiUrl.trim().replace(/\/+$/, '');
    }
  }

  const configuredApiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  if (configuredApiUrl) {
    return configuredApiUrl.replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined') {
    // Production/default same-origin fallback
    return window.location.origin;
  }

  return 'http://localhost:3000';
};

const API_URL = resolveApiUrl();
export const getApiBaseUrl = () => API_URL;
const AUTH_SESSION_MARKER_KEY = 'hasAuthSession';

// Token storage
let accessToken: string | null = null;
let refreshToken: string | null = null;

// Load tokens from localStorage on init
if (typeof window !== 'undefined') {
  accessToken = localStorage.getItem('accessToken');
  refreshToken = localStorage.getItem('refreshToken');
}

// Token management
export const setTokens = (access: string, refresh?: string | null) => {
  accessToken = access;
  localStorage.setItem('accessToken', access);
  localStorage.setItem(AUTH_SESSION_MARKER_KEY, '1');

  // `refresh` handling:
  // - string: store it (dev/non-prod)
  // - null: clear any previously-stored refresh token (prod uses httpOnly cookie)
  // - undefined: leave as-is
  if (refresh === null) {
    refreshToken = null;
    localStorage.removeItem('refreshToken');
  } else if (refresh) {
    refreshToken = refresh;
    localStorage.setItem('refreshToken', refresh);
  }
};

export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem(AUTH_SESSION_MARKER_KEY);
};

export const getAccessToken = () => accessToken;
export const getRefreshToken = () => refreshToken;
export const hasStoredAuthSession = () =>
  typeof window !== 'undefined' && localStorage.getItem(AUTH_SESSION_MARKER_KEY) === '1';

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

    const canAttemptRefresh =
      error.response?.status === 401 &&
      !originalRequest._retry &&
      // Only attempt refresh when we *had* an access token (i.e., this is likely expiry vs. a guest 401).
      !!accessToken &&
      // Prefer refreshToken from localStorage in dev; production uses httpOnly cookie.
      (!!refreshToken || (typeof window !== 'undefined' && api.defaults.withCredentials));

    // If error is 401 and we haven't retried yet, try refresh token rotation.
    if (canAttemptRefresh) {
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
        const response = await axios.post(
          `${API_URL}/api/auth/refresh`,
          refreshToken ? { refreshToken } : undefined,
          { withCredentials: true }
        );

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          (response.data as any)?.data || {};
        if (!newAccessToken) {
          throw new Error('Token refresh did not return a new access token');
        }
        // In production, refresh token lives in an httpOnly cookie and won't be returned in JSON.
        setTokens(newAccessToken, newRefreshToken ?? null);

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
