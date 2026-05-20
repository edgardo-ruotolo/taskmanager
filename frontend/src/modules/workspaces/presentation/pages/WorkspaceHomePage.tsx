import type React from 'react';
import { useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { Link2, Plus, Trash2, } from 'lucide-react';
import { useAuthMe } from '@/modules/auth/application/use-auth-me';
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
import { Eyebrow } from '@/components/ui/eyebrow';

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
}

function StatCard({ label, value }: StatCardProps): React.ReactElement {
    return (
        <div className="flex flex-col gap-1 p-5 bg-white border border-[var(--neutral-300)] rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all duration-200 group">
            <span className="text-[11px] font-mono font-semibold text-[var(--neutral-600)] uppercase tracking-[0.14em] mb-1">{label}</span>
            <span className="text-[32px] font-mono font-medium text-[var(--neutral-1200)] tracking-[-0.04em] leading-none group-hover:text-[var(--brand-700)] transition-colors">{value}</span>
        </div>
    );
}

function formatRelativeTime(isoDate: string): string {
    const diff = Date.now() - new Date(isoDate).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'ahora';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
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
                        <Label htmlFor="ql-desc">Descripción <span className="text-[var(--neutral-600)]">(opcional)</span></Label>
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
    const { data: user } = useAuthMe();
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
            <div className="mx-auto max-w-5xl px-10 py-10 flex flex-col gap-10">
                {/* Greeting */}
                <div>
                    <Eyebrow>{formatDate()}</Eyebrow>
                    <h1 className="mt-3 mb-1 text-[56px] font-medium tracking-[-0.05em] leading-[0.95] text-[var(--neutral-1200)]">
                        {getGreeting()}, <span className="font-serif italic font-normal text-[var(--brand-700)]">{firstName}.</span>
                    </h1>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-4">
                    <StatCard label="Empresas" value={companiesTotal} />
                    <StatCard label="Tareas activas" value="--" />
                    <StatCard label="Miembros" value="--" />
                </div>

                {/* Recent visits */}
                {(recentVisits?.length ?? 0) > 0 && (
                    <div>
                        <h2 className="mb-5 text-[20px] font-semibold tracking-[-0.03em] text-[var(--neutral-1200)]">
                            Visitas recientes
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {recentVisits?.slice(0, 8).map((visit) => (
                                <NavLink
                                    key={visit.id}
                                    to={visit.entityUrl ?? '#'}
                                    className="flex flex-col gap-3 p-4 bg-white border border-[var(--neutral-300)] rounded-xl hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:border-[var(--neutral-400)] transition-all group"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="shrink-0 text-lg opacity-80 group-hover:scale-110 transition-transform" aria-hidden="true">{entityTypeIcon(visit.entityType)}</span>
                                        <span className="text-[10px] font-mono font-medium text-[var(--neutral-600)] uppercase tracking-wider">{formatRelativeTime(visit.visitedAt)}</span>
                                    </div>
                                    <span className="text-[13.5px] font-medium text-[var(--neutral-1200)] line-clamp-2 leading-snug tracking-[-0.01em]">{visit.entityTitle}</span>
                                </NavLink>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quick links */}
                <div>
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-[20px] font-semibold tracking-[-0.03em] text-[var(--neutral-1200)]">
                            Links rápidos
                        </h2>
                        <button
                            type="button"
                            onClick={() => setAddLinkOpen(true)}
                            className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--neutral-600)] hover:text-[var(--neutral-1200)] transition-colors"
                        >
                            <Plus size={14} />
                            Agregar
                        </button>
                    </div>
                    {(quickLinks?.length ?? 0) === 0 ? (
                        <div className="rounded-xl border border-dashed border-[var(--neutral-400)] bg-white/50 p-10 text-center">
                            <p className="text-[14px] text-[var(--neutral-600)]">Sin links rápidos todavía.</p>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setAddLinkOpen(true)}
                                className="mt-3 text-[var(--brand-700)] hover:text-[var(--brand-800)] hover:bg-[var(--brand-700)]/5"
                            >
                                Agregar el primero
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {quickLinks?.map((link) => (
                                <div
                                    key={link.id}
                                    className="group relative flex items-start gap-3 rounded-xl border border-[var(--neutral-300)] bg-white p-4 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all"
                                >
                                    <div className="p-2 rounded-lg bg-[var(--neutral-100)] text-[var(--neutral-600)] group-hover:text-[var(--brand-700)] transition-colors">
                                        <Link2 size={16} aria-hidden="true" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <a
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[14px] font-semibold text-[var(--neutral-1200)] hover:underline flex items-center gap-1 truncate"
                                        >
                                            {link.title}
                                        </a>
                                        {link.description && (
                                            <p className="text-[12px] text-[var(--neutral-700)] line-clamp-1 mt-0.5">{link.description}</p>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => deleteQuickLink(link.id)}
                                        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-[var(--neutral-500)] hover:text-red-500"
                                    >
                                        <Trash2 size={14} />
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
                <div>
                    <h2 className="mb-5 text-[20px] font-semibold tracking-[-0.03em] text-[var(--neutral-1200)]">Inicio rápido</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {quickStartItems.map((item) => (
                            <div
                                key={item.title}
                                className="flex cursor-pointer items-start gap-4 rounded-xl border border-[var(--neutral-300)] bg-white p-5 transition-all duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:border-[var(--neutral-400)] group"
                            >
                                <span className="shrink-0 text-2xl group-hover:scale-110 transition-transform" aria-hidden="true">{item.emoji}</span>
                                <div className="min-w-0">
                                    <p className="truncate text-[14.5px] font-semibold text-[var(--neutral-1200)]">{item.title}</p>
                                    <p className="mt-1 text-[13px] text-[var(--neutral-600)] leading-normal">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Companies section */}
                {(companies?.items?.length ?? 0) > 0 && (
                    <div>
                        <h2 className="mb-5 text-[20px] font-semibold tracking-[-0.03em] text-[var(--neutral-1200)]">Empresas</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {companies?.items.map((company) => (
                                <NavLink
                                    key={company.id}
                                    to={`/${slug}/companies/${company.id}/issues`}
                                    className="flex items-center gap-3 rounded-xl border border-[var(--neutral-300)] bg-white p-4 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all"
                                >
                                    <span className="flex size-9 items-center justify-center rounded-lg bg-[var(--brand-700)] text-[13px] font-bold text-white shrink-0">
                                        {company.identifier.slice(0, 2).toUpperCase()}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-[14px] font-semibold text-[var(--neutral-1200)] truncate tracking-[-0.01em]">{company.name}</p>
                                        <p className="text-[11px] font-mono text-[var(--neutral-600)] uppercase tracking-wider">{company.identifier}</p>
                                    </div>
                                </NavLink>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recent activity */}
                <div>
                    <h2 className="mb-5 text-[20px] font-semibold tracking-[-0.03em] text-[var(--neutral-1200)]">Actividad reciente</h2>
                    <div className="rounded-xl border border-[var(--neutral-300)] bg-white p-12 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                        <p className="text-[14px] text-[var(--neutral-600)] font-medium">No hay actividad reciente todavía.</p>
                        <p className="mt-1.5 text-[13px] text-[var(--neutral-500)]">Crea una empresa y tareas para comenzar.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
