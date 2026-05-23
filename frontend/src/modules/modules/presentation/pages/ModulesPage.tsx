import type React from 'react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Layers, X, Trash2 } from 'lucide-react';
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
    useModules,
    useDeleteModule,
    useModuleIssues,
    useAddModuleIssue,
    useRemoveModuleIssue,
} from '../../application/use-modules';
import { CreateModuleDialog } from '../components/CreateModuleDialog';
import type { Module, ModuleIssueRef } from '../../domain/types';
import { PRIORITY_LABELS } from '@/modules/issues/domain/types';
import type { IssuePriority } from '@/modules/issues/domain/types';

const ACCENT_COLORS = [
    'var(--brand-700)',
    'var(--amber-700)',
    'var(--green-700)',
    '#6b6298',
    'var(--neutral-1200)',
] as const;

const STATUS_LABELS: Record<Module['status'], string> = {
    Backlog: 'Backlog',
    InProgress: 'En progreso',
    Paused: 'Pausado',
    Completed: '✓ Completado',
    Archived: 'Archivado',
};

const STATUS_CHIP: Record<Module['status'], string> = {
    Backlog: 'bg-[var(--neutral-200)] text-[var(--neutral-900)]',
    InProgress: 'bg-[color-mix(in_oklch,var(--brand-700)_12%,white)] text-[var(--brand-700)]',
    Paused: 'bg-[color-mix(in_oklch,var(--amber-700)_12%,white)] text-[var(--amber-700)]',
    Completed: 'bg-[color-mix(in_oklch,var(--green-700)_12%,white)] text-[var(--green-700)]',
    Archived: 'bg-[var(--neutral-200)] text-[var(--neutral-600)]',
};

const PROGRESS_PCT: Record<Module['status'], number> = {
    Backlog: 0,
    InProgress: 40,
    Paused: 20,
    Completed: 100,
    Archived: 100,
};

interface ModuleIssuesPanelProps {
    workspaceSlug: string;
    projectId: string;
    module: Module;
    onClose: () => void;
}

const ModuleIssuesPanel = ({
    workspaceSlug,
    projectId,
    module,
    onClose,
}: ModuleIssuesPanelProps): React.ReactElement => {
    const [issueIdInput, setIssueIdInput] = useState('');
    const { data: moduleIssues, isLoading } = useModuleIssues(workspaceSlug, projectId, module.id);
    const { mutate: addIssue, isPending: isAdding } = useAddModuleIssue(workspaceSlug, projectId, module.id);
    const { mutate: removeIssue, isPending: isRemoving } = useRemoveModuleIssue(workspaceSlug, projectId, module.id);

    const issues = moduleIssues ?? [];

    const handleAddIssue = (): void => {
        const trimmed = issueIdInput.trim();
        if (!trimmed) return;
        addIssue(trimmed, { onSuccess: () => setIssueIdInput('') });
    };

    return (
        <div className="flex flex-col h-full">
            <SheetHeader className="mb-4">
                <SheetTitle className="text-[var(--neutral-1200)]">{module.name} — Tareas</SheetTitle>
                <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full font-mono text-[10px] font-medium w-fit ${STATUS_CHIP[module.status]}`}
                >
                    {STATUS_LABELS[module.status]}
                </span>
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
                    className="bg-[var(--neutral-1200)] hover:bg-[var(--neutral-1000)] text-[#f0eadf] shrink-0"
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
                    No hay tareas en este módulo
                </p>
            )}

            {!isLoading && issues.length > 0 && (
                <div className="space-y-2 flex-1 overflow-y-auto">
                    {issues.map((ref: ModuleIssueRef) => (
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
                                aria-label="Quitar tarea del módulo"
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

export const ModulesPage = (): React.ReactElement => {
    const { workspaceSlug = '', projectId = '' } = useParams<{
        workspaceSlug: string;
        projectId: string;
    }>();

    const { data: modules, isLoading } = useModules(workspaceSlug, projectId);
    const { mutate: deleteModule, isPending: isDeleting } = useDeleteModule(workspaceSlug, projectId);
    const [selectedModule, setSelectedModule] = useState<Module | null>(null);

    const items = modules ?? [];

    return (
        <div className="h-full overflow-y-auto">
            <div className="mx-auto max-w-5xl px-10 py-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <Eyebrow>Modules · agrupación temática</Eyebrow>
                        <h1 className="mt-2 text-[56px] font-medium tracking-[-0.05em] leading-[0.95] text-[var(--neutral-1200)]">
                            Módulos del cierre.
                        </h1>
                        <p className="mt-2 text-[15px] text-[var(--neutral-600)] max-w-[600px]">
                            Mientras los ciclos miden tiempo, los módulos miden alcance. Cada uno agrupa issues
                            relacionadas por capacidad o entregable.
                        </p>
                    </div>
                    <div className="shrink-0 mt-2">
                        <CreateModuleDialog
                            workspaceSlug={workspaceSlug}
                            projectId={projectId}
                            trigger={
                                <Button className="gap-2 bg-[var(--neutral-1200)] hover:bg-[var(--neutral-1000)] text-[#f0eadf]">
                                    <Plus size={14} />
                                    Nuevo módulo
                                </Button>
                            }
                        />
                    </div>
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="grid grid-cols-3 gap-4">
                        {(['sk-0', 'sk-1', 'sk-2', 'sk-3', 'sk-4', 'sk-5'] as const).map((k) => (
                            <div key={k} className="bg-white border border-[var(--neutral-400)] rounded-lg p-[18px] space-y-3">
                                <Skeleton className="h-4 w-2/3 bg-[var(--neutral-200)]" />
                                <Skeleton className="h-3 w-full bg-[var(--neutral-200)]" />
                                <Skeleton className="h-8 w-16 bg-[var(--neutral-200)]" />
                                <Skeleton className="h-1 w-full bg-[var(--neutral-200)]" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty */}
                {!isLoading && items.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-14 h-14 rounded-lg bg-[var(--neutral-200)] flex items-center justify-center mb-4">
                            <Layers size={24} className="text-[var(--neutral-600)]" />
                        </div>
                        <h2 className="text-[18px] font-medium text-[var(--neutral-1200)] mb-2">No hay módulos aún</h2>
                        <p className="text-[13px] text-[var(--neutral-600)] mb-6">
                            Crea el primer módulo para esta proyecto
                        </p>
                        <CreateModuleDialog
                            workspaceSlug={workspaceSlug}
                            projectId={projectId}
                            trigger={
                                <Button className="gap-2 bg-[var(--neutral-1200)] hover:bg-[var(--neutral-1000)] text-[#f0eadf]">
                                    <Plus size={14} />
                                    Crear primer módulo
                                </Button>
                            }
                        />
                    </div>
                )}

                {/* Grid */}
                {!isLoading && items.length > 0 && (
                    <div className="grid grid-cols-3 gap-4">
                        {items.map((mod, index) => {
                            const accent = ACCENT_COLORS[index % ACCENT_COLORS.length] ?? 'var(--brand-700)';
                            const pct = PROGRESS_PCT[mod.status];
                            const doneCount = mod.status === 'Completed' || mod.status === 'Archived' ? mod.issueCount : 0;
                            const initials = mod.name.slice(0, 2).toUpperCase();

                            return (
                                <div
                                    key={mod.id}
                                    className="group relative bg-white p-[18px] rounded-lg border border-[var(--neutral-400)] flex flex-col gap-3 overflow-hidden hover:border-[var(--neutral-700)] transition-colors"
                                >
                                    {/* Top accent bar */}
                                    <span
                                        className="absolute top-0 left-0 w-6 h-[3px]"
                                        style={{ background: accent }}
                                        aria-hidden="true"
                                    />

                                    {/* Name + description + chip + delete */}
                                    <div className="flex items-start justify-between gap-2 mt-1">
                                        <div className="min-w-0 flex-1">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedModule(mod)}
                                                className="text-[16px] font-medium tracking-[-0.02em] text-[var(--neutral-1200)] text-left w-full truncate after:absolute after:inset-0 focus-visible:outline-none"
                                                aria-label={`Abrir módulo ${mod.name}`}
                                            >
                                                {mod.name}
                                            </button>
                                            {mod.description && (
                                                <div className="text-[12px] text-[var(--neutral-600)] mt-0.5 leading-[1.45] line-clamp-2">
                                                    {mod.description}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0 relative z-10">
                                            <span
                                                className={`inline-flex items-center px-2 py-0.5 rounded-full font-mono text-[10px] font-medium whitespace-nowrap ${STATUS_CHIP[mod.status]}`}
                                            >
                                                {STATUS_LABELS[mod.status]}
                                            </span>
                                            <button
                                                type="button"
                                                disabled={isDeleting}
                                                onClick={() => deleteModule(mod.id)}
                                                aria-label={`Eliminar módulo ${mod.name}`}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--neutral-500)] hover:text-red-500 disabled:opacity-30 p-0.5"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* % completed */}
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-[32px] font-medium tracking-[-0.04em] text-[var(--neutral-1200)] leading-none tabular-nums">
                                            {pct}
                                            <span className="text-[16px] text-[var(--neutral-600)]">%</span>
                                        </span>
                                        <span className="font-mono text-[11px] text-[var(--neutral-600)] tabular-nums">
                                            {doneCount}/{mod.issueCount}
                                        </span>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="h-1 bg-[var(--neutral-300)] rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full"
                                            style={{ width: `${pct}%`, background: accent }}
                                        />
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between pt-3 border-t border-[var(--neutral-400)]">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0"
                                                style={{ background: accent }}
                                                aria-hidden="true"
                                            >
                                                {initials}
                                            </span>
                                            <span className="font-mono text-[10.5px] text-[var(--neutral-600)]">Lead</span>
                                        </div>
                                        <span className="font-mono text-[10.5px] text-[var(--neutral-600)]">
                                            {mod.issueCount} issue{mod.issueCount !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <Sheet open={!!selectedModule} onOpenChange={(open) => !open && setSelectedModule(null)}>
                <SheetContent
                    side="right"
                    className="w-96 bg-white border-[var(--neutral-400)] text-[var(--neutral-1200)]"
                >
                    {selectedModule && (
                        <ModuleIssuesPanel
                            workspaceSlug={workspaceSlug}
                            projectId={projectId}
                            module={selectedModule}
                            onClose={() => setSelectedModule(null)}
                        />
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
};
