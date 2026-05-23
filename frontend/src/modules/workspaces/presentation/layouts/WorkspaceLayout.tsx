import { useEffect } from 'react';
import type React from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { useWorkspaceStore } from '@/modules/workspaces/application/workspace-store';
import { useWorkspaces } from '@/modules/workspaces/application/use-workspaces';
import { useSidebarStore } from '@/modules/workspaces/application/sidebar-store';
import { CommandPalette } from '@/shared/components/CommandPalette';
import { TopNavigation } from '../components/TopNavigation';
import { PrimarySidebar } from '../components/PrimarySidebar';
import { Sheet, SheetContent } from '@/components/ui/sheet';

export const WorkspaceLayout = (): React.ReactElement => {
    const { workspaceSlug, projectId } = useParams<{
        workspaceSlug: string;
        projectId?: string;
    }>();
    const { setActiveWorkspace, setActiveProjectId } = useWorkspaceStore();
    const { data: workspaces } = useWorkspaces();

    useEffect(() => {
        if (workspaces && workspaceSlug) {
            const found = workspaces.items.find((w) => w.slug === workspaceSlug) ?? null;
            setActiveWorkspace(found);
        }
    }, [workspaces, workspaceSlug, setActiveWorkspace]);

    useEffect(() => {
        setActiveProjectId(projectId ?? null);
    }, [projectId, setActiveProjectId]);

    const { mobileSidebarOpen, setMobileSidebarOpen } = useSidebarStore();

    return (
        <div className="relative flex h-screen w-full overflow-hidden bg-canvas">
            {/* Skip link for keyboard users */}
            <a
                href="#main"
                className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-accent-primary focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-on-color focus:outline-none focus:ring-2 focus:ring-accent-strong"
            >
                Saltar al contenido principal
            </a>
            {/* Primary sidebar — Desktop only */}
            <div className="hidden lg:flex h-full">
                <PrimarySidebar />
            </div>

            {/* Mobile sidebar Sheet */}
            <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
                <SheetContent side="left" className="p-0 w-auto border-r-0">
                    <PrimarySidebar />
                </SheetContent>
            </Sheet>

            {/* Main view container */}
            <div className="relative flex flex-1 flex-col overflow-hidden min-w-0">
                {/* Topbar / Breadcrumbs */}
                <TopNavigation />

                {/* Content area */}
                <div className="relative flex flex-1 overflow-hidden">
                    {/* Main content */}
                    <main
                        id="main"
                        tabIndex={-1}
                        className="relative flex h-full flex-1 flex-col overflow-hidden bg-canvas min-w-0 focus:outline-none"
                    >
                        <div className="flex-1 overflow-auto">
                            <Outlet />
                        </div>
                    </main>
                </div>
            </div>

            <CommandPalette />
        </div>
    );
};
