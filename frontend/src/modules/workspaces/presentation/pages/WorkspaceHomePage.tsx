import type React from 'react';
import { useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { Building2, CircleDot, Users, Clock, Link2, Plus, Trash2, ExternalLink } from 'lucide-react';
import { useAuthStore } from '@/modules/auth/application/auth-store';
import { useCompanies } from '@/modules/companies/application/use-companies';
import { useRecentVisits, useQuickLinks, useCreateQuickLink, useDeleteQuickLink } from '@/modules/home/application/use-home';
import type { CreateQuickLinkData } from '@/modules/home/domain/types';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

function formatRelativeTime(isoDate: string): string {
    const diff = Date.now() - new Date(isoDate).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'ahora';
    if (minutes < 60) return `hace ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `hace ${hours} h`;
    const days = Math.floor(hours / 24);
    return `hace ${days} d`;
}

function entityTypeIcon(entityType: string): string {
    switch (entityType.toLowerCase()) {
        case 'issue': return '✅';
        case 'company': return '🏢';
        case 'cycle': return '🔄';
        case 'module': return '📦';
        default: return '📄';
    }
}

interface AddQuickLinkDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: CreateQuickLinkData) => void;
    isPending: boolean;
}

function AddQuickLinkDialog({ open, onOpenChange, onSubmit, isPending }: AddQuickLinkDialogProps): React.ReactElement {
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = (e: React.FormEvent): void => {
        e.preventDefault();
        if (!title.trim() || !url.trim()) return;
        onSubmit({ title: title.trim(), url: url.trim(), description: description.trim() || undefined });
        setTitle('');
        setUrl('');
        setDescription('');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Agregar link rápido</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="ql-title">Título</Label>
                        <Input
                            id="ql-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ej: Documentación del proyecto"
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="ql-url">URL</Label>
                        <Input
                            id="ql-url"
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://..."
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="ql-desc">Descripción <span className="text-placeholder">(opcional)</span></Label>
                        <Input
                            id="ql-desc"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Descripción breve"
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isPending}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isPending || !title.trim() || !url.trim()}>
                            {isPending ? 'Agregando…' : 'Agregar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export function WorkspaceHomePage(): React.ReactElement {
    const { workspaceSlug } = useParams<{ workspaceSlug: string }>();
    const user = useAuthStore((s) => s.user);
    const firstName = user?.displayName?.split(' ')[0] ?? user?.firstName ?? 'Usuario';
    const slug = workspaceSlug ?? '';

    const [addLinkOpen, setAddLinkOpen] = useState(false);

    const { data: companies, isLoading: companiesLoading } = useCompanies(slug);
    const { data: recentVisits } = useRecentVisits(slug, 8);
    const { data: quickLinks } = useQuickLinks(slug);
    const { mutate: createQuickLink, isPending: creatingLink } = useCreateQuickLink(slug);
    const { mutate: deleteQuickLink } = useDeleteQuickLink(slug);

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

                {/* Recent visits */}
                {(recentVisits?.length ?? 0) > 0 && (
                    <div className="mb-8">
                        <h2 className="mb-3 text-[13px] font-semibold text-secondary flex items-center gap-1.5">
                            <Clock size={13} aria-hidden="true" />
                            Visitas recientes
                        </h2>
                        <div className="rounded-lg border border-subtle bg-surface-2 divide-y divide-subtle overflow-hidden">
                            {recentVisits?.slice(0, 8).map((visit) => (
                                visit.entityUrl ? (
                                    <NavLink
                                        key={visit.id}
                                        to={visit.entityUrl}
                                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-layer-1 transition-colors"
                                    >
                                        <span className="shrink-0 text-base" aria-hidden="true">{entityTypeIcon(visit.entityType)}</span>
                                        <span className="flex-1 min-w-0 text-[13px] text-primary truncate">{visit.entityTitle}</span>
                                        <span className="text-[11px] text-placeholder shrink-0">{formatRelativeTime(visit.visitedAt)}</span>
                                    </NavLink>
                                ) : (
                                    <div key={visit.id} className="flex items-center gap-3 px-4 py-2.5">
                                        <span className="shrink-0 text-base" aria-hidden="true">{entityTypeIcon(visit.entityType)}</span>
                                        <span className="flex-1 min-w-0 text-[13px] text-primary truncate">{visit.entityTitle}</span>
                                        <span className="text-[11px] text-placeholder shrink-0">{formatRelativeTime(visit.visitedAt)}</span>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                )}

                {/* Quick links */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-[13px] font-semibold text-secondary flex items-center gap-1.5">
                            <Link2 size={13} aria-hidden="true" />
                            Links rápidos
                        </h2>
                        <button
                            type="button"
                            onClick={() => setAddLinkOpen(true)}
                            aria-label="Agregar link rápido"
                            className="flex items-center gap-1 text-[12px] text-placeholder hover:text-secondary transition-colors"
                        >
                            <Plus size={13} />
                            Agregar
                        </button>
                    </div>
                    {(quickLinks?.length ?? 0) === 0 ? (
                        <div className="rounded-lg border border-subtle bg-surface-2 p-6 text-center">
                            <p className="text-[13px] text-tertiary">Sin links rápidos todavía.</p>
                            <button
                                type="button"
                                onClick={() => setAddLinkOpen(true)}
                                className="mt-1 text-[12px] text-accent-primary hover:underline"
                            >
                                Agregar el primero
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-2">
                            {quickLinks?.map((link) => (
                                <div
                                    key={link.id}
                                    className="group relative flex items-start gap-2.5 rounded-lg border border-subtle bg-surface-2 p-3 hover:bg-layer-1 transition-colors"
                                >
                                    <Link2 size={14} className="shrink-0 text-placeholder mt-0.5" aria-hidden="true" />
                                    <div className="flex-1 min-w-0">
                                        <a
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[13px] font-medium text-primary hover:text-accent-primary flex items-center gap-1 truncate"
                                        >
                                            {link.title}
                                            <ExternalLink size={11} className="shrink-0 opacity-60" aria-hidden="true" />
                                        </a>
                                        {link.description && (
                                            <p className="text-[11px] text-tertiary truncate mt-0.5">{link.description}</p>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => deleteQuickLink(link.id)}
                                        aria-label={`Eliminar link ${link.title}`}
                                        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-placeholder hover:text-red-500"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    <AddQuickLinkDialog
                        open={addLinkOpen}
                        onOpenChange={setAddLinkOpen}
                        onSubmit={(data) => { createQuickLink(data); setAddLinkOpen(false); }}
                        isPending={creatingLink}
                    />
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
