import type React from 'react';
import { NavLink } from 'react-router-dom';
import {
    RotateCcw,
    LayoutList,
    BarChart2,
    Archive,
    Pin,
    PinOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/modules/workspaces/application/sidebar-store';

interface MorePanelItem {
    id: string;
    icon: React.ElementType;
    label: string;
    makeRoute: (slug: string) => string;
}

const MORE_PANEL_ITEMS: MorePanelItem[] = [
    { id: 'cycles', icon: RotateCcw, label: 'Recurrentes', makeRoute: (s) => `/${s}/companies` },
    { id: 'views', icon: LayoutList, label: 'Vistas', makeRoute: (s) => `/${s}/settings/views` },
    { id: 'analytics', icon: BarChart2, label: 'Análisis', makeRoute: (s) => `/${s}/analytics` },
    { id: 'archives', icon: Archive, label: 'Archivos', makeRoute: (s) => `/${s}/companies` },
];

interface MorePanelProps {
    workspaceSlug: string;
    onClose: () => void;
}

export function MorePanel({ workspaceSlug, onClose }: MorePanelProps): React.ReactElement {
    const { pinnedWorkspaceItems, togglePinnedItem } = useSidebarStore();

    return (
        <div className="w-64 shrink-0 flex flex-col bg-surface-2 border-r border-subtle overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="px-4 py-3 border-b border-subtle shrink-0">
                <p className="text-[12px] font-semibold text-placeholder uppercase tracking-wide">
                    Más elementos
                </p>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-2 vertical-scrollbar scrollbar-xs">
                <div className="flex flex-col gap-0.5">
                    {MORE_PANEL_ITEMS.map((item) => {
                        const isPinned = pinnedWorkspaceItems.includes(item.id);
                        const Icon = item.icon;
                        return (
                            <div
                                key={item.id}
                                className="flex items-center gap-1 px-2 py-1.5 rounded-sm hover:bg-layer-transparent-hover group transition-colors duration-150"
                            >
                                <NavLink
                                    to={item.makeRoute(workspaceSlug)}
                                    onClick={onClose}
                                    className={({ isActive }) =>
                                        cn(
                                            'flex items-center gap-2 flex-1 min-w-0',
                                            isActive ? 'text-accent-primary' : 'text-secondary',
                                        )
                                    }
                                >
                                    <Icon size={15} className="shrink-0" aria-hidden="true" />
                                    <span className="text-[13px] font-medium truncate">{item.label}</span>
                                </NavLink>

                                <button
                                    type="button"
                                    onClick={() => togglePinnedItem(item.id)}
                                    aria-label={isPinned ? 'Quitar del sidebar' : 'Fijar en sidebar'}
                                    title={isPinned ? 'Quitar del sidebar' : 'Fijar en sidebar'}
                                    className="p-1 rounded text-placeholder hover:text-primary transition-colors duration-150 shrink-0"
                                >
                                    {isPinned ? (
                                        <Pin size={13} aria-hidden="true" />
                                    ) : (
                                        <PinOff size={13} aria-hidden="true" />
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
