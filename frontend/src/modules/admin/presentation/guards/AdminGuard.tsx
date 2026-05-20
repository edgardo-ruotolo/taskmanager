import type React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthMe } from '@/modules/auth/application/use-auth-me';

export const AdminGuard = ({ children }: { children: React.ReactNode }): React.ReactElement => {
    const { data: user, isLoading } = useAuthMe();
    if (isLoading) return null as unknown as React.ReactElement;
    if (!user) return <Navigate to="/login" replace />;
    if (!user.isSuperAdmin && !user.roles?.includes('SuperAdmin')) return <Navigate to="/" replace />;
    return <>{children}</>;
};
