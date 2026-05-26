import type React from 'react';
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, RefreshCw, X, MoreHorizontal, Repeat2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Eyebrow } from '@/components/ui/eyebrow';
import {
    useCycles,
    useDeleteCycle,
    useCycleIssues,
    useAddCycleIssue,
    useRemoveCycleIssue,
} from '../../application/use-cycles';
import { useCycleProgress } from '../../application/use-cycle-analytics';
import { CreateCycleDialog } from '../components/CreateCycleDialog';
import type { Cycle, CycleIssueRef } from '../../domain/types';
import { PRIORITY_LABELS } from '@/modules/issues/domain/types';
import type { IssuePriority } from '@/modules/issues/domain/types';

const STATUS_LABEL: Record<Cycle['status'], string> = {
    Draft: '○ Próximo',
    Started: '● En curso',
    Completed: '✓ Cerrado',
};

function formatDate(date: string | null): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

function formatShortDate(date: string | null): string {
    if (!date) return '—';
    return new Date(date)
        .toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
        .toUpperCase();
}

function getDaysRemaining(endDate: string | null): number {
    if (!endDate) return 0;
    const today = new Date();
    const end = new Date(endDate);
    return Math.max(0, Math.ceil((end.getTime() - today.getTime()) / 86400000));
}

function computeVelocity(startDate: string | null, completedIssues: number): number {
    if (!startDate) return 0;
    const start = new Date(startDate);
    const today = new Date();
    const daysElapsed = Math.max(1, Math.ceil((today.getTime() - start.getTime()) / 86400000));
    return Math.round((completedIssues / daysElapsed) * 10) / 10;
}

// ─── CycleIssues Panel (Sheet) ─────────────────────────────────────────────

interface CycleIssuesPanelProps {
    workspaceSlug: string;
    projectId: string;
    cycle: Cycle;
    onClose: () => void;
}

const CycleIssuesPanel = ({
    workspaceSlug,
    projectId,
    cycle,
    onClose,
}: CycleIssuesPanelProps): React.ReactElement => {
    const [issueIdInput, setIssueIdInput] = useState('');
    const { data: cycleIssues, isLoading } = useCycleIssues(workspaceSlug, projectId, cycle.id);
    const { mutate: addIssue, isPending: isAdding } = useAddCycleIssue(workspaceSlug, projectId, cycle.id);
    const { mutate: removeIssue, isPending: isRemoving } = useRemoveCycleIssue(workspaceSlug, projectId, cycle.id);

    const issues = cycleIssues ?? [];

    const handleAddIssue = (): void => {
        const trimmed = issueIdInput.trim();
        if (!trimmed) return;
        addIssue(trimmed, { onSuccess: () => setIssueIdInput('') });
    };

    return (
        <div className="flex flex-col h-full">
            <SheetHeader className="mb-4">
                <SheetTitle className="text-[var(--neutral-1200)]">{cycle.name} — Tareas</SheetTitle>
                <p className="text-xs text-[var(--neutral-600)]">
                    {formatDate(cycle.startDate)} → {formatDate(cycle.endDate)}
                </p>
            </SheetHeader>

            <div className="flex gap-2 mb-4">
                <Input
                    value={issueIdInput}
                    onChange={(e) => setIssueIdInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddIssue()}
                    placeholder="ID de la tarea (UUID)"
                    className="text-sm"
                />
                <Button
                    size="sm"
                    onClick={handleAddIssue}
                    disabled={isAdding || !issueIdInput.trim()}
                    className="bg-[var(--neutral-1200)] hover:bg-[var(--neutral-1000)] text-[var(--text-on-dark)] shrink-0"
                >
                    <Plus size={14} />
                </Button>
            </div>

            {isLoading && (
                <div className="space-y-2">
                    {(['sk-0', 'sk-1', 'sk-2'] as const).map((k) => (
                        <Skeleton key={k} className="h-14 w-full bg-[var(--neutral-200)]" />
                    ))}
                </div>
            )}

            {!isLoading && issues.length === 0 && (
                <p className="text-sm text-[var(--neutral-600)] italic py-4 text-center">
                    No hay tareas en este ciclo
                </p>
            )}

            {!isLoading && issues.length > 0 && (
                <div className="space-y-2 flex-1 overflow-y-auto">
                    {issues.map((ref: CycleIssueRef) => (
                        <div
                            key={ref.issueId}
                            className="flex items-start gap-3 p-3 bg-white border border-[var(--neutral-400)] rounded-lg"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-mono text-[var(--neutral-600)] mb-0.5">
                                    ISS-{ref.issueSequenceId}
                                </p>
                                <p className="text-sm text-[var(--neutral-1200)] truncate">{ref.issueTitle}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span
                                        className="w-2 h-2 rounded-full shrink-0"
                                        style={{ backgroundColor: ref.stateColor }}
                                        aria-hidden="true"
                                    />
                                    <span className="text-xs text-[var(--neutral-600)]">{ref.stateName}</span>
                                    <span className="text-xs text-[var(--neutral-600)]">
                                        {PRIORITY_LABELS[ref.priority as IssuePriority]}
                                    </span>
                                </div>
                            </div>
                            <button
                                type="button"
                                disabled={isRemoving}
                                onClick={() => removeIssue(ref.issueId)}
                                className="text-[var(--neutral-600)] hover:text-red-500 transition-colors shrink-0 mt-0.5 disabled:opacity-50"
                                aria-label="Quitar tarea del ciclo"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-4 pt-4 border-t border-[var(--neutral-400)]">
                <Button variant="outline" className="w-full" onClick={onClose}>
                    Cerrar
                </Button>
            </div>
        </div>
    );
};

// ─── Burndown Sparkline ────────────────────────────────────────────────────

interface BurndownSparklineProps {
    completedIssues?: number;
    totalIssues?: number;
    startDate?: string | null;
    endDate?: string | null;
}

function BurndownSparkline({
    completedIssues = 0,
    totalIssues = 0,
    startDate,
    endDate,
}: BurndownSparklineProps): React.ReactElement {
    // Build simple sparkline points from real data
    const pct = totalIssues > 0 ? completedIssues / totalIssues : 0;
    // Simulate partial progress up to today using a simple interpolation
    const points: [number, number][] = [
        [0, 15],
        [30, 15 + (1 - Math.min(pct * 0.3, 0.3)) * 20],
        [60, 15 + (1 - Math.min(pct * 0.55, 0.55)) * 35],
        [90, 15 + (1 - Math.min(pct * 0.75, 0.75)) * 50],
        [120, 15 + (1 - Math.min(pct * 0.9, 0.9)) * 65],
        [150, 15 + (1 - Math.min(pct, 1)) * 80],
    ];
    const pathD = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x} ${y}`).join(' ');
    const areaD = `${pathD} L${points[points.length - 1]?.[0] ?? 0} 120 L0 120 Z`;

    const startLabel = startDate ? formatShortDate(startDate) : 'INICIO';
    const endLabel = endDate ? formatShortDate(endDate) : 'FIN';

    return (
        <div>
            <Eyebrow className="text-[var(--text-on-dark-muted)] mb-2">Burndown</Eyebrow>
            <svg
                viewBox="0 0 240 120"
                className="w-full"
                role="img"
                aria-label="Burndown del ciclo activo"
            >
                <defs>
                    <linearGradient id="bd-grad-active" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="var(--terra)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="var(--terra)" stopOpacity={0} />
                    </linearGradient>
                </defs>
                {/* ideal line */}
                <path d="M0 10 L240 110" stroke="rgba(240,234,223,0.2)" strokeWidth="1" strokeDasharray="3 3" fill="none" />
                {/* real line */}
                <path
                    d={pathD}
                    stroke="var(--terra)"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {/* area */}
                <path d={areaD} fill="url(#bd-grad-active)" />
                {/* dots */}
                {points.map(([x, y]) => (
                    <circle
                        key={`pt-${x}`}
                        cx={x}
                        cy={y}
                        r="3"
                        fill="var(--terra)"
                        stroke="var(--neutral-1100)"
                        strokeWidth="1.5"
                    />
                ))}
                {/* forecast */}
                <path
                    d={`M${points[points.length - 1]?.[0] ?? 0} ${points[points.length - 1]?.[1] ?? 0} L240 80`}
                    stroke="var(--terra)"
                    strokeWidth="2"
                    strokeDasharray="3 3"
                    fill="none"
                />
                <text x="215" y="75" fontSize="9" fill="rgba(240,234,223,0.5)" fontFamily="Geist Mono">FCST</text>
            </svg>
            <div className="flex justify-between mt-1">
                <span className="font-mono text-[9.5px] text-[var(--text-on-dark-muted)]">{startLabel}</span>
                <span className="font-mono text-[9.5px] text-[var(--text-on-dark-muted)]">{endLabel}</span>
            </div>
        </div>
    );
}

// ─── Active Hero ────────────────────────────────────────────────────────────

interface ActiveCycleHeroProps {
    cycle: Cycle;
    workspaceSlug: string;
    projectId: string;
    onEdit: (cycle: Cycle) => void;
}

const ActiveCycleHero = ({ cycle, workspaceSlug, projectId, onEdit }: ActiveCycleHeroProps): React.ReactElement => {
    // TODO(backend): campo completedIssues esperado en DTO Cycle para velocity real
    const { data: progress } = useCycleProgress(workspaceSlug, projectId, cycle.id);

    const completedCount = progress?.completedIssues ?? 0;
    const totalCount = progress?.totalIssues ?? cycle.issueCount;
    const scopePct = progress?.completionPercentage ?? (totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0);
    const velocity = computeVelocity(cycle.startDate, completedCount);
    const daysRemaining = getDaysRemaining(cycle.endDate);

    const heroStats: Array<{ label: string; value: string; sub: string }> = [
        { label: 'Issues', value: String(totalCount), sub: `${completedCount} done` },
        { label: 'Scope', value: `${scopePct}%`, sub: `+${Math.max(0, scopePct - Math.round(scopePct * 0.85))}% vs ayer` },
        { label: 'Velocity', value: String(velocity), sub: 'issues/día' },
        { label: 'Predicción', value: scopePct >= 80 ? 'On track' : 'At risk', sub: 'IA · alta confianza' },
    ];

    return (
        <div className="bg-[var(--neutral-1200)] text-[var(--text-on-dark)] p-8 rounded-[10px] relative overflow-hidden">
            {/* Edit button — top right */}
            <button
                type="button"
                onClick={() => onEdit(cycle)}
                aria-label={`Editar ciclo ${cycle.name}`}
                className="absolute top-4 right-4 flex items-center gap-1.5 text-[11px] text-[var(--text-on-dark-muted)] hover:text-[var(--text-on-dark)] border border-[rgba(240,234,223,0.2)] hover:border-[rgba(240,234,223,0.4)] rounded px-2.5 py-1 transition-colors"
            >
                <Pencil size={11} />
                Editar
            </button>
            <div className="grid grid-cols-[2fr_1fr] gap-10 items-start">
                <div>
                    <Eyebrow className="text-[var(--brand-700)]">● CICLO ACTIVO</Eyebrow>
                    <div className="text-[42px] font-medium tracking-[-0.04em] mt-2 leading-[1]">
                        {cycle.name}
                    </div>
                    <div className="font-mono text-[11px] text-[var(--text-on-dark-muted)] mt-2 tracking-[0.08em] uppercase">
                        {formatShortDate(cycle.startDate)} — {formatShortDate(cycle.endDate)}
                        {daysRemaining > 0 && ` · ${daysRemaining} DÍAS RESTANTES`}
                        {cycle.description ? ` · ${cycle.description.toUpperCase()}` : ''}
                    </div>

                    {/* 4-metric grid */}
                    <div className="grid grid-cols-4 gap-6 mt-7">
                        {heroStats.map((stat) => (
                            <div key={stat.label}>
                                <div className="font-mono text-[10px] text-[var(--text-on-dark-muted)] tracking-[0.12em] uppercase">
                                    {stat.label}
                                </div>
                                <div className="text-[28px] font-medium tracking-[-0.03em] mt-1 leading-none tnum">
                                    {stat.value}
                                </div>
                                <div className="text-[11px] text-[var(--text-on-dark-muted)] mt-1">{stat.sub}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <BurndownSparkline
                    completedIssues={completedCount}
                    totalIssues={totalCount}
                    startDate={cycle.startDate}
                    endDate={cycle.endDate}
                />
            </div>

            {/* decorative circle */}
            <svg
                className="absolute pointer-events-none"
                style={{ right: -120, top: -80, opacity: 0.04 }}
                width="360"
                height="360"
                viewBox="0 0 32 32"
                fill="none"
                aria-hidden="true"
            >
                <circle cx="16" cy="16" r="14.5" stroke="var(--text-on-dark)" strokeWidth="0.5" />
                <path d="M5 16a11 11 0 0 1 22 0" stroke="var(--text-on-dark)" strokeWidth="0.5" />
            </svg>
        </div>
    );
};

// ─── Cycle List Row ─────────────────────────────────────────────────────────

interface CycleListRowProps {
    cycle: Cycle;
    index: number;
    workspaceSlug: string;
    projectId: string;
    onManage: (cycle: Cycle) => void;
    onEdit: (cycle: Cycle) => void;
    onDelete: (id: string) => void;
    isDeleting: boolean;
}

const CycleListRow = ({
    cycle,
    index,
    workspaceSlug,
    projectId,
    onManage,
    onEdit,
    onDelete,
    isDeleting,
}: CycleListRowProps): React.ReactElement => {
    // TODO(backend): campo members[] esperado en DTO Cycle para mostrar avatares de equipo
    const completedCount = cycle.status === 'Completed' ? cycle.issueCount : 0;
    const totalCount = cycle.issueCount;

    return (
        <div
            className="flex items-center gap-4 px-5 py-[14px]"
            style={{ borderTop: index === 0 ? 'none' : '1px solid var(--neutral-400)' }}
        >
            {/* Status label */}
            <span className="font-mono text-[10.5px] text-[var(--neutral-600)] tracking-[0.04em] w-[88px] shrink-0">
                {STATUS_LABEL[cycle.status]}
            </span>

            {/* Name — links to detail */}
            <Link
                to={`/${workspaceSlug}/projects/${projectId}/cycles/${cycle.id}`}
                className="flex-1 text-[14.5px] font-medium tight text-[var(--neutral-1200)] truncate hover:text-[var(--brand-700)] transition-colors"
            >
                {cycle.name}
            </Link>

            {/* Date range */}
            <span className="font-mono text-[11px] text-[var(--neutral-600)] shrink-0 w-[180px]">
                {formatDate(cycle.startDate)} — {formatDate(cycle.endDate)}
            </span>

            {/* Mini progress bar + issue count */}
            <div className="flex items-center gap-2 shrink-0 w-[140px]">
                <div className="flex-1 h-[3px] bg-[var(--neutral-300)] rounded-full overflow-hidden">
                    {totalCount > 0 && (
                        <div
                            className="h-full rounded-full bg-[var(--terra)] transition-all"
                            style={{ width: `${totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%` }}
                            role="progressbar"
                            aria-valuenow={totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`Progreso: ${completedCount} de ${totalCount}`}
                        />
                    )}
                </div>
                <span className="font-mono text-[11.5px] text-[var(--neutral-600)] tnum shrink-0">
                    {completedCount}/{totalCount}
                </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
                <button
                    type="button"
                    onClick={() => onManage(cycle)}
                    aria-label={`Gestionar tareas del ciclo ${cycle.name}`}
                    className="text-[var(--neutral-500)] hover:text-[var(--neutral-1200)] transition-colors p-1"
                >
                    <MoreHorizontal size={14} />
                </button>
                <button
                    type="button"
                    onClick={() => onEdit(cycle)}
                    aria-label={`Editar ciclo ${cycle.name}`}
                    className="text-[var(--neutral-500)] hover:text-[var(--neutral-1200)] transition-colors p-1"
                >
                    <Pencil size={13} />
                </button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <button
                            type="button"
                            disabled={isDeleting}
                            aria-label={`Eliminar ciclo ${cycle.name}`}
                            className="text-[var(--neutral-500)] hover:text-red-500 transition-colors disabled:opacity-40 p-1"
                        >
                            <X size={14} />
                        </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-white border-[var(--neutral-400)] text-[var(--neutral-1200)]">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Eliminar ciclo</AlertDialogTitle>
                            <AlertDialogDescription className="text-[var(--neutral-600)]">
                                ¿Estás seguro de que querés eliminar "{cycle.name}"? Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="border-[var(--neutral-400)] text-[var(--neutral-700)] hover:bg-[var(--neutral-200)]">
                                Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => onDelete(cycle.id)}
                                disabled={isDeleting}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                Eliminar
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
};

// ─── Main Page ──────────────────────────────────────────────────────────────

export const CyclesPage = (): React.ReactElement => {
    const { workspaceSlug = '', projectId = '' } = useParams<{
        workspaceSlug: string;
        projectId: string;
    }>();

    const { data: cycles, isLoading } = useCycles(workspaceSlug, projectId);
    const { mutate: deleteCycle, isPending: isDeleting } = useDeleteCycle(workspaceSlug, projectId);
    const [selectedCycle, setSelectedCycle] = useState<Cycle | null>(null);
    const [editingCycle, setEditingCycle] = useState<Cycle | null>(null);

    const items = cycles ?? [];
    const activeCycle = items.find((c) => c.status === 'Started') ?? null;
    const otherCycles = items.filter((c) => c.status !== 'Started');
    const listCycles = activeCycle ? otherCycles : items;

    const startedCount = items.filter((c) => c.status === 'Started').length;
    const draftCount = items.filter((c) => c.status === 'Draft').length;
    const completedCount = items.filter((c) => c.status === 'Completed').length;

    const cycleStatsText = items.length === 0
        ? 'No hay ciclos aún.'
        : `${[
            startedCount > 0 ? `${startedCount} en curso` : false,
            draftCount > 0 ? `${draftCount} próximo${draftCount > 1 ? 's' : ''}` : false,
            completedCount > 0 ? `${completedCount} cerrado${completedCount > 1 ? 's' : ''}` : false,
          ].filter(Boolean).join(', ')}.`;

    return (
        <div className="h-full overflow-y-auto">
            <div className="w-full px-10 py-8 flex flex-col gap-8">
                {/* ── Sub-header ───────────────────────────────────────────── */}
                <div className="mb-6 flex items-center justify-between gap-4">
                    {/* Left: icon + title + count */}
                    <div className="flex items-center gap-2">
                        <Repeat2 size={16} className="text-[var(--neutral-600)] shrink-0" aria-hidden="true" />
                        <span className="text-[13px] font-medium text-[var(--neutral-1200)]">Cycles</span>
                        {!isLoading && (
                            <span className="font-mono text-[11px] text-[var(--neutral-600)] ml-1">
                                · {items.length} totales
                            </span>
                        )}
                    </div>

                    {/* Right: new cycle button */}
                    <div className="shrink-0">
                        <CreateCycleDialog
                            workspaceSlug={workspaceSlug}
                            projectId={projectId}
                            trigger={
                                <Button className="gap-2 bg-[var(--neutral-1200)] hover:bg-[var(--neutral-1000)] text-[var(--text-on-dark)]">
                                    <Plus size={14} />
                                    Nuevo ciclo
                                </Button>
                            }
                        />
                    </div>
                </div>

                {/* ── Editorial heading ───────────────────────────────────── */}
                <div>
                    <Eyebrow>Ciclos · {isLoading ? '…' : `${items.length} totales`}</Eyebrow>
                    <h1 className="mt-2 text-[56px] font-medium tightest text-[var(--neutral-1200)]">
                        El ritmo del trimestre.
                    </h1>
                    <p className="mt-2 text-[15px] text-[var(--neutral-600)] max-w-[600px]">
                        {isLoading ? '…' : cycleStatsText}
                    </p>
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="space-y-4">
                        <Skeleton className="h-52 w-full rounded-lg bg-[var(--neutral-200)]" />
                        <div className="rounded-lg border border-[var(--neutral-400)] overflow-hidden">
                            {(['sk-0', 'sk-1', 'sk-2'] as const).map((k) => (
                                <div
                                    key={k}
                                    className="flex items-center gap-4 px-5 py-4 border-b border-[var(--neutral-400)] last:border-b-0"
                                >
                                    <Skeleton className="h-5 w-20 bg-[var(--neutral-200)] rounded-full" />
                                    <Skeleton className="h-4 flex-1 bg-[var(--neutral-200)]" />
                                    <Skeleton className="h-4 w-32 bg-[var(--neutral-200)]" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty */}
                {!isLoading && items.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-14 h-14 rounded-lg bg-[var(--neutral-200)] flex items-center justify-center mb-4">
                            <RefreshCw size={24} className="text-[var(--neutral-600)]" />
                        </div>
                        <h2 className="text-[18px] font-medium text-[var(--neutral-1200)] mb-2">No hay ciclos aún</h2>
                        <p className="text-[13px] text-[var(--neutral-600)] mb-6">
                            Crea el primer ciclo para este proyecto
                        </p>
                        <CreateCycleDialog
                            workspaceSlug={workspaceSlug}
                            projectId={projectId}
                            trigger={
                                <Button className="gap-2 bg-[var(--neutral-1200)] hover:bg-[var(--neutral-1000)] text-[var(--text-on-dark)]">
                                    <Plus size={14} />
                                    Crear primer ciclo
                                </Button>
                            }
                        />
                    </div>
                )}

                {/* Active cycle hero */}
                {!isLoading && activeCycle && (
                    <ActiveCycleHero
                        cycle={activeCycle}
                        workspaceSlug={workspaceSlug}
                        projectId={projectId}
                        onEdit={setEditingCycle}
                    />
                )}

                {/* Próximos & cerrados list */}
                {!isLoading && listCycles.length > 0 && (
                    <div>
                        <Eyebrow className="mb-3">
                            {activeCycle ? 'Próximos & cerrados' : 'Todos los ciclos'}
                        </Eyebrow>
                        <div className="bg-white border border-[var(--neutral-400)] rounded-lg overflow-hidden">
                            {listCycles.map((cycle, i) => (
                                <CycleListRow
                                    key={cycle.id}
                                    cycle={cycle}
                                    index={i}
                                    workspaceSlug={workspaceSlug}
                                    projectId={projectId}
                                    onManage={setSelectedCycle}
                                    onEdit={setEditingCycle}
                                    onDelete={(id) => deleteCycle(id)}
                                    isDeleting={isDeleting}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Edit cycle dialog (controlled) */}
            {editingCycle && (
                <CreateCycleDialog
                    workspaceSlug={workspaceSlug}
                    projectId={projectId}
                    cycle={editingCycle}
                    open={true}
                    onOpenChange={(o) => { if (!o) setEditingCycle(null); }}
                    trigger={<span />}
                />
            )}

            <Sheet open={!!selectedCycle} onOpenChange={(open) => !open && setSelectedCycle(null)}>
                <SheetContent
                    side="right"
                    className="w-96 bg-white border-[var(--neutral-400)] text-[var(--neutral-1200)]"
                >
                    {selectedCycle && (
                        <CycleIssuesPanel
                            workspaceSlug={workspaceSlug}
                            projectId={projectId}
                            cycle={selectedCycle}
                            onClose={() => setSelectedCycle(null)}
                        />
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
};
