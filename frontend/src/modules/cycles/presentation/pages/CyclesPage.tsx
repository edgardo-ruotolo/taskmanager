import type React from 'react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Eyebrow } from '@/components/ui/eyebrow';
import {
    useCycles,
    useDeleteCycle,
    useCycleIssues,
    useAddCycleIssue,
    useRemoveCycleIssue,
} from '../../application/use-cycles';
import { CreateCycleDialog } from '../components/CreateCycleDialog';
import type { Cycle, CycleIssueRef } from '../../domain/types';
import { PRIORITY_LABELS } from '@/modules/issues/domain/types';
import type { IssuePriority } from '@/modules/issues/domain/types';

const STATUS_LABEL: Record<Cycle['status'], string> = {
    Draft: '○ Próximo',
    Started: '● En curso',
    Completed: '✓ Cerrado',
};

const STATUS_CHIP: Record<Cycle['status'], string> = {
    Draft: 'bg-[color-mix(in_oklch,var(--brand-700)_10%,white)] text-[var(--brand-700)]',
    Started: 'bg-[color-mix(in_oklch,var(--brand-700)_15%,white)] text-[var(--brand-700)]',
    Completed: 'bg-[color-mix(in_oklch,var(--green-700)_12%,white)] text-[var(--green-700)]',
};

const PROGRESS_COLOR: Record<Cycle['status'], string> = {
    Draft: 'var(--neutral-400)',
    Started: 'var(--brand-700)',
    Completed: 'var(--green-700)',
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

interface CycleIssuesPanelProps {
    workspaceSlug: string;
    companyId: string;
    cycle: Cycle;
    onClose: () => void;
}

const CycleIssuesPanel = ({
    workspaceSlug,
    companyId,
    cycle,
    onClose,
}: CycleIssuesPanelProps): React.ReactElement => {
    const [issueIdInput, setIssueIdInput] = useState('');
    const { data: cycleIssues, isLoading } = useCycleIssues(workspaceSlug, companyId, cycle.id);
    const { mutate: addIssue, isPending: isAdding } = useAddCycleIssue(workspaceSlug, companyId, cycle.id);
    const { mutate: removeIssue, isPending: isRemoving } = useRemoveCycleIssue(workspaceSlug, companyId, cycle.id);

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

function BurndownSparkline(): React.ReactElement {
    const points: [number, number][] = [[0, 15], [30, 22], [60, 30], [90, 38], [120, 50], [150, 58], [180, 62], [210, 72]];
    return (
        <div>
            <Eyebrow className="text-[var(--text-on-dark-muted)] mb-2">Burndown</Eyebrow>
            <svg viewBox="0 0 240 120" className="w-full" role="img" aria-label="Burndown del ciclo activo">
                <defs>
                    <linearGradient id="bd-grad" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="var(--brand-700)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="var(--brand-700)" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <path d="M0 10 L240 110" stroke="var(--text-on-dark-muted)" strokeWidth="1" strokeDasharray="3 3" fill="none" />
                <path
                    d="M0 15 L30 22 L60 30 L90 38 L120 50 L150 58 L180 62 L210 72"
                    stroke="var(--brand-700)"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M0 15 L30 22 L60 30 L90 38 L120 50 L150 58 L180 62 L210 72 L210 120 L0 120 Z"
                    fill="url(#bd-grad)"
                />
                {points.map(([x, y]) => (
                    <circle
                        key={`pt-${x}`}
                        cx={x}
                        cy={y}
                        r="3"
                        fill="var(--brand-700)"
                        stroke="var(--neutral-1100)"
                        strokeWidth="1.5"
                    />
                ))}
                <path d="M210 72 L240 80" stroke="var(--brand-700)" strokeWidth="2" strokeDasharray="3 3" fill="none" />
                <text x="225" y="75" fontSize="9" fill="var(--text-on-dark-soft)" fontFamily="Geist Mono">FCST</text>
            </svg>
            <div className="flex justify-between mt-1">
                <span className="font-mono text-[9.5px] text-[var(--text-on-dark-muted)]">INICIO</span>
                <span className="font-mono text-[9.5px] text-[var(--text-on-dark-muted)]">FIN</span>
            </div>
        </div>
    );
}

export const CyclesPage = (): React.ReactElement => {
    const { workspaceSlug = '', companyId = '' } = useParams<{
        workspaceSlug: string;
        companyId: string;
    }>();

    const { data: cycles, isLoading } = useCycles(workspaceSlug, companyId);
    const { mutate: deleteCycle, isPending: isDeleting } = useDeleteCycle(workspaceSlug, companyId);
    const [selectedCycle, setSelectedCycle] = useState<Cycle | null>(null);

    const items = cycles ?? [];
    const activeCycle = items.find((c) => c.status === 'Started') ?? null;
    const otherCycles = items.filter((c) => c.status !== 'Started');
    const listCycles = activeCycle ? otherCycles : items;

    const heroStats: [string, string, string][] = [
        ['Issues', String(activeCycle?.issueCount ?? 0), 'total'],
        ['Estado', 'En curso', 'activo'],
        ['Inicio', activeCycle ? formatShortDate(activeCycle.startDate) : '—', 'fecha'],
        ['Fin', activeCycle ? formatShortDate(activeCycle.endDate) : '—', 'fecha'],
    ];

    return (
        <div className="h-full overflow-y-auto">
            <div className="mx-auto max-w-5xl px-10 py-8 flex flex-col gap-8">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <Eyebrow>Ciclos · {isLoading ? '…' : `${items.length} totales`}</Eyebrow>
                        <h1 className="mt-2 text-[56px] font-medium tracking-[-0.05em] leading-[0.95] text-[var(--neutral-1200)]">
                            El ritmo del trimestre.
                        </h1>
                        <p className="mt-2 text-[15px] text-[var(--neutral-600)] max-w-[600px]">
                            Organiza el trabajo en ciclos de tiempo definido para mantener el ritmo y medir el progreso.
                        </p>
                    </div>
                    <div className="shrink-0 mt-2">
                        <CreateCycleDialog
                            workspaceSlug={workspaceSlug}
                            companyId={companyId}
                            trigger={
                                <Button className="gap-2 bg-[var(--neutral-1200)] hover:bg-[var(--neutral-1000)] text-[var(--text-on-dark)]">
                                    <Plus size={14} />
                                    Nuevo ciclo
                                </Button>
                            }
                        />
                    </div>
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="space-y-4">
                        <Skeleton className="h-48 w-full rounded-lg bg-[var(--neutral-200)]" />
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
                            Crea el primer ciclo para esta empresa
                        </p>
                        <CreateCycleDialog
                            workspaceSlug={workspaceSlug}
                            companyId={companyId}
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
                    <div className="bg-[var(--neutral-1200)] text-[var(--text-on-dark)] p-8 rounded-[10px] relative overflow-hidden">
                        <div className="grid grid-cols-[2fr_1fr] gap-10 items-center">
                            <div>
                                <Eyebrow className="text-[var(--brand-700)]">● CICLO ACTIVO</Eyebrow>
                                <div className="text-[42px] font-medium tracking-[-0.04em] mt-2 leading-[1]">
                                    {activeCycle.name}
                                </div>
                                {activeCycle.description && (
                                    <div className="font-mono text-[12px] text-[var(--text-on-dark-muted)] mt-2 tracking-[0.08em] uppercase">
                                        {activeCycle.description}
                                    </div>
                                )}
                                <div className="flex gap-8 mt-7">
                                    {heroStats.map(([k, v, sub]) => (
                                        <div key={k}>
                                            <div className="font-mono text-[10px] text-[var(--text-on-dark-muted)] tracking-[0.12em] uppercase">
                                                {k}
                                            </div>
                                            <div className="text-[28px] font-medium tracking-[-0.03em] mt-1">{v}</div>
                                            <div className="text-[11px] text-[var(--text-on-dark-muted)] mt-0.5">{sub}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <BurndownSparkline />
                        </div>

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
                )}

                {/* Cycles list */}
                {!isLoading && items.length > 0 && (
                    <div>
                        <Eyebrow className="mb-3">
                            {activeCycle ? 'Próximos & cerrados' : 'Todos los ciclos'}
                        </Eyebrow>
                        <div className="bg-white border border-[var(--neutral-400)] rounded-lg overflow-hidden">
                            {listCycles.map((cycle, i) => {
                                // Fix #17: progress from status; Started shows 50% as approximation when backend doesn't return completedCount
                                const progressPct = cycle.status === 'Completed' ? 100 : cycle.status === 'Started' ? 50 : 0;
                                const doneCount = cycle.status === 'Completed' ? cycle.issueCount : 0;
                                return (
                                    <div
                                        key={cycle.id}
                                        className="grid items-center gap-4 px-5 py-[14px]"
                                        style={{
                                            gridTemplateColumns: '120px 1fr 200px 120px 72px 28px',
                                            borderTop: i === 0 ? 'none' : '1px solid var(--neutral-400)',
                                        }}
                                    >
                                        <span
                                            className={`inline-flex items-center px-2 py-0.5 rounded-full font-mono text-[10.5px] font-medium tracking-[0.04em] ${STATUS_CHIP[cycle.status]}`}
                                        >
                                            {STATUS_LABEL[cycle.status]}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() => setSelectedCycle(cycle)}
                                            className="text-[14.5px] font-medium tracking-[-0.015em] text-[var(--neutral-1200)] truncate text-left hover:text-[var(--brand-700)] transition-colors"
                                        >
                                            {cycle.name}
                                        </button>

                                        <span className="font-mono text-[11px] text-[var(--neutral-600)]">
                                            {formatDate(cycle.startDate)} — {formatDate(cycle.endDate)}
                                        </span>

                                        <div className="h-1 bg-[var(--neutral-300)] rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full"
                                                style={{
                                                    width: `${progressPct}%`,
                                                    background: PROGRESS_COLOR[cycle.status],
                                                }}
                                            />
                                        </div>

                                        <span className="font-mono text-[11.5px] text-[var(--neutral-600)] tabular-nums">
                                            {doneCount}/{cycle.issueCount}
                                        </span>

                                        <button
                                            type="button"
                                            disabled={isDeleting}
                                            onClick={() => deleteCycle(cycle.id)}
                                            aria-label={`Eliminar ciclo ${cycle.name}`}
                                            className="text-[var(--neutral-500)] hover:text-red-500 transition-colors disabled:opacity-40"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            <Sheet open={!!selectedCycle} onOpenChange={(open) => !open && setSelectedCycle(null)}>
                <SheetContent
                    side="right"
                    className="w-96 bg-white border-[var(--neutral-400)] text-[var(--neutral-1200)]"
                >
                    {selectedCycle && (
                        <CycleIssuesPanel
                            workspaceSlug={workspaceSlug}
                            companyId={companyId}
                            cycle={selectedCycle}
                            onClose={() => setSelectedCycle(null)}
                        />
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
};
