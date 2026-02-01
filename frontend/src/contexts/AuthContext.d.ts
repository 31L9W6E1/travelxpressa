import { type User } from '../api/auth';
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
export declare const useAuth: () => AuthContextType;
export declare const AuthProvider: ({ children }: {
    children: React.ReactNode;
}) => import("react/jsx-runtime").JSX.Element;
export {};
