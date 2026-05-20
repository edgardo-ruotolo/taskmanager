import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Auth store holds only the authenticated flag. The user profile lives
 * exclusively in the TanStack Query cache under `authMeKey` to avoid the
 * stale-duplication problem of mirroring server data into client state.
 *
 * Use `useAuthMe()` to read the current user, and `setAuthSession()` to
 * mutate both the flag and the cache atomically.
 */
interface AuthState {
    isAuthenticated: boolean;
    setAuthenticated: (value: boolean) => void;
    clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            isAuthenticated: false,
            setAuthenticated: (value) => set({ isAuthenticated: value }),
            clearAuth: () => set({ isAuthenticated: false }),
        }),
        {
            name: 'taskmanager-auth',
            // Only persist the flag — the user profile must be re-fetched on reload.
            partialize: (state) => ({ isAuthenticated: state.isAuthenticated }),
        },
    ),
);
