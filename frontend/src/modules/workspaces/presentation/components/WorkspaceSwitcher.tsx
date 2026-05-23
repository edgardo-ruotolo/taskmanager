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
import { useActiveWorkspace } from '@/modules/workspaces/application/use-active-workspace';

function WorkspaceLogo({ name }: { name: string }): React.ReactElement {
    const initial = name.charAt(0).toUpperCase();
    return (
        <div className="w-[22px] h-[22px] rounded-sm bg-[var(--neutral-1200)] flex items-center justify-center shrink-0 border border-subtle">
            <span className="text-[#f0eadf] text-[11px] font-bold">{initial}</span>
        </div>
    );
}

export function WorkspaceSwitcher(): React.ReactElement {
    const { workspaceSlug } = useParams<{ workspaceSlug: string }>();
    const { data: workspaces } = useWorkspaces();
    const activeWorkspace = useActiveWorkspace();
    const navigate = useNavigate();

    const displayName = activeWorkspace?.name ?? workspaceSlug ?? 'Workspace';

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className="group/menu-button flex items-center gap-2 rounded-md px-2 py-1.5 bg-white border border-[var(--neutral-400)] hover:bg-[var(--neutral-100)] focus:outline-none transition-all duration-150 flex-1 min-w-0 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                    aria-label="Cambiar workspace"
                >
                    <WorkspaceLogo name={displayName} />
                    <div className="flex-1 min-w-0 text-left">
                        <div className="truncate text-[12.5px] font-medium text-[var(--neutral-1200)] leading-none tracking-[-0.01em]">
                            {displayName}
                        </div>
                        <div className="font-mono text-[9.5px] text-[var(--neutral-600)] tracking-[0.08em] uppercase mt-1 leading-none">
                            BUSINESS
                        </div>
                    </div>
                    <ChevronDown size={12} className="text-[var(--neutral-600)] shrink-0" aria-hidden="true" />
                </button>
            </PopoverTrigger>
            <PopoverContent align="start" sideOffset={8} className="w-72 p-0 bg-white border border-[var(--neutral-400)] shadow-overlay-100 rounded-lg overflow-hidden">
                <div className="px-4 pt-3 pb-2 text-[10.5px] font-mono font-medium text-[var(--neutral-600)] tracking-[0.14em] uppercase border-b border-[var(--neutral-300)]">
                    Workspaces
                </div>
                <div className="flex flex-col items-start p-1">
                    {workspaces?.items.map((ws) => (
                        <button
                            key={ws.id}
                            type="button"
                            onClick={() => void navigate(`/${ws.slug}/projects`)}
                            className={cn(
                                'flex items-center gap-2.5 w-full px-3 py-2 text-[13px] rounded-md transition-colors duration-150',
                                ws.slug === workspaceSlug
                                    ? 'bg-[var(--neutral-200)] text-[var(--neutral-1200)] font-medium'
                                    : 'text-[var(--neutral-1100)] hover:bg-[var(--neutral-100)] hover:text-[var(--neutral-1200)]',
                            )}
                        >
                            <WorkspaceLogo name={ws.name} />
                            <span className="flex-1 truncate text-left">{ws.name}</span>
                            {ws.slug === workspaceSlug && (
                                <Check size={14} className="text-[var(--brand-700)]" aria-hidden="true" />
                            )}
                        </button>
                    ))}
                </div>
                <div className="border-t border-[var(--neutral-300)] p-1">
                    <button
                        type="button"
                        onClick={() => void navigate('/')}
                        className="flex items-center gap-2 w-full px-3 py-2 text-[13px] font-medium text-[var(--neutral-1100)] rounded-md hover:bg-[var(--neutral-100)] hover:text-[var(--neutral-1200)] transition-colors duration-150"
                    >
                        <Plus size={14} aria-hidden="true" />
                        Nuevo workspace
                    </button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
