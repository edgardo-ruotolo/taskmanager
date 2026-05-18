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

    return (
        <>
            <CreateRecurringDialog
                isOpen={editOpen}
                onClose={() => setEditOpen(false)}
                workspaceSlug={workspaceSlug}
                data={template}
            />
            <div className="group relative flex items-center justify-between gap-3 p-4 bg-surface-1/50 border border-subtle rounded-lg hover:border-strong transition-colors">
                {/* Left */}
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-violet-100 dark:bg-violet-900/30">
                        <Repeat2 className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-mono text-xs text-placeholder">
                                REC-{template.sequenceId}
                            </span>
                            <span
                                className={cn(
                                    'rounded px-1.5 py-0.5 text-xs font-medium',
                                    template.isPaused
                                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                        : template.isActive
                                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                          : 'bg-layer-1 text-placeholder',
                                )}
                            >
                                {template.isPaused ? 'Pausado' : template.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                        </div>
                        <p className="truncate text-sm font-medium text-primary">{template.name}</p>
                        <div className="mt-0.5 flex items-center gap-3 text-xs text-placeholder">
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
                                isOverdue ? 'text-destructive' : 'text-placeholder',
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
                    {template.isPaused && <Pause className="h-3.5 w-3.5 text-amber-500" />}
                    <div className="opacity-0 transition-opacity group-hover:opacity-100">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-placeholder hover:text-primary hover:bg-layer-1"
                                >
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-surface-1 border-subtle text-primary">
                                <DropdownMenuItem
                                    className="cursor-pointer hover:bg-layer-1"
                                    onClick={() => setEditOpen(true)}
                                >
                                    Editar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-subtle" />
                                {template.isPaused ? (
                                    <DropdownMenuItem
                                        className="cursor-pointer hover:bg-layer-1"
                                        onClick={() => resumeMutation.mutate(template.id)}
                                    >
                                        <Play className="mr-2 h-4 w-4" />
                                        Reanudar
                                    </DropdownMenuItem>
                                ) : (
                                    <DropdownMenuItem
                                        className="cursor-pointer hover:bg-layer-1"
                                        onClick={() => pauseMutation.mutate(template.id)}
                                    >
                                        <Pause className="mr-2 h-4 w-4" />
                                        Pausar
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                    className="cursor-pointer hover:bg-layer-1"
                                    onClick={() => skipMutation.mutate(template.id)}
                                >
                                    <SkipForward className="mr-2 h-4 w-4" />
                                    Omitir próxima ejecución
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="cursor-pointer hover:bg-layer-1"
                                    onClick={() => runNowMutation.mutate(template.id)}
                                >
                                    <Zap className="mr-2 h-4 w-4" />
                                    Ejecutar ahora
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-subtle" />
                                <DropdownMenuItem
                                    className="cursor-pointer text-destructive hover:bg-layer-1 focus:text-destructive"
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
