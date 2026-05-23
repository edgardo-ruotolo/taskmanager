import type React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuthMe } from '@/modules/auth/application/use-auth-me';
import { useProjectMembers } from '@/modules/projects/application/use-projects';

export const ProjectAdminGuard = ({ children }: { children: React.ReactNode }): React.ReactElement => {
    const { workspaceSlug = '', projectId = '' } = useParams<{ workspaceSlug?: string; projectId?: string }>();
    const { data: user, isLoading: loadingUser } = useAuthMe();
    const { data: members, isLoading: loadingMembers } = useProjectMembers(workspaceSlug, projectId);

    if (loadingUser || loadingMembers) return null as unknown as React.ReactElement;
    if (!user) return <Navigate to="/login" replace />;
    if (user.isSuperAdmin) return <>{children}</>;

    const me = members?.find((m) => m.userId === user.id);
    if (me?.role === 'Admin') return <>{children}</>;
    return <Navigate to="/" replace />;
};
