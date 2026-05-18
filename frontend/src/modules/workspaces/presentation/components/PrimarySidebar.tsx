import type React from 'react';
import { useState } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import {
    Home,
    User,
    StickyNote,
    Building2,
    LayoutList,
    BarChart2,
    RotateCcw,
    Archive,
    Ellipsis,
    Plus,
    ChevronRight,
    PanelLeftClose,
    PanelLeftOpen,
    Star,
    FileText,
    Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useResizablePanel } from '@/shared/hooks/useResizablePanel';
import { useSidebarStore } from '@/modules/workspaces/application/sidebar-store';
import { useAuthStore } from '@/modules/auth/application/auth-store';
import { ThemeSwitcher } from '@/shared/components/ThemeSwitcher';
import { useCompanies } from '@/modules/companies/application/use-companies';

const SIDEBAR_MIN = 200;
const SIDEBAR_MAX = 340;
const COLLAPSED_WIDTH = 52;

interface NavItemDef {
    to: string;
    icon: React.ElementType;
    label: string;
}

interface ConfigurableItem extends NavItemDef {
    id: string;
}

const ALL_CONFIGURABLE_ITEMS: Omit<ConfigurableItem, 'to'>[] = [
    { id: 'companies', icon: Building2, label: 'Empresas' },
    { id: 'cycles', icon: RotateCcw, label: 'Recurrentes' },
    { id: 'views', icon: LayoutList, label: 'Vistas' },
    { id: 'analytics', icon: BarChart2, label: 'Análisis' },
    { id: 'archives', icon: Archive, label: 'Archivos' },
];

function makeRoute(id: string, slug: string): string {
    switch (id) {
        case 'companies': return `/${slug}/companies`;
        case 'cycles': return `/${slug}/companies`;
        case 'views': return `/${slug}/settings/views`;
        case 'analytics': return `/${slug}/analytics`;
        case 'archives': return `/${slug}/companies`;
        default: return `/${slug}`;
    }
}

function SidebarNavItem({ to, icon: Icon, label }: NavItemDef): React.ReactElement {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                cn(
                    'flex items-center gap-1.5 w-full px-2 py-1.5 rounded-sm text-[13px] font-medium transition-colors duration-150',
                    isActive
                        ? 'bg-accent-subtle text-accent-primary'
                        : 'text-secondary hover:bg-layer-transparent-hover hover:text-primary',
                )
            }
        >
            <Icon size={16} className="shrink-0" aria-hidden="true" />
            <span className="truncate">{label}</span>
        </NavLink>
    );
}

function SidebarNavItemCollapsed({ to, icon: Icon, label }: NavItemDef): React.ReactElement {
    return (
        <NavLink
            to={to}
            title={label}
            className={({ isActive }) =>
                cn(
                    'flex items-center justify-center w-full h-9 rounded-sm transition-colors duration-150',
                    isActive
                        ? 'bg-accent-subtle text-accent-primary'
                        : 'text-secondary hover:bg-layer-transparent-hover hover:text-primary',
                )
            }
        >
            <Icon size={16} aria-hidden="true" />
        </NavLink>
    );
}

interface SidebarHeaderProps {
    collapsed: boolean;
    slug: string;
    toggleCollapsed: () => void;
}

function SidebarHeader({ collapsed, slug, toggleCollapsed }: SidebarHeaderProps): React.ReactElement {
    const firstLetter = slug.slice(0, 1).toUpperCase();

    if (collapsed) {
        return (
            <div className="flex flex-col items-center pt-3 pb-2 shrink-0 gap-1">
                <button
                    type="button"
                    onClick={toggleCollapsed}
                    title={slug}
                    className="flex size-7 items-center justify-center rounded-md bg-accent-subtle text-[13px] font-bold text-accent-primary hover:bg-accent-subtle/80 transition-colors duration-150"
                    aria-label="Expandir barra lateral"
                >
                    {firstLetter}
                </button>
                <button
                    type="button"
                    onClick={toggleCollapsed}
                    className="flex size-6 items-center justify-center rounded-sm text-tertiary hover:bg-layer-transparent-hover hover:text-primary transition-colors duration-150"
                    aria-label="Expandir barra lateral"
                >
                    <PanelLeftOpen size={14} aria-hidden="true" />
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between px-3 pt-3 pb-2 shrink-0">
            <span className="text-[16px] font-medium text-primary">Empresas</span>
            <button
                type="button"
                onClick={toggleCollapsed}
                className="flex size-6 items-center justify-center rounded-sm text-tertiary hover:bg-layer-transparent-hover hover:text-primary transition-colors duration-150"
                aria-label="Colapsar barra lateral"
            >
                <PanelLeftClose size={14} aria-hidden="true" />
            </button>
        </div>
    );
}

interface WorkspaceSectionProps {
    workspaceNavItems: ConfigurableItem[];
    moreOpen: boolean;
    onMoreToggle: (() => void) | undefined;
    workspaceMenuOpen: boolean;
    onToggleWorkspaceMenu: () => void;
}

function WorkspaceSectionExpanded({
    workspaceNavItems,
    moreOpen,
    onMoreToggle,
    workspaceMenuOpen,
    onToggleWorkspaceMenu,
}: WorkspaceSectionProps): React.ReactElement {
    return (
        <div className="flex flex-col gap-0.5">
            <button
                type="button"
                onClick={onToggleWorkspaceMenu}
                className="group flex items-center justify-between w-full px-2 py-1.5 rounded-sm hover:bg-layer-transparent-hover transition-colors duration-150"
            >
                <span className="text-[13px] font-semibold text-placeholder">Espacio de trabajo</span>
                <ChevronRight
                    size={12}
                    className={cn(
                        'text-placeholder transition-transform duration-150 shrink-0',
                        workspaceMenuOpen && 'rotate-90',
                    )}
                    aria-hidden="true"
                />
            </button>
            {workspaceMenuOpen && (
                <>
                    {workspaceNavItems.map((item) => (
                        <SidebarNavItem key={item.to} {...item} />
                    ))}
                    <button
                        type="button"
                        onClick={onMoreToggle}
                        className={cn(
                            'flex items-center gap-1.5 w-full px-2 py-1.5 rounded-sm text-[13px] font-medium transition-colors duration-150',
                            moreOpen
                                ? 'bg-accent-subtle text-accent-primary'
                                : 'text-tertiary hover:bg-layer-transparent-hover hover:text-primary',
                        )}
                    >
                        <Ellipsis size={16} className="shrink-0" aria-hidden="true" />
                        <span>{moreOpen ? 'Ocultar' : 'Más'}</span>
                    </button>
                </>
            )}
        </div>
    );
}

interface WorkspaceSectionCollapsedProps {
    workspaceNavItems: ConfigurableItem[];
    moreOpen: boolean;
    onMoreToggle: (() => void) | undefined;
}

function WorkspaceSectionCollapsed({
    workspaceNavItems,
    moreOpen,
    onMoreToggle,
}: WorkspaceSectionCollapsedProps): React.ReactElement {
    return (
        <div className="flex flex-col gap-0.5">
            {workspaceNavItems.map((item) => (
                <SidebarNavItemCollapsed key={item.to} {...item} />
            ))}
            <button
                type="button"
                onClick={onMoreToggle}
                title={moreOpen ? 'Ocultar' : 'Más'}
                className={cn(
                    'flex items-center justify-center w-full h-9 rounded-sm transition-colors duration-150',
                    moreOpen
                        ? 'bg-accent-subtle text-accent-primary'
                        : 'text-tertiary hover:bg-layer-transparent-hover hover:text-primary',
                )}
            >
                <Ellipsis size={16} aria-hidden="true" />
            </button>
        </div>
    );
}

interface PrimarySidebarProps {
    moreOpen?: boolean;
    onMoreToggle?: () => void;
}

export function PrimarySidebar({ moreOpen = false, onMoreToggle }: PrimarySidebarProps): React.ReactElement {
    const { workspaceSlug } = useParams<{ workspaceSlug: string }>();
    const navigate = useNavigate();
    const { primaryWidth, setPrimaryWidth, collapsed, toggleCollapsed, pinnedWorkspaceItems } = useSidebarStore();
    const { user } = useAuthStore();
    const isAdmin = user?.roles?.includes('Admin') === true;
    const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(true);
    const slug = workspaceSlug ?? '';
    const { data: companies } = useCompanies(slug);

    const { width, isResizing, dragHandleProps } = useResizablePanel({
        defaultWidth: primaryWidth,
        min: SIDEBAR_MIN,
        max: SIDEBAR_MAX,
        onWidthChange: setPrimaryWidth,
    });

    const staticNavItems: NavItemDef[] = [
        { to: `/${slug}/home`, icon: Home, label: 'Inicio' },
        { to: `/${slug}/favorites`, icon: Star, label: 'Favoritos' },
        { to: `/${slug}/pages`, icon: FileText, label: 'Páginas' },
        { to: `/${slug}/stickies`, icon: StickyNote, label: 'Notas adhesivas' },
        { to: `/${slug}/activity`, icon: User, label: 'Tu trabajo' },
    ];

    const workspaceNavItems: ConfigurableItem[] = ALL_CONFIGURABLE_ITEMS
        .filter((item) => item.id === 'companies' || pinnedWorkspaceItems.includes(item.id))
        .map((item) => ({ ...item, to: makeRoute(item.id, slug) }));

    return (
        <aside
            className="relative shrink-0 flex flex-col bg-surface-2 border-r border-subtle overflow-hidden"
            style={{
                width: collapsed ? COLLAPSED_WIDTH : width,
                transition: isResizing ? 'none' : 'width 0.2s ease',
            }}
        >
            <SidebarHeader collapsed={collapsed} slug={slug} toggleCollapsed={toggleCollapsed} />

            {/* Quick action */}
            <div className={cn('pb-2 shrink-0', collapsed ? 'flex justify-center px-1' : 'px-3')}>
                {collapsed ? (
                    <button
                        type="button"
                        onClick={() => void navigate(`/${slug}/companies`)}
                        title="Nuevo elemento"
                        className="flex items-center justify-center w-full h-9 rounded-sm text-placeholder hover:bg-layer-transparent-hover hover:text-primary transition-colors duration-150"
                        aria-label="Nuevo elemento"
                    >
                        <Plus size={14} aria-hidden="true" />
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={() => void navigate(`/${slug}/companies`)}
                        className="flex items-center gap-1.5 w-full px-2 py-1.5 rounded-sm text-[13px] text-placeholder hover:bg-layer-transparent-hover hover:text-primary transition-colors duration-150 border border-subtle"
                    >
                        <Plus size={14} className="shrink-0" aria-hidden="true" />
                        <span>Nuevo elemento...</span>
                    </button>
                )}
            </div>

            {/* Nav content */}
            <div className={cn(
                'flex-1 overflow-y-auto flex flex-col gap-3 vertical-scrollbar scrollbar-xs pb-2',
                collapsed ? 'px-1' : 'px-3',
            )}>
                {/* Static nav */}
                <div className="flex flex-col gap-0.5">
                    {staticNavItems.map((item) =>
                        collapsed
                            ? <SidebarNavItemCollapsed key={item.to} {...item} />
                            : <SidebarNavItem key={item.to} {...item} />,
                    )}
                </div>

                {/* Workspace section */}
                {collapsed ? (
                    <WorkspaceSectionCollapsed
                        workspaceNavItems={workspaceNavItems}
                        moreOpen={moreOpen}
                        onMoreToggle={onMoreToggle}
                    />
                ) : (
                    <WorkspaceSectionExpanded
                        workspaceNavItems={workspaceNavItems}
                        moreOpen={moreOpen}
                        onMoreToggle={onMoreToggle}
                        workspaceMenuOpen={workspaceMenuOpen}
                        onToggleWorkspaceMenu={() => setWorkspaceMenuOpen((v) => !v)}
                    />
                )}

                {/* Companies list */}
                {collapsed ? (
                    <div className="flex flex-col gap-0.5">
                        {(companies?.items ?? []).map((company) => (
                            <NavLink
                                key={company.id}
                                to={`/${slug}/companies/${company.id}/issues`}
                                title={company.name}
                                className={({ isActive }) =>
                                    cn(
                                        'flex items-center justify-center w-full h-9 rounded-sm transition-colors duration-150',
                                        isActive
                                            ? 'bg-accent-subtle text-accent-primary'
                                            : 'text-secondary hover:bg-layer-transparent-hover hover:text-primary',
                                    )
                                }
                            >
                                <span className="flex size-5 items-center justify-center rounded-sm bg-layer-2 text-[10px] font-bold text-secondary shrink-0">
                                    {company.identifier.slice(0, 2).toUpperCase()}
                                </span>
                            </NavLink>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-center justify-between px-2 py-1.5">
                            <span className="text-[13px] font-semibold text-placeholder">Empresas</span>
                        </div>
                        {(companies?.items ?? []).map((company) => (
                            <NavLink
                                key={company.id}
                                to={`/${slug}/companies/${company.id}/issues`}
                                className={({ isActive }) =>
                                    cn(
                                        'flex items-center gap-2 w-full px-2 py-1.5 rounded-sm text-[13px] font-medium transition-colors duration-150',
                                        isActive
                                            ? 'bg-accent-subtle text-accent-primary'
                                            : 'text-secondary hover:bg-layer-transparent-hover hover:text-primary',
                                    )
                                }
                            >
                                <span className="flex size-5 items-center justify-center rounded-sm bg-layer-2 text-[10px] font-bold text-secondary shrink-0">
                                    {company.identifier.slice(0, 2).toUpperCase()}
                                </span>
                                <span className="truncate">{company.name}</span>
                            </NavLink>
                        ))}
                        <button
                            type="button"
                            onClick={() => void navigate(`/${slug}/companies`)}
                            className="flex items-center gap-1.5 w-full px-2 py-1.5 rounded-sm text-[13px] font-medium text-tertiary hover:bg-layer-transparent-hover hover:text-primary transition-colors duration-150"
                        >
                            <Plus size={14} className="shrink-0" aria-hidden="true" />
                            <span>Agregar empresa</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className={cn(
                'h-12 shrink-0 border-t border-subtle bg-surface-1 flex items-center',
                collapsed ? 'justify-center gap-1' : 'justify-between px-3',
            )}>
                
                <div className={cn('flex items-center', collapsed ? 'flex-col gap-1' : 'gap-1')}>
                    <ThemeSwitcher />
                    {isAdmin && (
                        <button
                            type="button"
                            onClick={() => void navigate('/god-mode')}
                            title="Administración"
                            className={cn(
                                'flex items-center rounded-sm text-secondary hover:bg-layer-transparent-hover hover:text-primary transition-colors duration-150',
                                collapsed
                                    ? 'justify-center size-7'
                                    : 'gap-1.5 px-2 py-1 text-[11px] font-medium',
                            )}
                            aria-label="Ir al panel de administración"
                        >
                            <Shield size={14} aria-hidden="true" />
                            {!collapsed && <span>Administración</span>}
                        </button>
                    )}
                    
                </div>
            </div>

            {/* Drag handle — hidden when collapsed */}
            {!collapsed && (
                <div
                    {...dragHandleProps}
                    className={cn(
                        'absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-accent-primary transition-colors duration-150 z-10',
                        isResizing && 'bg-accent-primary',
                    )}
                    aria-hidden="true"
                />
            )}
        </aside>
    );
}
