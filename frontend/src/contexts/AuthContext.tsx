import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi, type User } from '../api/auth';
import { getAccessToken, clearTokens } from '../api/client';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, name?: string) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const initialToken = getAccessToken();

      try {
        // If we don't have an access token (e.g., first visit on a different subdomain),
        // attempt a cookie-based refresh. This keeps sessions stable across
        // travelxpressa.com <-> www.travelxpressa.com when refreshToken uses `.travelxpressa.com`.
        if (!getAccessToken()) {
          try {
            await authApi.refreshToken();
          } catch {
            // Ignore refresh failures (guest session)
          }
        }

        if (getAccessToken()) {
          const currentUser = await authApi.getCurrentUser();
          setUser(currentUser);
        }
      } catch {
        // Avoid clearing a newer token created by a concurrent login action.
        if (getAccessToken() === initialToken) {
          clearTokens();
        }
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    const loggedInUser = await authApi.login({ email, password });
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const register = useCallback(async (email: string, password: string, name?: string): Promise<User> => {
    const newUser = await authApi.register({ email, password, name });
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const updateUser = useCallback((data: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : null));
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
      clearTokens();
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
