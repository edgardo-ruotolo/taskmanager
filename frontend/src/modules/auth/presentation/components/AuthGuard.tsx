import type React from 'react';
import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../application/auth-store';
import { authRepository } from '../../infrastructure/auth-repository';
import { getOnboardingState } from '../../application/onboarding-state';

const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

export const AuthGuard = (): React.ReactElement => {
    const { isAuthenticated, user, setUser, clearAuth } = useAuthStore();
    const [checked, setChecked] = useState(false);
    const location = useLocation();

    useEffect(() => {
        if (!isAuthenticated) {
            setChecked(true);
            return;
        }
        if (user?.roles !== undefined) {
            setChecked(true);
            return;
        }
        authRepository.me()
            .then((fresh) => { setUser(fresh); })
            .catch(() => { clearAuth(); })
            .finally(() => { setChecked(true); });
    }, [isAuthenticated, user?.roles, setUser, clearAuth]);

    if (!checked) return null as unknown as React.ReactElement;
    if (!isAuthenticated) return <Navigate to="/login" replace />;

    const isOnboardingRoute = location.pathname === '/onboarding';
    const isAuthRoute = AUTH_ROUTES.some((r) => location.pathname.startsWith(r));

    if (!isOnboardingRoute && !isAuthRoute) {
        const onboardingState = getOnboardingState();
        if (!onboardingState.hasCompletedOnboarding) {
            return <Navigate to="/onboarding" replace />;
        }
    }

    return <Outlet />;
};
