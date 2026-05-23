import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    CalendarClock,
    Copy,
    MoreHorizontal,
    Pause,
    Play,
    Repeat2,
    RotateCcw,
    SkipForward,
    Trash2,
    Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    useDeleteRecurringTemplate,
    useDuplicateRecurring,
    usePauseRecurring,
    useResumeRecurring,
    useRunNowRecurring,
    useSkipNextRecurring,
} from '../../application/use-recurring';
import type {
    RecurringTemplate,
    RecurringTemplateAssigneeSummary,
    RecurringTemplateProjectSummary,
} from '../../domain/types';
import { CreateRecurringDialog } from './CreateRecurringDialog';

const FREQUENCY_LABELS: Record<string, string> = {
    Daily: 'Diario',
    Weekly: 'Semanal',
    Monthly: 'Mensual',
    Quarterly: 'Trimestral',
    Yearly: 'Anual',
};

const MAX_VISIBLE_PROJECTS = 3;
const MAX_VISIBLE_ASSIGNEES = 3;

function getTemplateStatus(
    template: Pick<RecurringTemplate, 'isPaused' | 'isActive'>,
): { label: string; chipClass: string } {
    if (template.isPaused) {
        return {
            label: 'Pausado',
            chipClass: 'bg-[color-mix(in_oklch,var(--amber-700)_12%,white)] text-[var(--amber-700)]',
        };
    }
    if (template.isActive) {
        return {
            label: 'Activo',
            chipClass: 'bg-[color-mix(in_oklch,var(--green-700)_12%,white)] text-[var(--green-700)]',
        };
    }
    return { label: 'Inactivo', chipClass: 'bg-[var(--neutral-200)] text-[var(--neutral-600)]' };
}

function getInitials(displayName: string): string {
    const trimmed = displayName.trim();
    if (!trimmed) return '?';
    const parts = trimmed.split(/\s+/).slice(0, 2);
    return parts.map((p) => p.charAt(0).toUpperCase()).join('') || '?';
}

interface ProjectPillsProps {
    projects: RecurringTemplateProjectSummary[];
}

function ProjectPills({ projects }: ProjectPillsProps): React.ReactElement | null {
    if (projects.length === 0) return null;
    const visible = projects.slice(0, MAX_VISIBLE_PROJECTS);
    const overflow = projects.length - visible.length;
    return (
        <div className="mt-1 flex flex-wrap items-center gap-1">
            {visible.map((p) => (
                <span
                    key={p.id}
                    className="bg-[var(--neutral-100)] border border-[var(--neutral-400)] px-1.5 py-0.5 rounded text-[10px] font-mono text-[var(--neutral-700)]"
                    title={`${p.identifier} ${p.name}`.trim()}
                >
                    {p.identifier ? `${p.identifier} ${p.name}` : p.name}
                </span>
            ))}
            {overflow > 0 && (
                <span className="bg-[var(--neutral-100)] border border-[var(--neutral-400)] px-1.5 py-0.5 rounded text-[10px] font-mono text-[var(--neutral-700)]">
                    +{overflow}
                </span>
            )}
        </div>
    );
}

interface AssigneeStackProps {
    assignees: RecurringTemplateAssigneeSummary[];
}

function AssigneeStack({ assignees }: AssigneeStackProps): React.ReactElement | null {
    if (assignees.length === 0) return null;
    const visible = assignees.slice(0, MAX_VISIBLE_ASSIGNEES);
    const overflow = assignees.length - visible.length;
    return (
        <div className="flex -space-x-1.5">
            {visible.map((a) => (
                <Avatar
                    key={a.id}
                    className="h-5 w-5 ring-1 ring-white"
                    title={a.displayName}
                >
                    {a.avatarUrl && <AvatarImage src={a.avatarUrl} alt={a.displayName} />}
                    <AvatarFallback className="bg-[var(--neutral-200)] text-[10px] font-medium text-[var(--neutral-700)]">
                        {getInitials(a.displayName)}
                    </AvatarFallback>
                </Avatar>
            ))}
            {overflow > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--neutral-200)] px-1 text-[10px] font-medium text-[var(--neutral-700)] ring-1 ring-white">
                    +{overflow}
                </span>
            )}
        </div>
    );
}

interface Props {
    template: RecurringTemplate;
    workspaceSlug: string;
    isAdmin: boolean;
}

export function RecurringListItem({ template, workspaceSlug, isAdmin }: Props): React.ReactElement {
    const [editOpen, setEditOpen] = useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

    const pauseMutation = usePauseRecurring(workspaceSlug);
    const resumeMutation = useResumeRecurring(workspaceSlug);
    const skipMutation = useSkipNextRecurring(workspaceSlug);
    const runNowMutation = useRunNowRecurring(workspaceSlug);
    const duplicateMutation = useDuplicateRecurring(workspaceSlug);
    const deleteMutation = useDeleteRecurringTemplate(workspaceSlug);

    const nextRunDate = template.nextRunAt ? new Date(template.nextRunAt) : null;
    const isOverdue = nextRunDate !== null && nextRunDate < new Date();
    const { label: statusLabel, chipClass: statusChipClass } = getTemplateStatus(template);

    const detailHref = `/${workspaceSlug}/settings/recurring/${template.id}`;

    const handleDeleteConfirmed = (): void => {
        deleteMutation.mutate(template.id);
        setConfirmDeleteOpen(false);
    };

    return (
        <>
            {isAdmin && (
                <CreateRecurringDialog
                    isOpen={editOpen}
                    onClose={() => setEditOpen(false)}
                    workspaceSlug={workspaceSlug}
                    data={template}
                />
            )}

            <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar tarea recurrente?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. La plantilla dejará de generar tareas. Las tareas
                            ya generadas no se eliminan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirmed}
                            className="bg-red-500 hover:bg-red-600 text-white"
                        >
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <div className="group relative flex items-center justify-between gap-3 p-4 bg-white border border-[var(--neutral-400)] rounded-lg hover:border-[var(--neutral-700)] transition-colors">
                {/* Left: link al detalle */}
                <Link
                    to={detailHref}
                    className="flex min-w-0 flex-1 items-center gap-3 outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-700)] rounded-md"
                >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[color-mix(in_oklch,var(--brand-700)_10%,white)]">
                        <Repeat2 className="h-4 w-4 text-[var(--brand-700)]" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-mono text-xs text-[var(--neutral-600)]">
                                REC-{template.sequenceId}
                            </span>
                            <span className={cn('rounded px-1.5 py-0.5 text-xs font-medium', statusChipClass)}>
                                {statusLabel}
                            </span>
                            {template.skipNextRun && (
                                <span className="rounded px-1.5 py-0.5 text-xs font-medium bg-[color-mix(in_oklch,var(--amber-700)_10%,white)] text-[var(--amber-700)]">
                                    Próxima omitida
                                </span>
                            )}
                        </div>
                        <p className="truncate text-sm font-medium text-[var(--neutral-1200)]">{template.name}</p>
                        <div className="mt-0.5 flex items-center gap-3 text-xs text-[var(--neutral-600)]">
                            <span>
                                {FREQUENCY_LABELS[template.frequency] ?? template.frequency}
                                {template.interval > 1 ? ` ×${template.interval}` : ''}
                            </span>
                            {template.runAtTime && (
                                <span>
                                    {template.runAtTime.slice(0, 5)}{' '}
                                    {template.timezone !== 'UTC' ? `(${template.timezone})` : ''}
                                </span>
                            )}
                        </div>
                        <ProjectPills projects={template.projects} />
                    </div>
                </Link>

                {/* Right */}
                <div className="flex shrink-0 items-center gap-3">
                    <AssigneeStack assignees={template.assignees} />
                    {nextRunDate && (
                        <div
                            className={cn(
                                'flex items-center gap-1.5 text-xs',
                                isOverdue ? 'text-red-500' : 'text-[var(--neutral-600)]',
                            )}
                        >
                            <CalendarClock className="h-3.5 w-3.5" />
                            <span>
                                {nextRunDate.toLocaleDateString('es-AR', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </span>
                        </div>
                    )}
                    {template.isPaused && <Pause className="h-3.5 w-3.5 text-[var(--amber-700)]" />}
                    {isAdmin && (
                        <div className="opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-[var(--neutral-600)] hover:text-[var(--neutral-1200)] hover:bg-[var(--neutral-100)]"
                                        aria-label="Acciones de la tarea recurrente"
                                    >
                                        <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="bg-white border-[var(--neutral-400)] text-[var(--neutral-1200)]"
                                >
                                    <DropdownMenuItem
                                        className="cursor-pointer hover:bg-[var(--neutral-100)]"
                                        onClick={() => setEditOpen(true)}
                                    >
                                        Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="cursor-pointer hover:bg-[var(--neutral-100)]"
                                        onClick={() => duplicateMutation.mutate(template.id)}
                                    >
                                        <Copy className="mr-2 h-4 w-4" />
                                        Duplicar
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-[var(--neutral-400)]" />
                                    {template.isPaused ? (
                                        <DropdownMenuItem
                                            className="cursor-pointer hover:bg-[var(--neutral-100)]"
                                            onClick={() => resumeMutation.mutate(template.id)}
                                        >
                                            <Play className="mr-2 h-4 w-4" />
                                            Reanudar
                                        </DropdownMenuItem>
                                    ) : (
                                        <DropdownMenuItem
                                            className="cursor-pointer hover:bg-[var(--neutral-100)]"
                                            onClick={() => pauseMutation.mutate(template.id)}
                                        >
                                            <Pause className="mr-2 h-4 w-4" />
                                            Pausar
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem
                                        className="cursor-pointer hover:bg-[var(--neutral-100)]"
                                        onClick={() => skipMutation.mutate(template.id)}
                                    >
                                        {template.skipNextRun ? (
                                            <>
                                                <RotateCcw className="mr-2 h-4 w-4" />
                                                Cancelar omitir próxima
                                            </>
                                        ) : (
                                            <>
                                                <SkipForward className="mr-2 h-4 w-4" />
                                                Omitir próxima ejecución
                                            </>
                                        )}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="cursor-pointer hover:bg-[var(--neutral-100)]"
                                        onClick={() => runNowMutation.mutate(template.id)}
                                    >
                                        <Zap className="mr-2 h-4 w-4" />
                                        Ejecutar ahora
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-[var(--neutral-400)]" />
                                    <DropdownMenuItem
                                        className="cursor-pointer text-red-500 hover:bg-[var(--neutral-100)] focus:text-red-500"
                                        onClick={() => setConfirmDeleteOpen(true)}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Eliminar
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
