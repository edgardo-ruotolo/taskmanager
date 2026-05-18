import axios from 'axios';
import { toast } from 'sonner';
import { useAuthStore } from '@/modules/auth/application/auth-store';

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000',
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
        if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            if (status === 401) {
                useAuthStore.getState().clearAuth();
                window.location.href = '/login';
                return Promise.reject(error);
            }
            if (status === 403) {
                toast.error('No tienes permisos para realizar esta acción.');
            } else if (status != null && status >= 500) {
                toast.error('Error del servidor. Intenta de nuevo.');
            }
        }
        return Promise.reject(error);
    },
);
