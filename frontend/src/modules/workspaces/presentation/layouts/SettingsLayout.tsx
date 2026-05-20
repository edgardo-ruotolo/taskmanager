import type React from 'react';
import { NavLink, useParams, useLocation, Outlet, } from 'react-router-dom';
import { 
    Settings, 
    Users, 
    Palette, 
    Layers, 
    Tag, 
    LayoutList,
    Shield,
    Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsTab {
    to: string;
    label: string;
    icon: React.ElementType;
}

const WORKSPACE_TABS: SettingsTab[] = [
    { to: 'general', label: 'General', icon: Settings },
    { to: 'members', label: 'Miembros', icon: Users },
    { to: 'theme', label: 'Tema', icon: Palette },
    { to: 'teams', label: 'Equipos', icon: Users },
    { to: 'companies', label: 'Empresas', icon: Building2 },
];

const SYSTEM_TABS: SettingsTab[] = [
    { to: 'states', label: 'Estados', icon: Shield },
    { to: 'labels', label: 'Etiquetas', icon: Tag },
    { to: 'issue-types', label: 'Tipos de Issue', icon: Layers },
    { to: 'views', label: 'Vistas', icon: LayoutList },
];

const DEVELOPER_TABS: SettingsTab[] = [
];

export const SettingsLayout = (): React.ReactElement => {
    const { workspaceSlug } = useParams<{ workspaceSlug: string }>();
    const location = useLocation();

    const renderTab = (tab: SettingsTab) => {
        const isActive = location.pathname.includes(tab.to);
        const Icon = tab.icon;

        return (
            <NavLink
                key={tab.to}
                to={`/${workspaceSlug}/settings/${tab.to}`}
                className={cn(
                    'flex items-center gap-2 px-4 py-2.5 text-[13.5px] font-medium transition-all border-b-2 -mb-[1px]',
                    isActive
                        ? 'border-[var(--brand-700)] text-[var(--neutral-1200)]'
                        : 'border-transparent text-[var(--neutral-600)] hover:text-[var(--neutral-1200)]'
                )}
            >
                <Icon size={14} className="shrink-0" />
                {tab.label}
            </NavLink>
        );
    };

    return (
        <div className="h-full flex flex-col overflow-hidden bg-canvas">
            {/* Settings Header */}
            <div className="px-10 pt-10 pb-6 shrink-0">
                <h1 className="text-[32px] font-semibold text-[var(--neutral-1200)] tracking-[-0.04em]">Configuración</h1>
                <p className="text-[14.5px] text-[var(--neutral-600)] mt-1">Administra tu espacio de trabajo y preferencias personales.</p>
            </div>

            {/* Tabs Navigation */}
            <div className="px-10 border-b border-[var(--neutral-300)] shrink-0 flex items-center gap-2 overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-1 mr-4">
                    {WORKSPACE_TABS.map(renderTab)}
                </div>
                <div className="h-4 w-px bg-[var(--neutral-300)] mx-2" />
                <div className="flex items-center gap-1 mr-4">
                    {SYSTEM_TABS.map(renderTab)}
                </div>
                <div className="h-4 w-px bg-[var(--neutral-300)] mx-2" />
                <div className="flex items-center gap-1">
                    {DEVELOPER_TABS.map(renderTab)}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto">
                <div className="mx-auto max-w-4xl px-10 py-8">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};
