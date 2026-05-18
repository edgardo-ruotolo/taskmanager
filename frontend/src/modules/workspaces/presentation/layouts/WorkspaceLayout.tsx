import { useEffect, useState } from 'react';
import type React from 'react';
import { Outlet, useParams, useLocation } from 'react-router-dom';
import { useWorkspaceStore } from '@/modules/workspaces/application/workspace-store';
import { useWorkspaces } from '@/modules/workspaces/application/use-workspaces';
import { BreadcrumbBar } from '@/shared/components/BreadcrumbBar';
import { CommandPalette } from '@/shared/components/CommandPalette';
import { TopNavigation } from '../components/TopNavigation';
import { PrimarySidebar } from '../components/PrimarySidebar';
import { ExtendedSidebar } from '../components/ExtendedSidebar';
import { MorePanel } from '../components/MorePanel';

export const WorkspaceLayout = (): React.ReactElement => {
    const { workspaceSlug, companyId } = useParams<{
        workspaceSlug: string;
        companyId?: string;
    }>();
    const location = useLocation();
    const { setActiveWorkspace, setActiveCompanyId } = useWorkspaceStore();
    const { data: workspaces } = useWorkspaces();
    const [moreOpen, setMoreOpen] = useState(false);

    useEffect(() => {
        if (workspaces && workspaceSlug) {
            const found = workspaces.items.find((w) => w.slug === workspaceSlug) ?? null;
            setActiveWorkspace(found);
        }
    }, [workspaces, workspaceSlug, setActiveWorkspace]);

    useEffect(() => {
        setActiveCompanyId(companyId ?? null);
    }, [companyId, setActiveCompanyId]);

    const isSettings = location.pathname.includes('/settings');
    const resolvedCompanyId = companyId ?? null;
    const showExtended = !!resolvedCompanyId || isSettings;

    // Close More panel when navigating into a company/settings context
    useEffect(() => {
        if (showExtended) setMoreOpen(false);
    }, [showExtended]);

    return (
        <div className="relative flex h-screen w-full flex-col overflow-hidden bg-canvas">
            {/* Full-width top navigation */}
            <TopNavigation />

            {/* Content area */}
            <div className="relative flex flex-1 overflow-hidden">
                <div className="relative flex flex-1 overflow-hidden pr-2 pb-2 pl-2">
                    {/* Rounded card panel */}
                    <div className="relative flex flex-1 overflow-hidden rounded-lg border border-subtle">
                        {/* Primary sidebar */}
                        <PrimarySidebar
                            moreOpen={moreOpen}
                            onMoreToggle={() => setMoreOpen((v) => !v)}
                        />

                        {/* More panel (workspace-level extras) */}
                        {moreOpen && !showExtended && (
                            <MorePanel
                                workspaceSlug={workspaceSlug ?? ''}
                                onClose={() => setMoreOpen(false)}
                            />
                        )}

                        {/* Extended sidebar (company or settings) */}
                        {showExtended && (
                            <ExtendedSidebar
                                workspaceSlug={workspaceSlug ?? ''}
                                companyId={resolvedCompanyId}
                                isSettings={isSettings}
                            />
                        )}

                        {/* Main content */}
                        <main className="relative flex h-full flex-1 flex-col overflow-hidden bg-surface-1 min-w-0">
                            <BreadcrumbBar />
                            <div className="flex-1 overflow-auto">
                                <Outlet />
                            </div>
                        </main>
                    </div>
                </div>
            </div>

            <CommandPalette />
        </div>
    );
};
