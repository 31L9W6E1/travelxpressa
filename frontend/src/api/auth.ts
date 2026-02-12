import api, { type ApiResponse, setTokens, clearTokens, handleApiError } from './client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'AGENT';
  phone?: string;
  country?: string;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name?: string;
}

// Auth API functions
export const authApi = {
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/api/auth/login', credentials);
      const { accessToken, refreshToken, user } = response.data.data!;
      setTokens(accessToken, refreshToken ?? null);
      return user;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async register(credentials: RegisterCredentials): Promise<User> {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/api/auth/register', credentials);
      const { accessToken, refreshToken, user } = response.data.data!;
      setTokens(accessToken, refreshToken ?? null);
      return user;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post('/api/auth/logout');
    } catch {
      // Ignore errors on logout
    } finally {
      clearTokens();
    }
  },

  async logoutAll(): Promise<void> {
    try {
      await api.post('/api/auth/logout-all');
    } catch {
      // Ignore errors
    } finally {
      clearTokens();
    }
  },

  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get<ApiResponse<{ user: User }>>('/api/auth/me');
      return response.data.data!.user;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async updateProfile(data: Partial<Pick<User, 'name' | 'phone' | 'country'>>): Promise<User> {
    try {
      const response = await api.patch<ApiResponse<{ user: User }>>('/api/auth/me', data);
      return response.data.data!.user;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await api.post('/api/auth/change-password', { currentPassword, newPassword });
      clearTokens();
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async refreshToken(): Promise<void> {
    try {
      const response = await api.post<ApiResponse<{ accessToken: string; refreshToken?: string }>>('/api/auth/refresh');
      const { accessToken, refreshToken } = response.data.data!;
      setTokens(accessToken, refreshToken ?? null);
    } catch (error) {
      clearTokens();
      throw handleApiError(error);
    }
  },

  async forgotPassword(email: string): Promise<void> {
    try {
      await api.post('/api/auth/forgot-password', { email });
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await api.post('/api/auth/reset-password', { token, newPassword });
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

export default authApi;
