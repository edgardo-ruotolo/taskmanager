import { useState } from 'react';
import { CalendarClock, MoreHorizontal, Pause, Play, Repeat2, SkipForward, Trash2, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    useDeleteRecurringTemplate,
    usePauseRecurring,
    useResumeRecurring,
    useRunNowRecurring,
    useSkipNextRecurring,
} from '../../application/use-recurring';
import type { RecurringTemplate } from '../../domain/types';
import { CreateRecurringDialog } from './CreateRecurringDialog';

const FREQUENCY_LABELS: Record<string, string> = {
    Daily: 'Diario', daily: 'Diario',
    Weekly: 'Semanal', weekly: 'Semanal',
    Monthly: 'Mensual', monthly: 'Mensual',
    Yearly: 'Anual', yearly: 'Anual',
};

function getTemplateStatus(template: Pick<RecurringTemplate, 'isPaused' | 'isActive'>): { label: string; chipClass: string } {
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

interface Props {
    template: RecurringTemplate;
    workspaceSlug: string;
}

export function RecurringListItem({ template, workspaceSlug }: Props): React.ReactElement {
    const [editOpen, setEditOpen] = useState(false);
    const pauseMutation = usePauseRecurring(workspaceSlug);
    const resumeMutation = useResumeRecurring(workspaceSlug);
    const skipMutation = useSkipNextRecurring(workspaceSlug);
    const runNowMutation = useRunNowRecurring(workspaceSlug);
    const deleteMutation = useDeleteRecurringTemplate(workspaceSlug);

    const nextRunDate = template.nextRunAt ? new Date(template.nextRunAt) : null;
    const isOverdue = nextRunDate !== null && nextRunDate < new Date();
    const { label: statusLabel, chipClass: statusChipClass } = getTemplateStatus(template);

    return (
        <>
            <CreateRecurringDialog
                isOpen={editOpen}
                onClose={() => setEditOpen(false)}
                workspaceSlug={workspaceSlug}
                data={template}
            />
            <div className="group relative flex items-center justify-between gap-3 p-4 bg-white border border-[var(--neutral-400)] rounded-lg hover:border-[var(--neutral-700)] transition-colors">
                {/* Left */}
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[color-mix(in_oklch,var(--brand-700)_10%,white)]">
                        <Repeat2 className="h-4 w-4 text-[var(--brand-700)]" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-mono text-xs text-[var(--neutral-600)]">
                                REC-{template.sequenceId}
                            </span>
                            <span className={cn('rounded px-1.5 py-0.5 text-xs font-medium', statusChipClass)}>
                                {statusLabel}
                            </span>
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
                    </div>
                </div>

                {/* Right */}
                <div className="flex shrink-0 items-center gap-3">
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
                    <div className="opacity-0 transition-opacity group-hover:opacity-100">
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
                            <DropdownMenuContent align="end" className="bg-white border-[var(--neutral-400)] text-[var(--neutral-1200)]">
                                <DropdownMenuItem
                                    className="cursor-pointer hover:bg-[var(--neutral-100)]"
                                    onClick={() => setEditOpen(true)}
                                >
                                    Editar
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
                                    <SkipForward className="mr-2 h-4 w-4" />
                                    Omitir próxima ejecución
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
                                    onClick={() => deleteMutation.mutate(template.id)}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Eliminar
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </>
    );
}
