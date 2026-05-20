import { useEffect } from 'react';
import { authRepository } from '../infrastructure/auth-repository';
import { useAuthStore } from './auth-store';
import { setAuthSession } from './use-auth-me';

const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

export const useSilentAuthRefresh = (): void => {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    useEffect(() => {
        if (!isAuthenticated) return;

        let cancelled = false;

        const refresh = async (): Promise<void> => {
            try {
                const fresh = await authRepository.me();
                if (!cancelled) setAuthSession(fresh);
            } catch {
                // 401 already handled by the api-client interceptor.
                // Other errors are transient — let the next tick retry.
            }
        };

        const interval = window.setInterval(() => { void refresh(); }, REFRESH_INTERVAL_MS);

        return () => {
            cancelled = true;
            window.clearInterval(interval);
        };
    }, [isAuthenticated]);
};
