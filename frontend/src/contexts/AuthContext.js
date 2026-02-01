import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '../api/auth';
import { getAccessToken, clearTokens } from '../api/client';
const AuthContext = createContext(undefined);
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const isAuthenticated = !!user;
    // Initialize auth state
    useEffect(() => {
        const initAuth = async () => {
            const token = getAccessToken();
            if (token) {
                try {
                    const currentUser = await authApi.getCurrentUser();
                    setUser(currentUser);
                }
                catch {
                    clearTokens();
                }
            }
            setIsLoading(false);
        };
        initAuth();
    }, []);
    const login = useCallback(async (email, password) => {
        const loggedInUser = await authApi.login({ email, password });
        setUser(loggedInUser);
        return loggedInUser;
    }, []);
    const register = useCallback(async (email, password, name) => {
        const newUser = await authApi.register({ email, password, name });
        setUser(newUser);
        return newUser;
    }, []);
    const logout = useCallback(async () => {
        await authApi.logout();
        setUser(null);
    }, []);
    const updateUser = useCallback((data) => {
        setUser((prev) => (prev ? { ...prev, ...data } : null));
    }, []);
    const refreshUser = useCallback(async () => {
        try {
            const currentUser = await authApi.getCurrentUser();
            setUser(currentUser);
        }
        catch {
            setUser(null);
            clearTokens();
        }
    }, []);
    return (_jsx(AuthContext.Provider, { value: {
            user,
            isLoading,
            isAuthenticated,
            login,
            register,
            logout,
            updateUser,
            refreshUser,
        }, children: children }));
};
