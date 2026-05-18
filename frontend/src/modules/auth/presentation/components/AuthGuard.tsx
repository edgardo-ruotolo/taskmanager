import type React from 'react';
import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../application/auth-store';
import { authRepository } from '../../infrastructure/auth-repository';

export const AuthGuard = (): React.ReactElement => {
    const { isAuthenticated, user, setUser, clearAuth } = useAuthStore();
    const [checked, setChecked] = useState(false);

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
    return <Outlet />;
};
