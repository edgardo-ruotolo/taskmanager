import type React from 'react';
import { NavLink } from 'react-router-dom';
import {
    AlertCircle,
    GitBranch,
    BoxSelect,
    BarChart2,
    Inbox,
    Settings,
    Tag,
    Layers,
    LayoutList,
    Archive,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExtendedSidebarProps {
    workspaceSlug: string;
    companyId: string | null;
    isSettings: boolean;
}

const navLinkClass = ({ isActive }: { isActive: boolean }): string =>
    cn(
        'flex items-center gap-2 px-2 py-1.5 text-[13px] rounded transition-colors duration-150',
        isActive
            ? 'bg-accent-subtle text-accent-primary font-medium'
            : 'text-secondary hover:bg-layer-transparent-hover hover:text-primary',
    );

export function ExtendedSidebar({
    workspaceSlug,
    companyId,
    isSettings,
}: ExtendedSidebarProps): React.ReactElement | null {
    if (!companyId && !isSettings) return null;

    return (
        <div className="w-[240px] shrink-0 flex flex-col border-r border-subtle bg-surface-2 overflow-hidden">
            {/* Header */}
            <div className="px-3 py-2.5 border-b border-subtle shrink-0">
                <p className="text-[12px] font-semibold text-primary truncate">
                    {isSettings ? 'Configuración' : 'Empresa'}
                </p>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5 vertical-scrollbar scrollbar-xs">
                {companyId && !isSettings && (
                    <>
                        <NavLink
                            to={`/${workspaceSlug}/companies/${companyId}/issues`}
                            className={navLinkClass}
                        >
                            <AlertCircle size={14} aria-hidden="true" />
                            Tareas
                        </NavLink>
                        <NavLink
                            to={`/${workspaceSlug}/companies/${companyId}/cycles`}
                            className={navLinkClass}
                        >
                            <GitBranch size={14} aria-hidden="true" />
                            Ciclos
                        </NavLink>
                        <NavLink
                            to={`/${workspaceSlug}/companies/${companyId}/modules`}
                            className={navLinkClass}
                        >
                            <BoxSelect size={14} aria-hidden="true" />
                            Módulos
                        </NavLink>
                        <NavLink
                            to={`/${workspaceSlug}/companies/${companyId}/estimates`}
                            className={navLinkClass}
                        >
                            <BarChart2 size={14} aria-hidden="true" />
                            Estimaciones
                        </NavLink>
                        <NavLink
                            to={`/${workspaceSlug}/companies/${companyId}/inbox`}
                            className={navLinkClass}
                        >
                            <Inbox size={14} aria-hidden="true" />
                            Bandeja
                        </NavLink>
                        <NavLink
                            to={`/${workspaceSlug}/companies/${companyId}/archives`}
                            className={navLinkClass}
                        >
                            <Archive size={14} aria-hidden="true" />
                            Archivos
                        </NavLink>

                    </>
                )}

                {isSettings && (
                    <>
                        <NavLink
                            to={`/${workspaceSlug}/settings/states`}
                            className={navLinkClass}
                        >
                            <Settings size={14} aria-hidden="true" />
                            Estados
                        </NavLink>
                        <NavLink
                            to={`/${workspaceSlug}/settings/labels`}
                            className={navLinkClass}
                        >
                            <Tag size={14} aria-hidden="true" />
                            Etiquetas
                        </NavLink>
                        <NavLink
                            to={`/${workspaceSlug}/settings/issue-types`}
                            className={navLinkClass}
                        >
                            <Layers size={14} aria-hidden="true" />
                            Tipos de Issue
                        </NavLink>
                        <NavLink
                            to={`/${workspaceSlug}/settings/views`}
                            className={navLinkClass}
                        >
                            <LayoutList size={14} aria-hidden="true" />
                            Vistas
                        </NavLink>
                    </>
                )}
            </nav>
        </div>
    );
}
