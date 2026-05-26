import type React from 'react';
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, Layers, X, Trash2, Pencil } from 'lucide-react';
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
    useModules,
    useDeleteModule,
    useModuleIssues,
    useAddModuleIssue,
    useRemoveModuleIssue,
} from '../../application/use-modules';
import { useProject } from '@/modules/projects/application/use-projects';
import { useWorkspaceMembers } from '@/modules/workspaces/application/use-workspaces';
import { CreateModuleDialog } from '../components/CreateModuleDialog';
import type { Module, ModuleIssueRef } from '../../domain/types';
import { PRIORITY_LABELS } from '@/modules/issues/domain/types';
import type { IssuePriority } from '@/modules/issues/domain/types';
import { cn } from '@/lib/utils';

// ─── Status helpers ──────────────────────────────────────────────────────────

const STATUS_EDITORIAL: Record<Module['status'], string> = {
    Backlog: 'Backlog',
    InProgress: 'On track',
    Paused: 'At risk',
    Completed: '✓ Completed',
    Archived: 'Archivado',
};

const STATUS_DOT: Record<Module['status'], string> = {
    Backlog: 'bg-[var(--neutral-500)]',
    InProgress: 'bg-green-500',
    Paused: 'bg-amber-500',
    Completed: 'bg-green-600',
    Archived: 'bg-[var(--neutral-400)]',
};

const STATUS_TEXT: Record<Module['status'], string> = {
    Backlog: 'text-[var(--neutral-600)]',
    InProgress: 'text-green-700',
    Paused: 'text-amber-700',
    Completed: 'text-green-700',
    Archived: 'text-[var(--neutral-500)]',
};

const ACCENT_COLORS = [
    'var(--brand-700)',
    'var(--amber-700)',
    'var(--green-700)',
    '#6b6298',
    'var(--neutral-1200)',
] as const;

// ─── Module issues panel (Sheet) ─────────────────────────────────────────────

interface ModuleIssuesPanelProps {
    workspaceSlug: string;
    projectId: string;
    projectIdentifier?: string;
    module: Module;
    onClose: () => void;
}

const ModuleIssuesPanel = ({
    workspaceSlug,
    projectId,
    projectIdentifier,
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
                <span className={cn(
                    'inline-flex items-center gap-1.5 font-mono text-[10px] font-medium w-fit',
                    STATUS_TEXT[module.status],
                )}>
                    <span className={cn('w-1.5 h-1.5 rounded-full inline-block', STATUS_DOT[module.status])} />
                    {STATUS_EDITORIAL[module.status]}
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
                                    {projectIdentifier ?? 'ISS'}-{ref.issueSequenceId}
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

// ─── Module Card ─────────────────────────────────────────────────────────────

interface WorkspaceMemberInfo {
    userId: string;
    displayName?: string | null;
    email: string;
}

interface ModuleCardProps {
    mod: Module;
    accent: string;
    workspaceSlug: string;
    projectId: string;
    members: WorkspaceMemberInfo[];
    onManage: (mod: Module) => void;
    onEdit: (mod: Module) => void;
    onDelete: (id: string) => void;
    isDeleting: boolean;
}

const ModuleCard = ({
    mod,
    accent,
    workspaceSlug,
    projectId,
    members,
    onManage,
    onEdit,
    onDelete,
    isDeleting,
}: ModuleCardProps): React.ReactElement => {
    // TODO(backend): campo completedIssues esperado en DTO Module para calcular porcentaje real
    const totalIssues = mod.issueCount;
    const completedIssues = mod.status === 'Completed' || mod.status === 'Archived' ? totalIssues : 0;
    const pct = totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0;

    // TODO(backend): campo dueDate esperado en DTO Module
    const dueDateLabel: string | null = null;

    // TODO(backend): campo members[] esperado en DTO Module para avatares del equipo
    const teamAvatars: string[] = [];

    // Bug 25: resolve lead initials from workspace members
    const leadMember = mod.leadId ? members.find((m) => m.userId === mod.leadId) : null;
    const leadInitials: string | null = mod.leadId
        ? leadMember
            ? (leadMember.displayName ?? leadMember.email)
                .split(' ')
                .map((p) => p[0] ?? '')
                .join('')
                .slice(0, 2)
                .toUpperCase()
            : null
        : null;

    return (
        <div className="group relative bg-white p-[18px] rounded-lg border border-[var(--neutral-400)] flex flex-col gap-0 overflow-hidden hover:border-[var(--neutral-700)] transition-colors">
            {/* Top accent bar */}
            <span
                className="absolute top-0 left-0 w-6 h-[3px]"
                style={{ background: accent }}
                aria-hidden="true"
            />

            {/* Name + status + delete */}
            <div className="flex items-start justify-between gap-2 mt-1 mb-2">
                <div className="min-w-0 flex-1">
                    <Link
                        to={`/${workspaceSlug}/projects/${projectId}/modules/${mod.id}`}
                        className="block text-[16px] font-medium tight text-[var(--neutral-1200)] hover:text-[var(--brand-700)] transition-colors truncate after:absolute after:inset-0"
                        aria-label={`Ver módulo ${mod.name}`}
                    >
                        {mod.name}
                    </Link>
                    {mod.description && (
                        <div className="text-[12px] text-[var(--neutral-600)] mt-0.5 leading-[1.45] line-clamp-2">
                            {mod.description}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-1 shrink-0 relative z-10">
                    <span className={cn('text-[11px] font-medium', STATUS_TEXT[mod.status])}>
                        {STATUS_EDITORIAL[mod.status]}
                    </span>
                    <button
                        type="button"
                        onClick={() => onEdit(mod)}
                        aria-label={`Editar módulo ${mod.name}`}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--neutral-500)] hover:text-[var(--neutral-1200)] p-0.5 relative z-10"
                    >
                        <Pencil size={12} />
                    </button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <button
                                type="button"
                                disabled={isDeleting}
                                aria-label={`Eliminar módulo ${mod.name}`}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--neutral-500)] hover:text-red-500 disabled:opacity-30 p-0.5 relative z-10"
                            >
                                <Trash2 size={12} />
                            </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white border-[var(--neutral-400)] text-[var(--neutral-1200)]">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Eliminar módulo</AlertDialogTitle>
                                <AlertDialogDescription className="text-[var(--neutral-600)]">
                                    ¿Estás seguro de que querés eliminar "{mod.name}"? Esta acción no se puede deshacer.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="border-[var(--neutral-400)] text-[var(--neutral-700)] hover:bg-[var(--neutral-200)]">
                                    Cancelar
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => onDelete(mod.id)}
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

            {/* Progress number + issues count */}
            <div className="flex items-baseline gap-2 mb-3">
                <span className="text-[32px] font-medium tracking-[-0.04em] text-[var(--neutral-1200)] leading-none tnum">
                    {pct}
                    <span className="text-[16px] text-[var(--neutral-600)]">%</span>
                </span>
                <span className="font-mono text-[11px] text-[var(--neutral-600)] tnum">
                    {completedIssues}/{totalIssues}
                </span>
            </div>

            {/* Progress bar */}
            <div className="h-[3px] bg-[var(--neutral-300)] rounded-full overflow-hidden mb-3">
                <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, background: accent }}
                />
            </div>

            {/* Footer: lead avatar + due date + team avatars */}
            <div className="flex items-center justify-between pt-3 border-t border-[var(--neutral-400)]">
                {/* Lead + team */}
                <div className="flex items-center gap-2">
                    {/* TODO(backend): leadName/leadInitials esperado en DTO Module */}
                    {leadInitials ? (
                        <span
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0"
                            style={{ background: accent }}
                            title="Lead del módulo"
                        >
                            {leadInitials}
                        </span>
                    ) : (
                        <span className="font-mono text-[10px] text-[var(--neutral-500)]">Sin lead</span>
                    )}
                    {/* Team avatars overflow */}
                    {teamAvatars.length > 0 && (
                        <div className="flex -space-x-1.5">
                            {teamAvatars.slice(0, 3).map((initials) => (
                                <span
                                    key={initials}
                                    className="w-5 h-5 rounded-full bg-[var(--neutral-300)] flex items-center justify-center text-[7px] font-bold text-[var(--neutral-700)] ring-1 ring-white"
                                    aria-hidden="true"
                                >
                                    {initials}
                                </span>
                            ))}
                            {teamAvatars.length > 3 && (
                                <span className="font-mono text-[10px] text-[var(--neutral-600)] ml-2">
                                    +{teamAvatars.length - 3}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Due date + manage button */}
                <div className="flex items-center gap-3 relative z-10">
                    {/* TODO(backend): campo dueDate esperado en DTO Module */}
                    {dueDateLabel && (
                        <span className="font-mono text-[10px] text-[var(--neutral-600)]">
                            Vence {dueDateLabel}
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={() => onManage(mod)}
                        className="font-mono text-[10px] text-[var(--neutral-600)] hover:text-[var(--neutral-1200)] transition-colors"
                        aria-label={`Gestionar issues del módulo ${mod.name}`}
                    >
                        + issues
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Main Page ──────────────────────────────────────────────────────────────

export const ModulesPage = (): React.ReactElement => {
    const { workspaceSlug = '', projectId = '' } = useParams<{
        workspaceSlug: string;
        projectId: string;
    }>();

    const { data: modules, isLoading } = useModules(workspaceSlug, projectId);
    const { mutate: deleteModule, isPending: isDeleting } = useDeleteModule(workspaceSlug, projectId);
    const [selectedModule, setSelectedModule] = useState<Module | null>(null);
    const [editingModule, setEditingModule] = useState<Module | null>(null);
    const { data: project } = useProject(workspaceSlug, projectId);
    const projectIdentifier = project?.identifier;
    const { data: members = [] } = useWorkspaceMembers(workspaceSlug);

    const items = modules ?? [];

    return (
        <div className="h-full overflow-y-auto">
            <div className="w-full px-10 py-8 flex flex-col gap-8">
                {/* ── Sub-header ───────────────────────────────────────────── */}
                <div className="mb-6 flex items-center justify-between gap-4">
                    {/* Left: icon + title + count */}
                    <div className="flex items-center gap-2">
                        <Layers size={16} className="text-[var(--neutral-600)] shrink-0" aria-hidden="true" />
                        <span className="text-[13px] font-medium text-[var(--neutral-1200)]">Modules</span>
                        {!isLoading && (
                            <span className="font-mono text-[11px] text-[var(--neutral-600)] ml-1">
                                · {items.length} totales
                            </span>
                        )}
                    </div>

                    {/* Right: new module button */}
                    <div className="shrink-0">
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

                {/* ── Editorial heading ───────────────────────────────────── */}
                <div className="mb-8">
                    <Eyebrow>Modules · agrupación temática</Eyebrow>
                    <h1 className="mt-2 text-[56px] font-medium tightest text-[var(--neutral-1200)]">
                        Módulos del cierre.
                    </h1>
                    <p className="mt-2 text-[15px] text-[var(--neutral-600)] max-w-[600px]">
                        Mientras los ciclos miden tiempo, los módulos miden alcance. Cada uno agrupa issues
                        relacionadas por capacidad o entregable.
                    </p>
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="grid grid-cols-3 gap-4">
                        {(['sk-0', 'sk-1', 'sk-2', 'sk-3', 'sk-4', 'sk-5'] as const).map((k) => (
                            <div key={k} className="bg-white border border-[var(--neutral-400)] rounded-lg p-[18px] space-y-3">
                                <Skeleton className="h-4 w-2/3 bg-[var(--neutral-200)]" />
                                <Skeleton className="h-3 w-full bg-[var(--neutral-200)]" />
                                <Skeleton className="h-8 w-16 bg-[var(--neutral-200)]" />
                                <Skeleton className="h-[3px] w-full bg-[var(--neutral-200)]" />
                                <Skeleton className="h-8 w-full bg-[var(--neutral-200)]" />
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
                            Crea el primer módulo para este proyecto
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
                            return (
                                <ModuleCard
                                    key={mod.id}
                                    mod={mod}
                                    accent={accent}
                                    workspaceSlug={workspaceSlug}
                                    projectId={projectId}
                                    members={members}
                                    onManage={setSelectedModule}
                                    onEdit={setEditingModule}
                                    onDelete={(id) => deleteModule(id)}
                                    isDeleting={isDeleting}
                                />
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Edit module dialog (controlled) */}
            {editingModule && (
                <CreateModuleDialog
                    workspaceSlug={workspaceSlug}
                    projectId={projectId}
                    module={editingModule}
                    open={true}
                    onOpenChange={(o) => { if (!o) setEditingModule(null); }}
                    trigger={<span />}
                />
            )}

            <Sheet open={!!selectedModule} onOpenChange={(open) => !open && setSelectedModule(null)}>
                <SheetContent
                    side="right"
                    className="w-96 bg-white border-[var(--neutral-400)] text-[var(--neutral-1200)]"
                >
                    {selectedModule && (
                        <ModuleIssuesPanel
                            workspaceSlug={workspaceSlug}
                            projectId={projectId}
                            projectIdentifier={projectIdentifier}
                            module={selectedModule}
                            onClose={() => setSelectedModule(null)}
                        />
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
};
