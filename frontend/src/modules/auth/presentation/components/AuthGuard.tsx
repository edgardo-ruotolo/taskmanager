import type React from 'react';
import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../application/auth-store';
import { useAuthMe, setAuthSession } from '../../application/use-auth-me';

const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

export const AuthGuard = (): React.ReactElement => {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const { data: user, isLoading, isError } = useAuthMe();
    const location = useLocation();

    useEffect(() => {
        if (isError) {
            setAuthSession(null);
        }
    }, [isError]);

    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (isLoading || !user) return null as unknown as React.ReactElement;

    // Backend is the single source of truth: onboardingCompletedAt set means onboarding is done.
    const onboardingDone = user.onboardingCompletedAt !== null;

    const isOnboardingRoute = location.pathname === '/onboarding';
    const isAuthRoute = AUTH_ROUTES.some((r) => location.pathname.startsWith(r));

    if (!isOnboardingRoute && !isAuthRoute && !onboardingDone) {
        return <Navigate to="/onboarding" replace />;
    }

    return <Outlet />;
};
