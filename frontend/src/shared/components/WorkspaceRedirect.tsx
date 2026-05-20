import type React from 'react';
import { Navigate } from 'react-router-dom';
import { useWorkspaces } from '@/modules/workspaces/application/use-workspaces';
import { useActiveWorkspace } from '@/modules/workspaces/application/use-active-workspace';

export function WorkspaceRedirect(): React.ReactElement {
    const { data: workspaces, isLoading } = useWorkspaces();
    const activeWorkspace = useActiveWorkspace();

    if (isLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-canvas">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent-primary border-t-transparent" />
            </div>
        );
    }

    if (activeWorkspace?.slug) {
        return <Navigate to={`/${activeWorkspace.slug}/home`} replace />;
    }

    if (workspaces?.items && workspaces.items.length > 0) {
        return <Navigate to={`/${workspaces.items[0].slug}/home`} replace />;
    }

    return <Navigate to="/workspaces" replace />;
}
