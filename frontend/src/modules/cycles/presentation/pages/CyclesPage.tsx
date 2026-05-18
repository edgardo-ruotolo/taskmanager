import type React from 'react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, RefreshCw, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { useCycles, useDeleteCycle, useCycleIssues, useAddCycleIssue, useRemoveCycleIssue } from '../../application/use-cycles';
import { CreateCycleDialog } from '../components/CreateCycleDialog';
import type { Cycle, CycleIssueRef } from '../../domain/types';
import { PRIORITY_LABELS } from '@/modules/issues/domain/types';
import type { IssuePriority } from '@/modules/issues/domain/types';

const STATUS_LABELS: Record<Cycle['status'], string> = {
    Draft: 'Borrador',
    Started: 'En curso',
    Completed: 'Completado',
};

const STATUS_CLASSES: Record<Cycle['status'], string> = {
    Draft: 'bg-layer-1 text-secondary',
    Started: 'bg-blue-900 text-blue-300',
    Completed: 'bg-green-900 text-green-300',
};

const formatDate = (date: string | null): string => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

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
        addIssue(trimmed, {
            onSuccess: () => setIssueIdInput(''),
        });
    };

    return (
        <div className="flex flex-col h-full">
            <SheetHeader className="mb-4">
                <SheetTitle className="text-primary">{cycle.name} — Tareas</SheetTitle>
                <p className="text-xs text-placeholder">
                    {formatDate(cycle.startDate)} → {formatDate(cycle.endDate)}
                </p>
            </SheetHeader>

            {/* Add issue */}
            <div className="flex gap-2 mb-4">
                <Input
                    value={issueIdInput}
                    onChange={(e) => setIssueIdInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddIssue()}
                    placeholder="ID de la tarea (UUID)"
                    className="bg-layer-1 border-subtle text-primary placeholder:text-placeholder text-sm"
                />
                <Button
                    size="sm"
                    onClick={handleAddIssue}
                    disabled={isAdding || !issueIdInput.trim()}
                    className="bg-accent-primary hover:bg-accent-primary-hover text-on-color shrink-0"
                >
                    <Plus size={14} />
                </Button>
            </div>

            {/* Issues list */}
            {isLoading && (
                <div className="space-y-2">
                    {(['sk-0', 'sk-1', 'sk-2'] as const).map((k) => (
                        <Skeleton key={k} className="h-14 w-full bg-surface-1" />
                    ))}
                </div>
            )}

            {!isLoading && issues.length === 0 && (
                <p className="text-sm text-placeholder italic py-4 text-center">
                    No hay tareas en este ciclo
                </p>
            )}

            {!isLoading && issues.length > 0 && (
                <div className="space-y-2 flex-1 overflow-y-auto">
                    {issues.map((ref: CycleIssueRef) => (
                        <div
                            key={ref.issueId}
                            className="flex items-start gap-3 p-3 bg-surface-1/50 border border-subtle rounded-lg"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-mono text-placeholder mb-0.5">
                                    ISS-{ref.issueSequenceId}
                                </p>
                                <p className="text-sm text-primary truncate">{ref.issueTitle}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span
                                        className="w-2 h-2 rounded-full shrink-0"
                                        style={{ backgroundColor: ref.stateColor }}
                                        aria-hidden="true"
                                    />
                                    <span className="text-xs text-placeholder">{ref.stateName}</span>
                                    <span className="text-xs text-placeholder">
                                        {PRIORITY_LABELS[ref.priority as IssuePriority]}
                                    </span>
                                </div>
                            </div>
                            <button
                                type="button"
                                disabled={isRemoving}
                                onClick={() => removeIssue(ref.issueId)}
                                className="text-placeholder hover:text-red-400 transition-colors shrink-0 mt-0.5"
                                aria-label="Quitar tarea del ciclo"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-4 pt-4 border-t border-subtle">
                <Button
                    variant="outline"
                    className="w-full border-subtle text-secondary hover:bg-layer-1-hover"
                    onClick={onClose}
                >
                    Cerrar
                </Button>
            </div>
        </div>
    );
};

export const CyclesPage = (): React.ReactElement => {
    const { workspaceSlug = '', companyId = '' } = useParams<{
        workspaceSlug: string;
        companyId: string;
    }>();

    const { data: cycles, isLoading } = useCycles(workspaceSlug, companyId);
    const { mutate: deleteCycle, isPending: isDeleting } = useDeleteCycle(workspaceSlug, companyId);
    const [selectedCycle, setSelectedCycle] = useState<Cycle | null>(null);

    const items = cycles ?? [];

    return (
        <div className="p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <p className="text-xs text-placeholder uppercase tracking-wider mb-1">
                            {workspaceSlug}
                        </p>
                        <h1 className="text-2xl font-bold text-primary">Ciclos</h1>
                    </div>
                    <CreateCycleDialog
                        workspaceSlug={workspaceSlug}
                        companyId={companyId}
                        trigger={
                            <Button className="bg-accent-primary hover:bg-accent-primary-hover text-on-color gap-2">
                                <Plus size={16} />
                                Nuevo Ciclo
                            </Button>
                        }
                    />
                </div>

                {isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(['sk-0', 'sk-1', 'sk-2'] as const).map((k) => (
                            <div
                                key={k}
                                className="bg-surface-1/50 border border-subtle rounded-lg p-5 space-y-3"
                            >
                                <Skeleton className="h-5 w-2/3 bg-layer-1" />
                                <Skeleton className="h-4 w-full bg-layer-1" />
                                <Skeleton className="h-6 w-24 bg-layer-1 rounded-full" />
                            </div>
                        ))}
                    </div>
                )}

                {!isLoading && items.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <RefreshCw size={48} className="text-placeholder mb-4" />
                        <h2 className="text-lg font-medium text-secondary mb-2">No hay ciclos aún</h2>
                        <p className="text-sm text-placeholder mb-6">
                            Crea el primer ciclo para esta empresa
                        </p>
                        <CreateCycleDialog
                            workspaceSlug={workspaceSlug}
                            companyId={companyId}
                            trigger={
                                <Button className="bg-accent-primary hover:bg-accent-primary-hover text-on-color gap-2">
                                    <Plus size={16} />
                                    Crear primer ciclo
                                </Button>
                            }
                        />
                    </div>
                )}

                {!isLoading && items.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {items.map((cycle) => (
                            <div
                                key={cycle.id}
                                className="relative bg-surface-1/50 border border-subtle rounded-lg p-5 hover:border-strong transition-colors flex flex-col gap-3"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedCycle(cycle)}
                                        className="font-semibold text-primary text-sm truncate flex-1 text-left after:absolute after:inset-0 after:rounded-lg focus-visible:ring-0 after:focus-visible:ring-2 after:focus-visible:ring-blue-600"
                                        aria-label={`Abrir ciclo ${cycle.name}`}
                                    >
                                        {cycle.name}
                                    </button>
                                    <button
                                        type="button"
                                        disabled={isDeleting}
                                        onClick={() => deleteCycle(cycle.id)}
                                        className="relative z-10 text-placeholder hover:text-red-400 transition-colors shrink-0"
                                        aria-label="Eliminar ciclo"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>

                                {cycle.description && (
                                    <p className="text-xs text-tertiary line-clamp-2">
                                        {cycle.description}
                                    </p>
                                )}

                                <div className="flex items-center gap-2 flex-wrap">
                                    <Badge className={`text-xs border-0 ${STATUS_CLASSES[cycle.status]}`}>
                                        {STATUS_LABELS[cycle.status]}
                                    </Badge>
                                    <span className="text-xs text-placeholder">
                                        {cycle.issueCount} issue{cycle.issueCount !== 1 ? 's' : ''}
                                    </span>
                                </div>

                                <div className="pt-2 border-t border-subtle text-xs text-placeholder space-y-0.5">
                                    <p>Inicio: {formatDate(cycle.startDate)}</p>
                                    <p>Fin: {formatDate(cycle.endDate)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Sheet open={!!selectedCycle} onOpenChange={(open) => !open && setSelectedCycle(null)}>
                <SheetContent
                    side="right"
                    className="w-96 bg-canvas border-subtle text-primary"
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
