import type React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/modules/auth/application/auth-store';

export const AdminGuard = ({ children }: { children: React.ReactNode }): React.ReactElement => {
    const user = useAuthStore((s) => s.user);
    if (!user) return <Navigate to="/login" replace />;
    if (!user.roles?.includes('Admin')) return <Navigate to="/" replace />;
    return <>{children}</>;
};
