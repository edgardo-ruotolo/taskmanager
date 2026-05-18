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

const FREQUENCY_ICONS: Record<string, string> = {
    Daily: 'D',
    Weekly: 'S',
    Monthly: 'M',
    Yearly: 'A',
};

const FREQUENCY_LABELS: Record<string, string> = {
    Daily: 'Diario',
    Weekly: 'Semanal',
    Monthly: 'Mensual',
    Yearly: 'Anual',
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
            <div className="group flex items-center justify-between gap-3 border-b px-5 py-3 transition-colors hover:bg-muted/40">
                {/* Left */}
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-violet-100 dark:bg-violet-900/30">
                        <Repeat2 className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-muted-foreground">
                                REC-{template.sequenceId}
                            </span>
                            <span
                                className={cn(
                                    'rounded px-1.5 py-0.5 text-xs font-medium',
                                    template.isPaused
                                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                        : template.isActive
                                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                          : 'bg-muted text-muted-foreground',
                                )}
                            >
                                {template.isPaused ? 'Pausado' : template.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                        </div>
                        <p className="truncate text-sm font-medium">{template.name}</p>
                        <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                            <span>
                                {FREQUENCY_ICONS[template.frequency]} ·{' '}
                                {FREQUENCY_LABELS[template.frequency]}
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
                <div className="flex flex-shrink-0 items-center gap-3">
                    {nextRunDate && (
                        <div
                            className={cn(
                                'flex items-center gap-1.5 text-xs',
                                isOverdue ? 'text-destructive' : 'text-muted-foreground',
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
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                                    Editar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {template.isPaused ? (
                                    <DropdownMenuItem onClick={() => resumeMutation.mutate(template.id)}>
                                        <Play className="mr-2 h-4 w-4" />
                                        Reanudar
                                    </DropdownMenuItem>
                                ) : (
                                    <DropdownMenuItem onClick={() => pauseMutation.mutate(template.id)}>
                                        <Pause className="mr-2 h-4 w-4" />
                                        Pausar
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => skipMutation.mutate(template.id)}>
                                    <SkipForward className="mr-2 h-4 w-4" />
                                    Omitir próxima ejecución
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => runNowMutation.mutate(template.id)}>
                                    <Zap className="mr-2 h-4 w-4" />
                                    Ejecutar ahora
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-destructive"
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
