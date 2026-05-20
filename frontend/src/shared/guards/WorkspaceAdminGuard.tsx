import type React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuthMe } from '@/modules/auth/application/use-auth-me';
import { useWorkspaceMembers } from '@/modules/workspaces/application/use-workspaces';

export const WorkspaceAdminGuard = ({ children }: { children: React.ReactNode }): React.ReactElement => {
    const { workspaceSlug = '' } = useParams<{ workspaceSlug?: string }>();
    const { data: user, isLoading: loadingUser } = useAuthMe();
    const { data: members, isLoading: loadingMembers } = useWorkspaceMembers(workspaceSlug);

    if (loadingUser || loadingMembers) return null as unknown as React.ReactElement;
    if (!user) return <Navigate to="/login" replace />;
    if (user.isSuperAdmin) return <>{children}</>;

    const me = members?.find((m) => m.userId === user.id);
    if (me?.role === 'Admin') return <>{children}</>;
    return <Navigate to="/" replace />;
};
