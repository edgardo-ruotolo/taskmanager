import type React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { Building2, CircleDot, Users } from 'lucide-react';
import { useAuthStore } from '@/modules/auth/application/auth-store';
import { useCompanies } from '@/modules/companies/application/use-companies';

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
}

function formatDate(): string {
    return new Intl.DateTimeFormat('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(new Date());
}

interface QuickStartItem {
    title: string;
    description: string;
    emoji: string;
}

const quickStartItems: QuickStartItem[] = [
    { title: 'Crea tu primera empresa', description: 'Organiza tu trabajo por cliente o proyecto', emoji: '🏢' },
    { title: 'Agrega una tarea', description: 'Registra tareas y haz seguimiento del progreso', emoji: '✅' },
    { title: 'Invita a tu equipo', description: 'Colabora con otros en tu espacio de trabajo', emoji: '👥' },
    { title: 'Configura los estados', description: 'Personaliza el flujo de trabajo de tus tareas', emoji: '⚙️' },
];

interface StatCardProps {
    label: string;
    value: string | number;
    icon: React.ElementType;
}

function StatCard({ label, value, icon: Icon }: StatCardProps): React.ReactElement {
    return (
        <div className="flex items-center gap-3 rounded-lg border border-subtle bg-surface-2 p-4">
            <div className="flex size-9 items-center justify-center rounded-lg bg-accent-subtle shrink-0">
                <Icon size={16} className="text-accent-primary" aria-hidden="true" />
            </div>
            <div>
                <p className="text-[20px] font-bold text-primary leading-none">{value}</p>
                <p className="mt-0.5 text-[12px] text-tertiary">{label}</p>
            </div>
        </div>
    );
}

export function WorkspaceHomePage(): React.ReactElement {
    const { workspaceSlug } = useParams<{ workspaceSlug: string }>();
    const user = useAuthStore((s) => s.user);
    const firstName = user?.displayName?.split(' ')[0] ?? user?.firstName ?? 'Usuario';
    const slug = workspaceSlug ?? '';

    const { data: companies, isLoading: companiesLoading } = useCompanies(slug);

    const companiesTotal = companiesLoading ? '--' : (companies?.items.length ?? '--');

    return (
        <div className="h-full overflow-y-auto">
            <div className="mx-auto max-w-3xl px-6 py-8">
                {/* Greeting */}
                <div className="mb-6">
                    <h1 className="mb-1 text-[22px] font-semibold text-primary">
                        {getGreeting()}, {firstName} 👋
                    </h1>
                    <p className="text-[13px] capitalize text-tertiary">{formatDate()}</p>
                </div>

                {/* Stats row */}
                <div className="mb-8 grid grid-cols-3 gap-3">
                    <StatCard label="Empresas" value={companiesTotal} icon={Building2} />
                    <StatCard label="Tareas activas" value="--" icon={CircleDot} />
                    <StatCard label="Miembros" value="--" icon={Users} />
                </div>

                {/* Quickstart */}
                <div className="mb-8">
                    <h2 className="mb-3 text-[13px] font-semibold text-secondary">Inicio rápido</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {quickStartItems.map((item) => (
                            <div
                                key={item.title}
                                className="flex cursor-pointer items-start gap-3 rounded-lg border border-subtle bg-surface-2 p-4 transition-colors duration-150 hover:bg-layer-1"
                            >
                                <span className="shrink-0 text-xl" aria-hidden="true">{item.emoji}</span>
                                <div className="min-w-0">
                                    <p className="truncate text-[13px] font-medium text-primary">{item.title}</p>
                                    <p className="mt-0.5 text-[12px] text-tertiary">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Companies section */}
                {(companies?.items?.length ?? 0) > 0 && (
                    <div className="mb-8">
                        <h2 className="mb-3 text-[13px] font-semibold text-secondary">Empresas</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {companies?.items.map((company) => (
                                <NavLink
                                    key={company.id}
                                    to={`/${slug}/companies/${company.id}/issues`}
                                    className="flex items-center gap-3 rounded-lg border border-subtle bg-surface-2 p-3 hover:bg-layer-1 transition-colors"
                                >
                                    <span className="flex size-8 items-center justify-center rounded-md bg-accent-subtle text-[13px] font-bold text-accent-primary shrink-0">
                                        {company.identifier.slice(0, 2).toUpperCase()}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-[13px] font-medium text-primary truncate">{company.name}</p>
                                        <p className="text-[11px] text-tertiary">{company.identifier}</p>
                                    </div>
                                </NavLink>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recent activity */}
                <div>
                    <h2 className="mb-3 text-[13px] font-semibold text-secondary">Actividad reciente</h2>
                    <div className="rounded-lg border border-subtle bg-surface-2 p-8 text-center">
                        <p className="text-[13px] text-tertiary">No hay actividad reciente todavía.</p>
                        <p className="mt-1 text-[12px] text-placeholder">Crea una empresa y tareas para comenzar.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
