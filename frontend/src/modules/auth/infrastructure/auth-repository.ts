import { apiClient } from '@/shared/lib/api-client';
import type { User } from '../domain/types';

export interface RegisterData {
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export const authRepository = {
    register: (data: RegisterData): Promise<User> =>
        apiClient.post<User>('/api/auth/register', data).then((r) => r.data),
    login: (data: LoginData): Promise<User> =>
        apiClient.post<User>('/api/auth/login', data).then((r) => r.data),
    logout: (): Promise<void> =>
        apiClient.post('/api/auth/logout').then(() => undefined),
    me: (): Promise<User> =>
        apiClient.get<User>('/api/auth/me').then((r) => r.data),
    forgotPassword: (email: string): Promise<void> =>
        apiClient.post('/api/auth/forgot-password', { email }).then(() => undefined),
    resetPassword: (data: { email: string; token: string; newPassword: string }): Promise<void> =>
        apiClient.post('/api/auth/reset-password', data).then(() => undefined),
    updateProfile: (data: {
        firstName?: string;
        lastName?: string;
        displayName?: string;
        avatarUrl?: string;
    }): Promise<User> =>
        apiClient.put<User>('/api/auth/profile', data).then((r) => r.data),
    changePassword: (data: { currentPassword: string; newPassword: string }): Promise<void> =>
        apiClient.post('/api/auth/change-password', data).then(() => undefined),
    deactivateAccount: (): Promise<void> =>
        apiClient.delete('/api/auth/me').then(() => undefined),
    sendMagicLink: (email: string): Promise<void> =>
        apiClient.post('/api/auth/magic-link', { email }).then(() => undefined),
    verifyMagicLink: (token: string): Promise<User> =>
        apiClient.post<User>('/api/auth/magic-link/verify', { token }).then((r) => r.data),
    getOAuthUrl: (provider: 'google' | 'github'): Promise<{ url: string; message: string }> =>
        apiClient
            .get<{ url: string; message: string }>(`/api/auth/oauth/${provider}/authorize`)
            .then((r) => r.data),
};
