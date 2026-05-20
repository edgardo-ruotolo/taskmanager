import { useQuery } from '@tanstack/react-query';
import { authRepository } from '../infrastructure/auth-repository';
import type { User } from '../domain/types';
import { useAuthStore } from './auth-store';
import { queryClient } from '@/shared/lib/query-client';

export const authMeKey = ['auth', 'me'] as const;

export const useAuthMe = () => {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    return useQuery({
        queryKey: authMeKey,
        queryFn: () => authRepository.me(),
        enabled: isAuthenticated,
        // Session profile: avoid refetching constantly but always validate
        // on window focus (e.g., after returning from password change).
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: true,
    });
};

/**
 * Sets the authenticated session by:
 *  - flipping the auth flag in the (persisted) Zustand store
 *  - seeding the User into the TanStack Query cache as the single source of truth
 */
export const setAuthSession = (user: User | null): void => {
    if (user === null) {
        useAuthStore.getState().clearAuth();
        queryClient.removeQueries({ queryKey: authMeKey });
        return;
    }
    useAuthStore.getState().setAuthenticated(true);
    queryClient.setQueryData<User>(authMeKey, user);
};

/** Returns the current user synchronously from the cache (or null if missing). */
export const getCurrentUser = (): User | null =>
    queryClient.getQueryData<User>(authMeKey) ?? null;
