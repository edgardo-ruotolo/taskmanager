import type React from 'react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Inbox, Trash2, Check, X, Copy } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useIntake, useCreateIntake, useReviewIntake, useDeleteIntake } from '../../application/use-intake';
import type { IntakeIssue, IntakeStatus, CreateIntakeIssueData } from '../../domain/types';

type TabStatus = IntakeStatus | 'all';

const TABS: { value: TabStatus; label: string }[] = [
    { value: 'Pending', label: 'Pendientes' },
    { value: 'Accepted', label: 'Aceptados' },
    { value: 'Declined', label: 'Declinados' },
    { value: 'Snoozed', label: 'Pospuestos' },
];

const STATUS_LABELS: Record<IntakeStatus, string> = {
    Pending: 'Pendiente',
    Accepted: 'Aceptado',
    Declined: 'Declinado',
    Duplicate: 'Duplicado',
    Snoozed: 'Pospuesto',
};

const STATUS_BADGE_CLASSES: Record<IntakeStatus, string> = {
    Pending: 'bg-layer-1 text-tertiary',
    Accepted: 'bg-green-900/40 text-green-400',
    Declined: 'bg-red-900/40 text-red-400',
    Duplicate: 'bg-layer-1 text-tertiary',
    Snoozed: 'bg-yellow-900/40 text-yellow-400',
};

const createSchema = z.object({
    title: z.string().min(1, 'El título es requerido').max(255),
    description: z.string().optional(),
    submitterEmail: z.string().email('Email inválido').optional().or(z.literal('')),
    source: z.string().optional(),
});
type CreateFormData = z.infer<typeof createSchema>;

function formatRelative(dateStr: string): string {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return 'Ahora';
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
    return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}

// --- Create Dialog ---

function CreateIntakeDialog({
    workspaceSlug,
    companyId,
}: {
    workspaceSlug: string;
    companyId: string;
}): React.ReactElement {
    const [open, setOpen] = useState(false);
    const { mutate: create, isPending } = useCreateIntake(workspaceSlug, companyId);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CreateFormData>({ resolver: zodResolver(createSchema) });

    const onSubmit = (data: CreateFormData): void => {
        const payload: CreateIntakeIssueData = {
            title: data.title,
            description: data.description || undefined,
            submitterEmail: data.submitterEmail || undefined,
            source: data.source || 'manual',
        };
        create(payload, {
            onSuccess: () => {
                reset();
                setOpen(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-accent-primary hover:bg-accent-primary-hover text-on-color gap-2">
                    <Plus size={15} />
                    Nueva solicitud
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-surface-1 border-subtle">
                <DialogHeader>
                    <DialogTitle className="text-primary">Nueva solicitud</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 mt-2">
                    <div>
                        <Input
                            {...register('title')}
                            placeholder="Título *"
                            className="bg-layer-1/50 border-subtle text-primary placeholder:text-placeholder"
                        />
                        {errors.title && (
                            <p className="text-xs text-red-400 mt-1">{errors.title.message}</p>
                        )}
                    </div>
                    <Textarea
                        {...register('description')}
                        placeholder="Descripción (opcional)"
                        rows={3}
                        className="bg-layer-1/50 border-subtle text-primary placeholder:text-placeholder resize-none"
                    />
                    <Input
                        {...register('submitterEmail')}
                        placeholder="Correo del remitente (opcional)"
                        type="email"
                        className="bg-layer-1/50 border-subtle text-primary placeholder:text-placeholder"
                    />
                    {errors.submitterEmail && (
                        <p className="text-xs text-red-400">{errors.submitterEmail.message}</p>
                    )}
                    <Input
                        {...register('source')}
                        placeholder="Fuente (email, api, manual...)"
                        className="bg-layer-1/50 border-subtle text-primary placeholder:text-placeholder"
                    />
                    <div className="flex justify-end gap-2 pt-1">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            className="border-subtle text-tertiary"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="bg-accent-primary hover:bg-accent-primary-hover text-on-color"
                        >
                            {isPending ? 'Creando...' : 'Crear'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// --- List item card (compact) ---

interface ListItemCardProps {
    issue: IntakeIssue;
    isSelected: boolean;
    onClick: () => void;
}

function ListItemCard({ issue, isSelected, onClick }: ListItemCardProps): React.ReactElement {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'w-full text-left px-4 py-3 border-b border-subtle transition-colors',
                isSelected
                    ? 'bg-accent-subtle border-l-2 border-l-accent-primary'
                    : 'hover:bg-surface-2 border-l-2 border-l-transparent',
            )}
        >
            <p className="text-sm font-medium text-primary truncate mb-1">{issue.title}</p>
            <div className="flex items-center gap-2 flex-wrap">
                {issue.submitterEmail && (
                    <span className="text-xs text-placeholder truncate max-w-[140px]">{issue.submitterEmail}</span>
                )}
                {issue.source && (
                    <span className="text-xs bg-layer-1 text-tertiary px-1.5 py-0.5 rounded">
                        {issue.source}
                    </span>
                )}
                <span className="text-xs text-placeholder ml-auto shrink-0">{formatRelative(issue.createdAt)}</span>
            </div>
        </button>
    );
}

// --- Detail panel ---

interface DetailPanelProps {
    issue: IntakeIssue;
    onReview: (id: string, status: IntakeStatus, reason?: string) => void;
    onDelete: (id: string) => void;
    isPending: boolean;
}

function DetailPanel({ issue, onReview, onDelete, isPending }: DetailPanelProps): React.ReactElement {
    const [showDeclineInput, setShowDeclineInput] = useState(false);
    const [declineReason, setDeclineReason] = useState('');

    const handleDecline = (): void => {
        if (!declineReason.trim()) return;
        onReview(issue.id, 'Declined', declineReason);
        setShowDeclineInput(false);
        setDeclineReason('');
    };

    return (
        <div className="flex flex-col h-full overflow-y-auto">
            {/* Detail header */}
            <div className="px-6 py-4 border-b border-subtle shrink-0">
                <div className="flex items-start justify-between gap-3">
                    <h2 className="text-base font-semibold text-primary leading-snug">{issue.title}</h2>
                    <button
                        type="button"
                        onClick={() => onDelete(issue.id)}
                        disabled={isPending}
                        aria-label="Eliminar"
                        className="text-placeholder hover:text-red-400 transition-colors shrink-0 mt-0.5"
                    >
                        <Trash2 size={15} />
                    </button>
                </div>

                <div className="flex items-center gap-2 flex-wrap mt-2">
                    <span className={cn('text-xs px-2 py-0.5 rounded', STATUS_BADGE_CLASSES[issue.status])}>
                        {STATUS_LABELS[issue.status]}
                    </span>
                    {issue.source && (
                        <span className="text-xs bg-layer-1 text-tertiary px-2 py-0.5 rounded">
                            {issue.source}
                        </span>
                    )}
                    <span className="text-xs text-placeholder ml-auto">{formatRelative(issue.createdAt)}</span>
                </div>
            </div>

            {/* Properties */}
            <div className="px-6 py-4 border-b border-subtle space-y-2 shrink-0">
                {issue.submitterEmail && (
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-placeholder w-24 shrink-0">Remitente</span>
                        <span className="text-xs text-secondary">{issue.submitterEmail}</span>
                    </div>
                )}
                {issue.declineReason && (
                    <div className="flex items-start gap-2">
                        <span className="text-xs text-placeholder w-24 shrink-0">Motivo rechazo</span>
                        <span className="text-xs text-secondary">{issue.declineReason}</span>
                    </div>
                )}
            </div>

            {/* Description */}
            {issue.description && (
                <div className="px-6 py-4 border-b border-subtle shrink-0">
                    <p className="text-xs font-semibold text-placeholder uppercase tracking-wider mb-2">
                        Descripción
                    </p>
                    <p className="text-sm text-secondary leading-relaxed whitespace-pre-wrap">
                        {issue.description}
                    </p>
                </div>
            )}

            {/* Actions */}
            {issue.status === 'Pending' && (
                <div className="px-6 py-4 shrink-0 space-y-3">
                    <p className="text-xs font-semibold text-placeholder uppercase tracking-wider mb-3">
                        Acciones
                    </p>

                    {showDeclineInput ? (
                        <div className="flex gap-2">
                            <Input
                                value={declineReason}
                                onChange={(e) => setDeclineReason(e.target.value)}
                                placeholder="Motivo de rechazo..."
                                className="h-8 text-xs bg-layer-1/50 border-subtle text-primary"
                                onKeyDown={(e) => { if (e.key === 'Enter') handleDecline(); }}
                                autoFocus
                            />
                            <Button
                                size="sm"
                                onClick={handleDecline}
                                disabled={!declineReason.trim() || isPending}
                                className="h-8 px-3 bg-danger-primary hover:bg-danger-primary-hover text-on-color shrink-0"
                            >
                                <X size={13} />
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setShowDeclineInput(false)}
                                className="h-8 px-2 text-secondary"
                            >
                                Cancelar
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            <Button
                                size="sm"
                                onClick={() => onReview(issue.id, 'Accepted')}
                                disabled={isPending}
                                className="h-8 text-xs bg-success-primary text-on-color flex items-center gap-1.5"
                            >
                                <Check size={13} />
                                Aceptar
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowDeclineInput(true)}
                                disabled={isPending}
                                className="h-8 text-xs border-subtle text-tertiary hover:text-primary flex items-center gap-1.5"
                            >
                                <X size={13} />
                                Declinar
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onReview(issue.id, 'Duplicate')}
                                disabled={isPending}
                                className="h-8 text-xs border-subtle text-tertiary hover:text-primary flex items-center gap-1.5"
                            >
                                <Copy size={13} />
                                Duplicado
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// --- Empty state for detail ---

function DetailEmptyState(): React.ReactElement {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-subtle flex items-center justify-center mb-4">
                <Inbox size={24} className="text-placeholder" />
            </div>
            <h3 className="text-sm font-semibold text-secondary mb-1">
                Selecciona un item
            </h3>
            <p className="text-xs text-placeholder max-w-xs">
                Haz clic en un elemento de la lista para ver sus detalles y gestionar su estado.
            </p>
        </div>
    );
}

// --- Main page ---

export const InboxPage = (): React.ReactElement => {
    const { workspaceSlug = '', companyId = '' } = useParams<{
        workspaceSlug: string;
        companyId: string;
    }>();
    const [activeTab, setActiveTab] = useState<TabStatus>('Pending');
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const statusParam = activeTab === 'all' ? undefined : activeTab;
    const { data, isLoading } = useIntake(workspaceSlug, companyId, statusParam);
    const { mutate: review, isPending: isReviewing } = useReviewIntake(workspaceSlug, companyId);
    const { mutate: del, isPending: isDeleting } = useDeleteIntake(workspaceSlug, companyId);

    const items = data?.items ?? [];
    const selectedIssue = items.find((i) => i.id === selectedId) ?? null;

    const handleReview = (id: string, status: IntakeStatus, reason?: string): void => {
        review({ id, data: { status, declineReason: reason } });
    };

    const handleDelete = (id: string): void => {
        del(id);
        if (selectedId === id) setSelectedId(null);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Top header */}
            <div className="px-6 py-4 border-b border-subtle bg-canvas shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h1 className="text-lg font-semibold text-primary">Bandeja de entrada</h1>
                    {!isLoading && items.length > 0 && (
                        <span className="text-xs font-medium text-placeholder bg-layer-2 px-2 py-0.5 rounded-full">
                            {items.length}
                        </span>
                    )}
                </div>
                <CreateIntakeDialog workspaceSlug={workspaceSlug} companyId={companyId} />
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-subtle px-6 bg-canvas shrink-0">
                {TABS.map((tab) => (
                    <button
                        key={tab.value}
                        type="button"
                        onClick={() => { setActiveTab(tab.value); setSelectedId(null); }}
                        className={cn(
                            'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
                            activeTab === tab.value
                                ? 'border-primary text-blue-400'
                                : 'border-transparent text-placeholder hover:text-secondary',
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* 2-column body */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left column: list */}
                <div className="w-[360px] shrink-0 border-r border-subtle overflow-y-auto">
                    {isLoading ? (
                        <div className="space-y-0">
                            {(['l0', 'l1', 'l2', 'l3'] as const).map((k) => (
                                <div key={k} className="px-4 py-3 border-b border-subtle">
                                    <Skeleton className="h-4 w-3/4 bg-layer-1 mb-2" />
                                    <Skeleton className="h-3 w-1/2 bg-layer-1" />
                                </div>
                            ))}
                        </div>
                    ) : items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                            <div className="w-12 h-12 rounded-2xl bg-surface-2 border border-subtle flex items-center justify-center mb-3">
                                <Inbox size={20} className="text-placeholder" />
                            </div>
                            <h3 className="text-sm font-semibold text-secondary mb-1">
                                Sin items
                            </h3>
                            <p className="text-xs text-placeholder">
                                No hay solicitudes en este estado.
                            </p>
                        </div>
                    ) : (
                        items.map((issue: IntakeIssue) => (
                            <ListItemCard
                                key={issue.id}
                                issue={issue}
                                isSelected={selectedId === issue.id}
                                onClick={() => setSelectedId(issue.id)}
                            />
                        ))
                    )}
                </div>

                {/* Right column: detail */}
                <div className="flex-1 overflow-hidden bg-canvas">
                    {selectedIssue ? (
                        <DetailPanel
                            issue={selectedIssue}
                            onReview={handleReview}
                            onDelete={handleDelete}
                            isPending={isReviewing || isDeleting}
                        />
                    ) : (
                        <DetailEmptyState />
                    )}
                </div>
            </div>
        </div>
    );
};
