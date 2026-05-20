import axios, { type InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';
import { useAuthStore } from '@/modules/auth/application/auth-store';
import { queryClient } from '@/shared/lib/query-client';

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000',
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

interface RetryableConfig extends InternalAxiosRequestConfig {
    _retried?: boolean;
}

let refreshPromise: Promise<void> | null = null;

const isAuthBypassUrl = (url: string): boolean =>
    url.includes('/auth/refresh') || url.includes('/auth/login');

export const handleAuthFailure = (): void => {
    useAuthStore.getState().clearAuth();
    queryClient.clear();
    window.dispatchEvent(new CustomEvent('auth:logout'));
};

const performRefresh = (): Promise<void> => {
    if (refreshPromise === null) {
        refreshPromise = apiClient
            .post('/api/auth/refresh')
            .then(() => undefined)
            .finally(() => {
                refreshPromise = null;
            });
    }
    return refreshPromise;
};

apiClient.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
        if (!axios.isAxiosError(error)) {
            return Promise.reject(error);
        }

        const status = error.response?.status;
        const original = error.config as RetryableConfig | undefined;
        const url = original?.url ?? '';

        if (
            status === 401 &&
            original !== undefined &&
            original._retried !== true &&
            !isAuthBypassUrl(url)
        ) {
            original._retried = true;
            try {
                await performRefresh();
                return await apiClient(original);
            } catch {
                handleAuthFailure();
                return Promise.reject(error);
            }
        }

        if (status === 401 && isAuthBypassUrl(url)) {
            return Promise.reject(error);
        }

        if (status === 403) {
            toast.error('No tienes permisos para realizar esta acción.');
        } else if (status === 429) {
            toast.error('Demasiadas solicitudes. Intenta de nuevo en unos segundos.');
        } else if (status != null && status >= 500) {
            toast.error('Error del servidor. Intenta de nuevo.');
        }

        return Promise.reject(error);
    },
);
