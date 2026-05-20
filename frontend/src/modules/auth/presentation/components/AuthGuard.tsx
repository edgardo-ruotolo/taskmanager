import type React from 'react';
import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../application/auth-store';
import { useAuthMe, setAuthSession } from '../../application/use-auth-me';
import { getOnboardingState, saveOnboardingState } from '../../application/onboarding-state';
import { workspaceRepository } from '@/modules/workspaces/infrastructure/workspace-repository';

const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

type OnboardingStatus = 'checking' | 'done' | 'needed';

export const AuthGuard = (): React.ReactElement => {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const { data: user, isLoading, isError } = useAuthMe();
    const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus>(
        () => (getOnboardingState().hasCompletedOnboarding ? 'done' : 'checking'),
    );
    const location = useLocation();

    useEffect(() => {
        if (isError) {
            setAuthSession(null);
        }
    }, [isError]);

    useEffect(() => {
        if (!isAuthenticated || !user || onboardingStatus !== 'checking') return;

        workspaceRepository.getAll()
            .then((result) => {
                if (result.items.length > 0) {
                    saveOnboardingState({
                        hasCompletedOnboarding: true,
                        completedSteps: ['welcome', 'profile', 'workspace', 'invite'],
                        currentStep: 'done',
                    });
                    setOnboardingStatus('done');
                } else {
                    setOnboardingStatus('needed');
                }
            })
            .catch(() => { setOnboardingStatus('needed'); });
    }, [isAuthenticated, user, onboardingStatus]);

    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (isLoading || !user) return null as unknown as React.ReactElement;
    if (onboardingStatus === 'checking') return null as unknown as React.ReactElement;

    const isOnboardingRoute = location.pathname === '/onboarding';
    const isAuthRoute = AUTH_ROUTES.some((r) => location.pathname.startsWith(r));

    if (!isOnboardingRoute && !isAuthRoute && onboardingStatus === 'needed') {
        return <Navigate to="/onboarding" replace />;
    }

    return <Outlet />;
};
