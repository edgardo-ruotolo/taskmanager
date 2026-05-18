import type React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, ChevronDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { useWorkspaces } from '@/modules/workspaces/application/use-workspaces';
import { useWorkspaceStore } from '@/modules/workspaces/application/workspace-store';

function WorkspaceLogo({ name }: { name: string }): React.ReactElement {
    const initial = name.charAt(0).toUpperCase();
    return (
        <div className="w-7 h-7 rounded-md bg-accent-primary flex items-center justify-center shrink-0 border border-subtle">
            <span className="text-on-color text-[11px] font-bold">{initial}</span>
        </div>
    );
}

export function WorkspaceSwitcher(): React.ReactElement {
    const { workspaceSlug } = useParams<{ workspaceSlug: string }>();
    const { data: workspaces } = useWorkspaces();
    const { activeWorkspace } = useWorkspaceStore();
    const navigate = useNavigate();

    const displayName = activeWorkspace?.name ?? workspaceSlug ?? 'Workspace';

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className="group/menu-button flex items-center gap-2 rounded-sm p-1 text-secondary hover:bg-layer-1 focus:outline-none transition-colors duration-150 max-w-[200px]"
                    aria-label="Cambiar workspace"
                >
                    <WorkspaceLogo name={displayName} />
                    <span className="truncate text-[14px] font-medium text-primary">{displayName}</span>
                    <ChevronDown size={16} className="text-placeholder shrink-0" aria-hidden="true" />
                </button>
            </PopoverTrigger>
            <PopoverContent align="start" sideOffset={4} className="w-72 p-0 bg-surface-1 border border-strong shadow-raised-200">
                <div className="px-4 pt-3 pb-1 text-[13px] font-medium text-placeholder">
                    {/* user email placeholder */}
                    Workspaces
                </div>
                <div className="flex flex-col items-start">
                    {workspaces?.items.map((ws) => (
                        <button
                            key={ws.id}
                            type="button"
                            onClick={() => void navigate(`/${ws.slug}/companies`)}
                            className={cn(
                                'flex items-center gap-2.5 w-full px-3 py-2 text-[13px] transition-colors duration-150',
                                ws.slug === workspaceSlug
                                    ? 'bg-accent-subtle text-accent-primary'
                                    : 'text-secondary hover:bg-layer-transparent-hover hover:text-primary',
                            )}
                        >
                            <WorkspaceLogo name={ws.name} />
                            <span className="flex-1 truncate text-left font-medium">{ws.name}</span>
                            {ws.slug === workspaceSlug && (
                                <Check size={14} aria-hidden="true" />
                            )}
                        </button>
                    ))}
                </div>
                <div className="border-t border-subtle px-4 py-2 flex flex-col gap-1">
                    <button
                        type="button"
                        onClick={() => void navigate('/')}
                        className="flex items-center gap-2 w-full px-2 py-1 text-[13px] font-medium text-secondary rounded-sm hover:bg-layer-transparent-hover transition-colors duration-150"
                    >
                        <Plus size={14} aria-hidden="true" />
                        Nuevo workspace
                    </button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
