import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { CalendarClock, History, Repeat2, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
    useRecurringRuns,
    useRecurringTemplate,
    useUpdateRecurringTemplate,
} from '../../application/use-recurring';
import { CreateRecurringDialog } from '../components/CreateRecurringDialog';
import type { RecurringTemplateFormValues } from '../../application/schemas';

type TabKey = 'config' | 'history' | 'preview';

const RUN_STATUS_LABEL: Record<string, string> = {
    Success: 'Exitoso',
    SkippedPreviousNotDone: 'Omitido (anterior pendiente)',
    SkippedPaused: 'Omitido (pausado)',
    SkippedManual: 'Omitido (manual)',
    Failed: 'Fallido',
};

const RUN_STATUS_COLOR: Record<string, string> = {
    Success: 'text-green-600',
    Failed: 'text-destructive',
    SkippedPreviousNotDone: 'text-amber-600',
    SkippedPaused: 'text-amber-600',
    SkippedManual: 'text-muted-foreground',
};

const FREQUENCY_LABELS: Record<string, string> = {
    Daily: 'Diario',
    Weekly: 'Semanal',
    Monthly: 'Mensual',
    Yearly: 'Anual',
};

export function RecurringDetailPage(): React.ReactElement {
    const { workspaceSlug = '', recurringId = '' } = useParams<{
        workspaceSlug: string;
        recurringId: string;
    }>();
    const [activeTab, setActiveTab] = useState<TabKey>('config');
    const [editOpen, setEditOpen] = useState(false);

    const { data: template, isLoading } = useRecurringTemplate(workspaceSlug, recurringId);
    const { data: runs = [], isLoading: runsLoading } = useRecurringRuns(workspaceSlug, recurringId);
    const updateMutation = useUpdateRecurringTemplate(workspaceSlug, recurringId);

    const handleUpdate = async (values: RecurringTemplateFormValues) => {
        await updateMutation.mutateAsync(values);
        setEditOpen(false);
    };

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Skeleton className="h-8 w-8 rounded-full" />
            </div>
        );
    }

    if (!template) {
        return (
            <div className="flex h-full items-center justify-center text-muted-foreground">
                Tarea recurrente no encontrada
            </div>
        );
    }

    const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
        { key: 'config', label: 'Configuración', icon: Settings2 },
        { key: 'history', label: 'Historial', icon: History },
        { key: 'preview', label: 'Próximas ejecuciones', icon: CalendarClock },
    ];

    return (
        <>
            <CreateRecurringDialog
                isOpen={editOpen}
                onClose={() => setEditOpen(false)}
                workspaceSlug={workspaceSlug}
                data={template}
                onUpdated={handleUpdate}
            />
            <div className="flex h-full w-full flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between border-b px-5 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-violet-100 dark:bg-violet-900/30">
                            <Repeat2 className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                        </div>
                        <div>
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
                                    {template.isPaused
                                        ? 'Pausado'
                                        : template.isActive
                                          ? 'Activo'
                                          : 'Inactivo'}
                                </span>
                            </div>
                            <h2 className="text-lg font-semibold">{template.name}</h2>
                        </div>
                    </div>
                    <Button variant="outline" onClick={() => setEditOpen(true)}>
                        Editar
                    </Button>
                </div>

                {/* Tabs */}
                <div className="flex border-b px-5">
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setActiveTab(tab.key)}
                                className={cn(
                                    'flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                                    activeTab === tab.key
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-muted-foreground hover:text-foreground',
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Tab content */}
                <div className="flex-1 overflow-y-auto">
                    {activeTab === 'config' && (
                        <div className="flex flex-col gap-y-4 p-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-y-1">
                                    <span className="text-xs font-medium text-muted-foreground">Frecuencia</span>
                                    <span className="text-sm">{FREQUENCY_LABELS[template.frequency]}</span>
                                </div>
                                <div className="flex flex-col gap-y-1">
                                    <span className="text-xs font-medium text-muted-foreground">Intervalo</span>
                                    <span className="text-sm">{template.interval}</span>
                                </div>
                                <div className="flex flex-col gap-y-1">
                                    <span className="text-xs font-medium text-muted-foreground">Hora de ejecución</span>
                                    <span className="text-sm">
                                        {template.runAtTime?.slice(0, 5)} ({template.timezone})
                                    </span>
                                </div>
                                <div className="flex flex-col gap-y-1">
                                    <span className="text-xs font-medium text-muted-foreground">Prioridad</span>
                                    <span className="text-sm capitalize">{template.priority}</span>
                                </div>
                                <div className="flex flex-col gap-y-1">
                                    <span className="text-xs font-medium text-muted-foreground">Comienza el</span>
                                    <span className="text-sm">{template.startsOn}</span>
                                </div>
                                {template.endsOn && (
                                    <div className="flex flex-col gap-y-1">
                                        <span className="text-xs font-medium text-muted-foreground">Termina el</span>
                                        <span className="text-sm">{template.endsOn}</span>
                                    </div>
                                )}
                                {template.nextRunAt && (
                                    <div className="flex flex-col gap-y-1">
                                        <span className="text-xs font-medium text-muted-foreground">Próxima ejecución</span>
                                        <span className="text-sm">
                                            {new Date(template.nextRunAt).toLocaleString('es-AR')}
                                        </span>
                                    </div>
                                )}
                                {template.lastRunAt && (
                                    <div className="flex flex-col gap-y-1">
                                        <span className="text-xs font-medium text-muted-foreground">Última ejecución</span>
                                        <span className="text-sm">
                                            {new Date(template.lastRunAt).toLocaleString('es-AR')}
                                        </span>
                                    </div>
                                )}
                            </div>
                            {template.descriptionHtml && (
                                <div className="flex flex-col gap-y-1">
                                    <span className="text-xs font-medium text-muted-foreground">Descripción</span>
                                    <div
                                        className="prose prose-sm max-w-none"
                                        // eslint-disable-next-line react/no-danger
                                        dangerouslySetInnerHTML={{ __html: template.descriptionHtml }}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="p-5">
                            {runsLoading ? (
                                <div className="flex flex-col gap-y-2">
                                    {[1, 2, 3].map((i) => (
                                        <Skeleton key={i} className="h-10 w-full rounded" />
                                    ))}
                                </div>
                            ) : runs.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No hay ejecuciones registradas</p>
                            ) : (
                                <div className="flex flex-col gap-y-2">
                                    {runs.map((run) => (
                                        <div
                                            key={run.id}
                                            className="flex items-center justify-between rounded-lg border p-3"
                                        >
                                            <div className="flex flex-col gap-y-0.5">
                                                <span className="text-sm font-medium">
                                                    {new Date(run.scheduledFor).toLocaleString('es-AR')}
                                                </span>
                                                {run.executedAt && (
                                                    <span className="text-xs text-muted-foreground">
                                                        Ejecutado: {new Date(run.executedAt).toLocaleString('es-AR')}
                                                    </span>
                                                )}
                                                {run.generatedIssueIds.length > 0 && (
                                                    <span className="text-xs text-muted-foreground">
                                                        {run.generatedIssueIds.length} tarea(s) generada(s)
                                                    </span>
                                                )}
                                            </div>
                                            <span
                                                className={cn(
                                                    'text-xs font-medium',
                                                    RUN_STATUS_COLOR[run.status] ?? 'text-muted-foreground',
                                                )}
                                            >
                                                {RUN_STATUS_LABEL[run.status] ?? run.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'preview' && (
                        <div className="p-5">
                            <p className="mb-3 text-sm font-medium">Próximas ejecuciones programadas</p>
                            {template.nextRunAt ? (
                                <div className="flex flex-col gap-y-2">
                                    <div className="flex items-center gap-2 rounded-lg border p-3">
                                        <CalendarClock className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">
                                            {new Date(template.nextRunAt).toLocaleString('es-AR', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    No hay próximas ejecuciones calculadas
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
