import type React from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Settings,
    Mail,
    Shield,
    Building2,
    Sparkles,
    Image,
    ArrowLeft,
    HelpCircle,
    Users,
    Circle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/modules/auth/application/auth-store';

interface NavItem {
    path: string;
    icon: React.ElementType;
    label: string;
    description: string;
}

const NAV_ITEMS: NavItem[] = [
    { path: '/god-mode/general', icon: Settings, label: 'General', description: 'Información básica de la instancia' },
    { path: '/god-mode/email', icon: Mail, label: 'Email', description: 'Configuración del servidor de correo' },
    { path: '/god-mode/authentication', icon: Shield, label: 'Autenticación', description: 'Métodos de inicio de sesión' },
    { path: '/god-mode/users', icon: Users, label: 'Usuarios', description: 'Gestión de usuarios del sistema' },
    { path: '/god-mode/companies', icon: Building2, label: 'Empresas', description: 'Gestión de empresas y miembros' },
    { path: '/god-mode/states', icon: Circle, label: 'Estados', description: 'Estados globales del sistema' },
    { path: '/god-mode/ai', icon: Sparkles, label: 'Inteligencia artificial', description: 'Configuración de IA' },
    { path: '/god-mode/storage', icon: Image, label: 'Almacenamiento', description: 'Cloudinary y archivos' },
];

const SECTION_LABELS: Record<string, string> = {
    general: 'General',
    email: 'Correo electrónico',
    authentication: 'Autenticación',
    workspaces: 'Espacios de trabajo',
    users: 'Usuarios',
    companies: 'Empresas',
    states: 'Estados',
    ai: 'Inteligencia artificial',
    storage: 'Almacenamiento',
};

export function GodModeLayout(): React.ReactElement {
    const navigate = useNavigate();
    const location = useLocation();
    const user = useAuthStore((s) => s.user);

    const segments = location.pathname.split('/').filter(Boolean);
    const currentSection = segments[1] ?? 'general';
    const sectionLabel = SECTION_LABELS[currentSection] ?? 'Configuración';

    const displayName =
        user?.displayName ??
        [user?.firstName, user?.lastName].filter(Boolean).join(' ') ??
        user?.email ??
        'Admin';

    const initials = displayName
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase();

    return (
        <div className="min-h-screen flex bg-canvas">
            {/* Sidebar */}
            <aside className="w-[235px] shrink-0 flex flex-col bg-surface-2 border-r border-subtle">
                {/* Header */}
                <div className="px-4 py-4 border-b border-subtle">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-md bg-accent-primary flex items-center justify-center shrink-0">
                            <Settings size={13} className="text-on-color" aria-hidden="true" />
                        </div>
                        <p className="text-sm font-semibold text-primary">Admin de instancia</p>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-accent-subtle flex items-center justify-center shrink-0">
                            <span className="text-[11px] font-semibold text-accent-primary">{initials}</span>
                        </div>
                        <p className="text-xs text-secondary truncate">{displayName}</p>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
                    {NAV_ITEMS.map(({ path, icon: Icon, label, description }) => (
                        <NavLink
                            key={path}
                            to={path}
                            className={({ isActive }) =>
                                cn(
                                    'flex items-start gap-3 px-3 py-2.5 rounded transition-colors duration-150',
                                    isActive
                                        ? 'bg-accent-subtle text-accent-primary'
                                        : 'text-secondary hover:bg-layer-transparent-hover hover:text-primary',
                                )
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <Icon
                                        size={16}
                                        className={cn('mt-0.5 shrink-0', isActive ? 'text-accent-primary' : 'text-secondary')}
                                        aria-hidden="true"
                                    />
                                    <div className="flex flex-col gap-0.5 min-w-0">
                                        <span
                                            className={cn(
                                                'text-sm font-medium leading-none',
                                                isActive ? 'text-accent-primary' : 'text-primary',
                                            )}
                                        >
                                            {label}
                                        </span>
                                        <span className="text-xs text-tertiary leading-snug">{description}</span>
                                    </div>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Footer */}
                <div className="border-t border-subtle px-2 py-2 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => void navigate('/')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs text-secondary hover:bg-layer-transparent-hover hover:text-primary transition-colors duration-150"
                    >
                        <ArrowLeft size={13} aria-hidden="true" />
                        Ir a la app
                    </button>
                    <button
                        type="button"
                        className="w-7 h-7 flex items-center justify-center rounded text-tertiary hover:bg-layer-transparent-hover hover:text-primary transition-colors duration-150"
                        aria-label="Ayuda"
                    >
                        <HelpCircle size={14} aria-hidden="true" />
                    </button>
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col overflow-hidden bg-surface-1">
                {/* Topbar */}
                <header className="h-[var(--height-header)] shrink-0 border-b border-subtle px-6 flex items-center">
                    <div className="flex items-center gap-1.5 text-sm text-tertiary">
                        <Settings size={14} aria-hidden="true" />
                        <span>Configuración</span>
                        <span className="text-tertiary">›</span>
                        <span className="text-primary font-medium">{sectionLabel}</span>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-auto p-[var(--padding-page)]">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
