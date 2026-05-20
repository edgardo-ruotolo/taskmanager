import type React from 'react';
import { useEffect } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import {
    Home,
    User,
    Building2,
    LayoutList,
    BarChart2,
    RotateCcw,
    Plus,
    PanelLeftClose,
    PanelLeftOpen,
    Shield,
    Search,
    Settings,
    ChevronRight,
    ChevronDown,
    AlertCircle,
    GitBranch,
    BoxSelect,
    Inbox,
    Archive,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useResizablePanel } from '@/shared/hooks/useResizablePanel';
import { useSidebarStore } from '@/modules/workspaces/application/sidebar-store';
import { useAuthMe } from '@/modules/auth/application/use-auth-me';
import { ThemeSwitcher } from '@/shared/components/ThemeSwitcher';
import { useCompanies } from '@/modules/companies/application/use-companies';
import { Eyebrow } from '@/components/ui/eyebrow';
import { WorkspaceSwitcher } from '@/modules/workspaces/presentation/components/WorkspaceSwitcher';

const SIDEBAR_MIN = 200;
const SIDEBAR_MAX = 340;
const COLLAPSED_WIDTH = 52;

interface NavItemDef {
    to: string;
    icon: React.ElementType;
    label: string;
}

function SidebarNavItem({ to, icon: Icon, label }: NavItemDef): React.ReactElement {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                cn(
                    'flex items-center gap-2.5 w-full px-2.5 py-[6px] rounded-[5px] text-[13px] transition-all duration-150 -ml-[2px] border-l-2',
                    isActive
                        ? 'bg-white font-medium shadow-[0_1px_2px_rgba(0,0,0,0.04)] text-primary border-[var(--brand-700)]'
                        : 'font-normal border-transparent hover:bg-[var(--neutral-300)]/50 hover:text-primary',
                )
            }
            style={({ isActive }) => ({
                color: isActive ? 'var(--neutral-1200)' : 'var(--neutral-1100)',
            })}
        >
            {({ isActive }) => (
                <>
                    <Icon size={15} className={cn('shrink-0', isActive ? 'text-[var(--neutral-1200)]' : 'text-[var(--neutral-900)]')} aria-hidden="true" />
                    <span className="truncate flex-1 tracking-[-0.005em]">{label}</span>
                </>
            )}
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
                    'flex items-center justify-center w-full h-9 rounded-[5px] transition-colors duration-150',
                    isActive
                        ? 'bg-white text-primary shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
                        : 'hover:bg-[var(--neutral-300)]/50 hover:text-primary',
                )
            }
            style={({ isActive }) => ({
                color: isActive ? 'var(--neutral-1200)' : 'var(--neutral-1100)',
            })}
        >
            <Icon size={15} aria-hidden="true" />
        </NavLink>
    );
}

interface SidebarHeaderProps {
    collapsed: boolean;
    toggleCollapsed: () => void;
}

function SidebarHeader({ collapsed, toggleCollapsed }: SidebarHeaderProps): React.ReactElement {
    if (collapsed) {
        return (
            <div className="flex flex-col items-center pt-3 pb-2 shrink-0 gap-1">
                <WorkspaceSwitcher />
                <button
                    type="button"
                    onClick={toggleCollapsed}
                    className="flex size-6 items-center justify-center rounded-sm hover:bg-[var(--neutral-100)] transition-colors duration-150"
                    style={{ color: 'var(--neutral-700)' }}
                    aria-label="Expandir barra lateral"
                >
                    <PanelLeftOpen size={14} aria-hidden="true" />
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between px-3 pt-3 pb-3 shrink-0 gap-2 border-b" style={{ borderColor: 'var(--neutral-400)' }}>
            <WorkspaceSwitcher />
            <button
                type="button"
                onClick={toggleCollapsed}
                className="flex size-6 items-center justify-center rounded-sm hover:bg-[var(--neutral-100)] transition-colors duration-150 shrink-0"
                style={{ color: 'var(--neutral-700)' }}
                aria-label="Colapsar barra lateral"
            >
                <PanelLeftClose size={14} aria-hidden="true" />
            </button>
        </div>
    );
}

interface CompanySubNavItem {
    to: string;
    icon: React.ElementType;
    label: string;
}

function getCompanySubNav(slug: string, companyId: string): CompanySubNavItem[] {
    return [
        { to: `/${slug}/companies/${companyId}/issues`, icon: AlertCircle, label: 'Tareas' },
        { to: `/${slug}/companies/${companyId}/cycles`, icon: GitBranch, label: 'Ciclos' },
        { to: `/${slug}/companies/${companyId}/modules`, icon: BoxSelect, label: 'Módulos' },
        { to: `/${slug}/companies/${companyId}/estimates`, icon: BarChart2, label: 'Estimaciones' },
        { to: `/${slug}/companies/${companyId}/inbox`, icon: Inbox, label: 'Bandeja' },
        { to: `/${slug}/companies/${companyId}/archives`, icon: Archive, label: 'Archivos' },
    ];
}

interface ExpandableCompanyItemProps {
    slug: string;
    company: { id: string; name: string; identifier: string };
    isExpanded: boolean;
    onToggle: (companyId: string) => void;
}

function ExpandableCompanyItem({
    slug,
    company,
    isExpanded,
    onToggle,
}: ExpandableCompanyItemProps): React.ReactElement {
    const subNav = getCompanySubNav(slug, company.id);
    return (
        <div className="flex flex-col">
            <div className="flex items-stretch gap-0.5">
                <button
                    type="button"
                    onClick={() => onToggle(company.id)}
                    className="flex size-6 shrink-0 items-center justify-center rounded-[5px] hover:bg-[var(--neutral-100)] transition-colors duration-150"
                    style={{ color: 'var(--neutral-700)' }}
                    aria-label={isExpanded ? `Colapsar ${company.name}` : `Expandir ${company.name}`}
                    aria-expanded={isExpanded}
                >
                    {isExpanded ? (
                        <ChevronDown size={13} aria-hidden="true" />
                    ) : (
                        <ChevronRight size={13} aria-hidden="true" />
                    )}
                </button>
                <NavLink
                    to={`/${slug}/companies/${company.id}/issues`}
                    className={({ isActive }) =>
                        cn(
                            'flex flex-1 min-w-0 items-center gap-2 px-2 py-[6px] rounded-[5px] text-[13px] transition-colors duration-150 border-l-2',
                            isActive
                                ? 'bg-white font-medium shadow-[0_1px_2px_rgba(0,0,0,0.04)] border-[var(--brand-700)]'
                                : 'font-normal border-transparent hover:bg-[var(--neutral-100)]',
                        )
                    }
                    style={({ isActive }) => ({
                        color: isActive ? 'var(--neutral-1200)' : 'var(--neutral-1100)',
                    })}
                >
                    <span
                        className="flex size-5 items-center justify-center rounded-sm text-[10px] font-bold shrink-0"
                        style={{ background: 'var(--neutral-300)', color: 'var(--neutral-900)' }}
                    >
                        {company.identifier.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="truncate">{company.name}</span>
                </NavLink>
            </div>
            {isExpanded && (
                <div className="flex flex-col gap-0.5 mt-0.5 pl-[22px]">
                    {subNav.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end
                            className={({ isActive }) =>
                                cn(
                                    'flex items-center gap-2 px-2 py-[5px] rounded-[5px] text-[12.5px] transition-colors duration-150 border-l-2',
                                    isActive
                                        ? 'bg-white font-medium shadow-[0_1px_2px_rgba(0,0,0,0.04)] border-[var(--brand-700)]'
                                        : 'font-normal border-transparent hover:bg-[var(--neutral-100)]',
                                )
                            }
                            style={({ isActive }) => ({
                                color: isActive ? 'var(--neutral-1200)' : 'var(--neutral-1100)',
                            })}
                        >
                            <item.icon size={13} className="shrink-0" aria-hidden="true" />
                            <span className="truncate">{item.label}</span>
                        </NavLink>
                    ))}
                </div>
            )}
        </div>
    );
}

export function PrimarySidebar(): React.ReactElement {
    const { workspaceSlug, companyId: activeCompanyId } = useParams<{
        workspaceSlug: string;
        companyId?: string;
    }>();
    const navigate = useNavigate();
    const {
        primaryWidth,
        setPrimaryWidth,
        collapsed,
        toggleCollapsed,
        expandedCompanies,
        toggleCompanyExpanded,
        expandCompany,
    } = useSidebarStore();
    const { data: user } = useAuthMe();
    const isAdmin = user?.roles?.includes('Admin') === true;
    const slug = workspaceSlug ?? '';
    const { data: companies } = useCompanies(slug);

    useEffect(() => {
        if (activeCompanyId) {
            expandCompany(activeCompanyId);
        }
    }, [activeCompanyId, expandCompany]);

    const { width, isResizing, dragHandleProps } = useResizablePanel({
        defaultWidth: primaryWidth || 232,
        min: SIDEBAR_MIN,
        max: SIDEBAR_MAX,
        onWidthChange: setPrimaryWidth,
    });

    const handleSearchOpen = (): void => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }));
    };

    const displayName = user?.displayName
        ?? (user?.firstName || user?.lastName
            ? `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()
            : user?.username ?? 'Usuario');

    const initials = user?.firstName && user?.lastName
        ? `${user.firstName[0]}${user.lastName[0]}`
        : (user?.displayName?.[0] ?? user?.username?.[0] ?? '?');

    const staticNavItems: NavItemDef[] = [
        { to: `/${slug}/home`, icon: Home, label: 'Inicio' },
        { to: `/${slug}/activity`, icon: User, label: 'Tu trabajo' },
        { to: `/${slug}/recurring`, icon: RotateCcw, label: 'Recurrentes' },
        { to: `/${slug}/settings/views`, icon: LayoutList, label: 'Vistas' },
        { to: `/${slug}/analytics`, icon: BarChart2, label: 'Análisis' },
        { to: `/${slug}/companies`, icon: Building2, label: 'Empresas' },
        { to: `/${slug}/settings`, icon: Settings, label: 'Configuración' },
    ];

    return (
        <aside
            className="relative shrink-0 flex flex-col border-r overflow-hidden h-full z-30"
            style={{
                background: 'var(--neutral-200)',
                borderColor: 'var(--neutral-400)',
                width: collapsed ? COLLAPSED_WIDTH : width,
                transition: isResizing ? 'none' : 'width 0.2s ease',
            }}
        >
            <SidebarHeader collapsed={collapsed} toggleCollapsed={toggleCollapsed} />

            {/* Search trigger (expanded only) */}
            {!collapsed && (
                <div className="px-3 pt-2.5 pb-2 shrink-0">
                    <button
                        type="button"
                        onClick={handleSearchOpen}
                        className="flex items-center gap-2 w-full px-2.5 py-[7px] rounded-[5px] text-[12px] transition-colors hover:opacity-90"
                        style={{ background: 'var(--neutral-300)', color: 'var(--neutral-700)' }}
                        aria-label="Abrir paleta de comandos"
                    >
                        <Search size={13} aria-hidden="true" />
                        <span className="flex-1 text-left">Buscar…</span>
                        <span
                            className="font-mono text-[10px] px-1 py-0.5 rounded"
                            style={{ background: 'var(--neutral-200)', color: 'var(--neutral-700)' }}
                        >
                            ⌘K
                        </span>
                    </button>
                </div>
            )}

            {/* Quick action */}
            <div className={cn('pb-2 shrink-0', collapsed ? 'flex justify-center px-1' : 'px-3')}>
                {collapsed ? (
                    <button
                        type="button"
                        onClick={() => void navigate(`/${slug}/companies`)}
                        title="Nuevo elemento"
                        className="flex items-center justify-center w-full h-9 rounded-[5px] hover:bg-[var(--neutral-100)] transition-colors duration-150"
                        style={{ color: 'var(--neutral-700)' }}
                        aria-label="Nuevo elemento"
                    >
                        <Plus size={14} aria-hidden="true" />
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={() => void navigate(`/${slug}/companies`)}
                        className="flex items-center gap-1.5 w-full px-2 py-1.5 rounded-[5px] text-[13px] hover:bg-[var(--neutral-100)] transition-colors duration-150 border"
                        style={{ color: 'var(--neutral-700)', borderColor: 'var(--neutral-400)' }}
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
                                        'flex items-center justify-center w-full h-9 rounded-[5px] transition-colors duration-150',
                                        isActive
                                            ? 'bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
                                            : 'hover:bg-[var(--neutral-100)]',
                                    )
                                }
                                style={({ isActive }) => ({
                                    color: isActive ? 'var(--neutral-1200)' : 'var(--neutral-1100)',
                                })}
                            >
                                <span
                                    className="flex size-5 items-center justify-center rounded-sm text-[10px] font-bold shrink-0"
                                    style={{ background: 'var(--neutral-300)', color: 'var(--neutral-900)' }}
                                >
                                    {company.identifier.slice(0, 2).toUpperCase()}
                                </span>
                            </NavLink>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-center justify-between px-2 py-1.5">
                            <Eyebrow>Empresas</Eyebrow>
                        </div>
                        {(companies?.items ?? []).map((company) => (
                            <ExpandableCompanyItem
                                key={company.id}
                                slug={slug}
                                company={company}
                                isExpanded={expandedCompanies[company.id] === true}
                                onToggle={toggleCompanyExpanded}
                            />
                        ))}
                        <button
                            type="button"
                            onClick={() => void navigate(`/${slug}/companies`)}
                            className="flex items-center gap-2 w-full px-2.5 py-[6px] rounded-[5px] text-[13px] font-normal hover:bg-[var(--neutral-100)] transition-colors duration-150"
                            style={{ color: 'var(--neutral-700)' }}
                        >
                            <Plus size={14} className="shrink-0" aria-hidden="true" />
                            <span>Agregar empresa</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Footer — user info */}
            <div
                className={cn(
                    'h-12 shrink-0 border-t flex items-center gap-2',
                    collapsed ? 'justify-center px-1' : 'px-3',
                )}
                style={{ borderColor: 'var(--neutral-400)', background: 'var(--neutral-100)' }}
            >
                {/* Avatar */}
                <div
                    className="flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold uppercase"
                    style={{ background: 'var(--brand-700)', color: '#fff' }}
                >
                    {initials}
                </div>

                {!collapsed && (
                    <>
                        <div className="flex-1 min-w-0">
                            <div
                                className="text-[12.5px] font-medium tracking-[-0.01em] truncate"
                                style={{ color: 'var(--neutral-1200)' }}
                            >
                                {displayName}
                            </div>
                            <div
                                className="flex items-center gap-1 font-mono text-[9.5px] tracking-[0.08em] uppercase"
                                style={{ color: 'var(--green-700)' }}
                            >
                                <span
                                    className="inline-block w-[5px] h-[5px] rounded-full shrink-0"
                                    style={{ background: 'var(--green-700)' }}
                                />
                                EN LÍNEA
                            </div>
                        </div>

                        <div className="flex items-center gap-0.5 ml-auto">
                            <ThemeSwitcher />
                            {isAdmin && (
                                <button
                                    type="button"
                                    onClick={() => void navigate('/god-mode')}
                                    title="Administración"
                                    className="flex size-6 items-center justify-center rounded-sm hover:bg-[var(--neutral-200)] transition-colors"
                                    style={{ color: 'var(--neutral-700)' }}
                                    aria-label="Ir al panel de administración"
                                >
                                    <Shield size={13} aria-hidden="true" />
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Drag handle — hidden when collapsed */}
            {!collapsed && (
                <div
                    {...dragHandleProps}
                    className={cn(
                        'absolute right-0 top-0 bottom-0 w-1 cursor-col-resize transition-colors duration-150 z-10',
                        isResizing ? 'bg-[var(--brand-700)]' : 'hover:bg-[var(--brand-700)]',
                    )}
                    aria-hidden="true"
                />
            )}
        </aside>
    );
}
