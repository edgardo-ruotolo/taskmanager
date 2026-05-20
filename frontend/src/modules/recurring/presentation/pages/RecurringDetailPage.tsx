import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, History, RefreshCw, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Eyebrow } from '@/components/ui/eyebrow';
import {
    useRecurringRuns,
    useRecurringTemplate,
    useUpdateRecurringTemplate,
} from '../../application/use-recurring';
import { CreateRecurringDialog } from '../components/CreateRecurringDialog';
import type { RecurringTemplate } from '../../domain/types';
import type { RecurringTemplateFormValues } from '../../application/schemas';

type TabKey = 'config' | 'history' | 'preview';

const RUN_STATUS_LABEL: Record<string, string> = {
    Success: 'Exitoso',
    SkippedPreviousNotDone: 'Omitido (anterior pendiente)',
    SkippedPaused: 'Omitido (pausado)',
    SkippedManual: 'Omitido (manual)',
    Failed: 'Fallido',
};

const RUN_STATUS_CHIP: Record<string, string> = {
    Success: 'bg-[color-mix(in_oklch,var(--green-700)_12%,white)] text-[var(--green-700)]',
    Failed: 'bg-[color-mix(in_oklch,var(--brand-700)_10%,white)] text-red-500',
    SkippedPreviousNotDone: 'bg-[color-mix(in_oklch,var(--amber-700)_12%,white)] text-[var(--amber-700)]',
    SkippedPaused: 'bg-[color-mix(in_oklch,var(--amber-700)_12%,white)] text-[var(--amber-700)]',
    SkippedManual: 'bg-[var(--neutral-200)] text-[var(--neutral-600)]',
};

const FREQUENCY_LABELS: Record<string, string> = {
    Daily: 'Diario',
    Weekly: 'Semanal',
    Monthly: 'Mensual',
    Yearly: 'Anual',
};

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
    { key: 'config', label: 'Configuración', icon: Settings2 },
    { key: 'history', label: 'Historial', icon: History },
    { key: 'preview', label: 'Próximas ejecuciones', icon: Calendar },
];

function stripHtml(html: string): string {
    return html.replace(/<[^>]+>/g, '').trim();
}

function getStatusInfo(template: Pick<RecurringTemplate, 'isPaused' | 'isActive'>): { label: string; chip: string } {
    if (template.isPaused) {
        return {
            label: '⏸ Pausada',
            chip: 'bg-[color-mix(in_oklch,var(--amber-700)_12%,white)] text-[var(--amber-700)]',
        };
    }
    if (template.isActive) {
        return {
            label: '● Activa',
            chip: 'bg-[color-mix(in_oklch,var(--green-700)_12%,white)] text-[var(--green-700)]',
        };
    }
    return { label: '○ Inactiva', chip: 'bg-[var(--neutral-200)] text-[var(--neutral-600)]' };
}

interface ConfigRow {
    key: string;
    value: string;
}

function buildConfigRows(template: RecurringTemplate): ConfigRow[] {
    const rows: ConfigRow[] = [
        { key: 'Frecuencia', value: FREQUENCY_LABELS[template.frequency] ?? template.frequency },
        { key: 'Intervalo', value: String(template.interval) },
        { key: 'Hora de ejecución', value: template.runAtTime ? `${template.runAtTime.slice(0, 5)} (${template.timezone})` : '—' },
        { key: 'Prioridad', value: template.priority },
        { key: 'Comienza el', value: template.startsOn ?? '—' },
    ];
    if (template.endsOn) rows.push({ key: 'Termina el', value: template.endsOn });
    if (template.nextRunAt) rows.push({ key: 'Próxima ejecución', value: new Date(template.nextRunAt).toLocaleString('es-AR') });
    if (template.lastRunAt) rows.push({ key: 'Última ejecución', value: new Date(template.lastRunAt).toLocaleString('es-AR') });
    return rows;
}

function getNextRunLabel(nextRunAt: string | null): string | null {
    if (!nextRunAt) return null;
    return new Date(nextRunAt).toLocaleString('es-AR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

interface ConfigTabProps {
    rows: ConfigRow[];
}

function ConfigTab({ rows }: ConfigTabProps): React.ReactElement {
    return (
        <div className="bg-white rounded-lg border border-[var(--neutral-400)] mt-4 p-5">
            <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                {rows.map((row) => (
                    <div key={row.key} className="flex flex-col gap-1">
                        <span className="text-[11px] font-medium text-[var(--neutral-600)] uppercase tracking-[0.08em] font-mono">
                            {row.key}
                        </span>
                        <span className="text-[13px] text-[var(--neutral-1200)] font-medium">
                            {row.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

interface RunItem {
    id: string;
    scheduledFor: string;
    executedAt: string | null;
    generatedIssueIds: unknown[];
    status: string;
}

interface RunRowProps {
    run: RunItem;
    isFirst: boolean;
}

function RunRow({ run, isFirst }: RunRowProps): React.ReactElement {
    const chipClass = RUN_STATUS_CHIP[run.status] ?? 'bg-[var(--neutral-200)] text-[var(--neutral-600)]';
    const statusLabel = RUN_STATUS_LABEL[run.status] ?? run.status;
    const scheduledDate = new Date(run.scheduledFor).toLocaleDateString('es-AR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    const scheduledTime = new Date(run.scheduledFor).toLocaleTimeString('es-AR', {
        hour: '2-digit', minute: '2-digit',
    });
    const executedTime = run.executedAt
        ? new Date(run.executedAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
        : null;

    return (
        <div
            className="grid items-center gap-4 px-4 py-3"
            style={{
                gridTemplateColumns: '1fr 80px 120px',
                borderTop: isFirst ? 'none' : '1px solid var(--neutral-400)',
            }}
        >
            <div>
                <div className="text-[13px] font-medium text-[var(--neutral-1200)]">{scheduledDate}</div>
                <div className="flex items-center gap-4 mt-0.5">
                    {executedTime && (
                        <span className="font-mono text-[11px] text-[var(--neutral-600)]">
                            Ejecutado: {executedTime}
                        </span>
                    )}
                    {run.generatedIssueIds.length > 0 && (
                        <span className="font-mono text-[11px] text-[var(--neutral-600)]">
                            {run.generatedIssueIds.length} issue{run.generatedIssueIds.length !== 1 ? 's' : ''} generado{run.generatedIssueIds.length !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>
            </div>
            <span className="font-mono text-[11px] text-[var(--neutral-600)]">{scheduledTime}</span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-mono text-[10px] font-medium ${chipClass}`}>
                {statusLabel}
            </span>
        </div>
    );
}

interface HistoryTabProps {
    runs: RunItem[];
    runsLoading: boolean;
}

function HistoryTab({ runs, runsLoading }: HistoryTabProps): React.ReactElement {
    if (runsLoading) {
        return (
            <div className="mt-4 space-y-2">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-lg bg-[var(--neutral-200)]" />
                ))}
            </div>
        );
    }
    if (runs.length === 0) {
        return (
            <div className="mt-4 text-center py-12 text-[13px] text-[var(--neutral-600)]">
                No hay ejecuciones registradas
            </div>
        );
    }
    return (
        <div className="mt-4 bg-white border border-[var(--neutral-400)] rounded-lg overflow-hidden">
            {runs.map((run, i) => (
                <RunRow key={run.id} run={run} isFirst={i === 0} />
            ))}
        </div>
    );
}

interface PreviewTabProps {
    nextRunLabel: string | null;
}

function PreviewTab({ nextRunLabel }: PreviewTabProps): React.ReactElement {
    if (!nextRunLabel) {
        return (
            <div className="mt-4 text-center py-12 text-[13px] text-[var(--neutral-600)]">
                No hay próximas ejecuciones calculadas
            </div>
        );
    }
    return (
        <div className="mt-4 bg-white border border-[var(--neutral-400)] rounded-lg p-5">
            <div className="font-mono text-[11px] text-[var(--neutral-600)] uppercase tracking-[0.12em] mb-3">
                Próximas ejecuciones programadas
            </div>
            <div className="flex items-center gap-3 p-4 bg-[var(--neutral-100)] rounded-lg border border-[var(--neutral-400)]">
                <Calendar size={16} className="text-[var(--brand-700)] shrink-0" />
                <span className="text-[14px] font-medium text-[var(--neutral-1200)]">
                    {nextRunLabel}
                </span>
            </div>
        </div>
    );
}

interface ScheduleCardProps {
    frequency: string;
    interval: number;
    runAtTime: string;
    nextRunAt: string | null;
}

function ScheduleCard({ frequency, interval, runAtTime, nextRunAt }: ScheduleCardProps): React.ReactElement {
    return (
        <div className="bg-[var(--neutral-1200)] text-[#f0eadf] p-[22px] rounded-[10px]">
            <Eyebrow className="text-[var(--brand-700)]">Schedule</Eyebrow>
            <div className="flex items-center gap-4 flex-wrap mt-3">
                <span className="inline-flex items-center gap-2 px-[14px] py-2 bg-[rgba(240,234,223,0.08)] rounded-md text-[13px]">
                    <RefreshCw size={14} className="text-[var(--brand-700)]" />
                    <span>{FREQUENCY_LABELS[frequency] ?? frequency}</span>
                    {interval > 1 && (
                        <span className="font-bold text-[var(--brand-700)]"> ×{interval}</span>
                    )}
                </span>
                {runAtTime && (
                    <>
                        <span className="text-[14px] text-[rgba(240,234,223,0.5)]">·</span>
                        <span className="inline-flex items-center gap-2 px-[14px] py-2 bg-[rgba(240,234,223,0.08)] rounded-md text-[13px]">
                            <Calendar size={14} className="text-[var(--brand-700)]" />
                            A las <span className="font-bold text-[var(--brand-700)]">{runAtTime.slice(0, 5)}</span>
                        </span>
                    </>
                )}
                {nextRunAt && (
                    <>
                        <span className="text-[14px] text-[rgba(240,234,223,0.5)]">·</span>
                        <span className="inline-flex items-center gap-2 px-[14px] py-2 bg-[rgba(240,234,223,0.08)] rounded-md text-[13px]">
                            Próxima:{' '}
                            <span className="font-bold text-[var(--brand-700)]">
                                {new Date(nextRunAt).toLocaleDateString('es-ES', {
                                    day: '2-digit', month: 'short', year: 'numeric',
                                })}
                            </span>
                        </span>
                    </>
                )}
            </div>
        </div>
    );
}

export function RecurringDetailPage(): React.ReactElement {
    const { workspaceSlug = '', recurringId = '' } = useParams<{
        workspaceSlug: string;
        recurringId: string;
    }>();
    const [activeTab, setActiveTab] = useState<TabKey>('config');
    const [editOpen, setEditOpen] = useState(false);

    const { data: template, isLoading } = useRecurringTemplate(workspaceSlug, recurringId);
    const { data: runsData = [], isLoading: runsLoading } = useRecurringRuns(workspaceSlug, recurringId);
    const updateMutation = useUpdateRecurringTemplate(workspaceSlug, recurringId);

    const handleUpdate = async (values: RecurringTemplateFormValues): Promise<void> => {
        await updateMutation.mutateAsync(values);
        setEditOpen(false);
    };

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Skeleton className="h-8 w-8 rounded-full bg-[var(--neutral-200)]" />
            </div>
        );
    }

    if (!template) {
        return (
            <div className="flex h-full items-center justify-center text-[var(--neutral-600)]">
                Tarea recurrente no encontrada
            </div>
        );
    }

    const { label: statusLabel, chip: statusChip } = getStatusInfo(template);
    const configRows = buildConfigRows(template);
    const descriptionText = template.descriptionHtml ? stripHtml(template.descriptionHtml) : null;
    const nextRunLabel = getNextRunLabel(template.nextRunAt);
    const runs = runsData as RunItem[];

    return (
        <>
            <CreateRecurringDialog
                isOpen={editOpen}
                onClose={() => setEditOpen(false)}
                workspaceSlug={workspaceSlug}
                data={template}
                onUpdated={handleUpdate}
            />
            <div className="h-full overflow-y-auto">
                <div className="mx-auto max-w-4xl px-10 py-8 flex flex-col gap-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <Eyebrow>
                                {statusLabel} · REC-{template.sequenceId}
                            </Eyebrow>
                            <h1 className="mt-2 text-[40px] font-medium tracking-[-0.045em] leading-[1.05] text-[var(--neutral-1200)]">
                                {template.name}
                            </h1>
                            {descriptionText && (
                                <p className="mt-2 text-[14px] text-[var(--neutral-600)] max-w-[600px] leading-[1.55]">
                                    {descriptionText}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0 mt-1">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full font-mono text-[11px] font-medium ${statusChip}`}>
                                {statusLabel}
                            </span>
                            <Button
                                variant="outline"
                                className="border-[var(--neutral-400)] text-[var(--neutral-1200)] hover:bg-[var(--neutral-100)]"
                                onClick={() => setEditOpen(true)}
                            >
                                Editar
                            </Button>
                        </div>
                    </div>

                    <ScheduleCard
                        frequency={template.frequency}
                        interval={template.interval}
                        runAtTime={template.runAtTime}
                        nextRunAt={template.nextRunAt}
                    />

                    <div>
                        <div className="flex border-b border-[var(--neutral-400)]">
                            {TABS.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.key}
                                        type="button"
                                        onClick={() => setActiveTab(tab.key)}
                                        className={cn(
                                            'flex items-center gap-2 border-b-2 px-4 py-3 text-[13px] font-medium transition-colors mb-[-1px]',
                                            activeTab === tab.key
                                                ? 'border-[var(--brand-700)] text-[var(--neutral-1200)]'
                                                : 'border-transparent text-[var(--neutral-600)] hover:text-[var(--neutral-1200)]',
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        {activeTab === 'config' && <ConfigTab rows={configRows} />}
                        {activeTab === 'history' && <HistoryTab runs={runs} runsLoading={runsLoading} />}
                        {activeTab === 'preview' && <PreviewTab nextRunLabel={nextRunLabel} />}
                    </div>
                </div>
            </div>
        </>
    );
}
