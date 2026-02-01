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
export declare const authApi: {
    login(credentials: LoginCredentials): Promise<User>;
    register(credentials: RegisterCredentials): Promise<User>;
    logout(): Promise<void>;
    logoutAll(): Promise<void>;
    getCurrentUser(): Promise<User>;
    updateProfile(data: Partial<Pick<User, "name" | "phone" | "country">>): Promise<User>;
    changePassword(currentPassword: string, newPassword: string): Promise<void>;
    refreshToken(): Promise<void>;
};
export default authApi;
