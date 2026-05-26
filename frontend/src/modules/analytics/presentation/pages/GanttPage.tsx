import type React from 'react';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useLabels } from '@/modules/labels/application/use-labels';
import { useGantt } from '../../application/use-analytics';
import { useAnalyticsFiltersStore } from '../../application/filters-store';
import type { IssueGanttDto } from '../../domain/types';
import { ChartSkeleton } from '../components/ChartSkeleton';
import { ChartEmpty } from '../components/ChartEmpty';

type GroupBy = 'issue' | 'user' | 'client';
type ZoomLevel = 'day' | 'week' | 'month';

const ZOOM_LABEL: Record<ZoomLevel, string> = {
    day: 'Día',
    week: 'Semana',
    month: 'Mes',
};

export const GanttPage = (): React.ReactElement => {
    const { workspaceSlug = '' } = useParams<{ workspaceSlug: string }>();
    const filters = useAnalyticsFiltersStore(workspaceSlug);
    const { data, isLoading } = useGantt(workspaceSlug, filters);
    const { data: labels } = useLabels(workspaceSlug);
    const labelMap = useMemo(() => {
        const m = new Map<string, string>();
        for (const l of labels ?? []) m.set(l.id, l.name);
        return m;
    }, [labels]);

    const [groupBy, setGroupBy] = useState<GroupBy>('issue');
    const [zoom, setZoom] = useState<ZoomLevel>('week');
    const [selected, setSelected] = useState<IssueGanttDto | null>(null);
    const [showUndated, setShowUndated] = useState(false);

    const { dated, undated } = useMemo(() => {
        const rows = data ?? [];
        const dat: IssueGanttDto[] = [];
        const und: IssueGanttDto[] = [];
        for (const r of rows) {
            if (r.startDate || r.dueDate) dat.push(r);
            else und.push(r);
        }
        return { dated: dat, undated: und };
    }, [data]);

    const { minDate, maxDate, totalDays } = useMemo(() => {
        if (dated.length === 0) {
            const now = new Date();
            return { minDate: now, maxDate: now, totalDays: 1 };
        }
        let min = Number.POSITIVE_INFINITY;
        let max = Number.NEGATIVE_INFINITY;
        for (const r of dated) {
            const s = r.startDate ? new Date(r.startDate).getTime() : 0;
            const e = r.dueDate ? new Date(r.dueDate).getTime() : 0;
            if (s && s < min) min = s;
            if (e && e > max) max = e;
            if (s && s > max) max = s;
            if (e && e < min) min = e;
        }
        if (min === Number.POSITIVE_INFINITY) min = Date.now();
        if (max === Number.NEGATIVE_INFINITY) max = min + 86_400_000;
        const minD = new Date(min);
        const maxD = new Date(max);
        const span = Math.max(1, Math.ceil((maxD.getTime() - minD.getTime()) / 86_400_000));
        return { minDate: minD, maxDate: maxD, totalDays: span };
    }, [dated]);

    const groups = useMemo(() => {
        if (groupBy === 'issue') {
            return [{ key: 'all', label: '', issues: dated }];
        }
        const map = new Map<string, { key: string; label: string; issues: IssueGanttDto[] }>();
        for (const issue of dated) {
            const buckets =
                groupBy === 'user' ? userBuckets(issue) : labelBuckets(issue, labelMap);
            for (const b of buckets) {
                let acc = map.get(b.key);
                if (!acc) {
                    acc = { key: b.key, label: b.label, issues: [] };
                    map.set(b.key, acc);
                }
                acc.issues.push(issue);
            }
        }
        return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
    }, [dated, groupBy, labelMap]);

    const ticks = useMemo(() => buildTicks(minDate, maxDate, zoom), [minDate, maxDate, zoom]);

    return (
        <div className="w-full px-10 py-8 space-y-5">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <h2 className="text-[20px] font-medium tracking-[-0.02em] text-[var(--neutral-1200)]">
                    Gantt — tareas en curso y realizadas
                </h2>
                <div className="flex items-center gap-2">
                    <ToggleGroup
                        ariaLabel="Agrupación"
                        options={[
                            { value: 'issue', label: 'Por issue' },
                            { value: 'user', label: 'Por usuario' },
                            { value: 'client', label: 'Por cliente' },
                        ]}
                        value={groupBy}
                        onChange={(v) => setGroupBy(v as GroupBy)}
                    />
                    <ToggleGroup
                        ariaLabel="Zoom"
                        options={(['day', 'week', 'month'] as ZoomLevel[]).map((z) => ({
                            value: z,
                            label: ZOOM_LABEL[z],
                        }))}
                        value={zoom}
                        onChange={(v) => setZoom(v as ZoomLevel)}
                    />
                </div>
            </div>

            <div className="bg-white border border-[var(--neutral-400)] rounded-lg overflow-hidden">
                {isLoading ? (
                    <div className="p-6">
                        <ChartSkeleton variant="bar" />
                    </div>
                ) : dated.length === 0 ? (
                    <div className="p-12">
                        <ChartEmpty
                            title="Sin tareas con fechas"
                            description="Asigna fechas de inicio o vencimiento para ver la barra Gantt."
                        />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <div className="min-w-[800px]">
                            <div
                                className="grid sticky top-0 bg-[var(--neutral-100)] border-b border-[var(--neutral-300)] z-10"
                                style={{ gridTemplateColumns: '320px 1fr' }}
                            >
                                <div className="px-3 py-2 text-[10px] font-medium uppercase tracking-[0.06em] text-[var(--neutral-600)]">
                                    Tarea
                                </div>
                                <div
                                    className="px-3 py-2 grid"
                                    style={{ gridTemplateColumns: `repeat(${ticks.length}, 1fr)` }}
                                >
                                    {ticks.map((t) => (
                                        <div
                                            key={t.iso}
                                            className="text-[10px] text-[var(--neutral-600)] tabular-nums text-center"
                                        >
                                            {t.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {groups.map((g) => (
                                <div key={g.key}>
                                    {g.label && (
                                        <div className="px-3 py-1.5 bg-[var(--neutral-50)] border-b border-[var(--neutral-200)] text-[11px] font-medium text-[var(--neutral-700)]">
                                            {g.label}{' '}
                                            <span className="text-[var(--neutral-500)] font-mono">
                                                ({g.issues.length})
                                            </span>
                                        </div>
                                    )}
                                    {g.issues.map((issue) => (
                                        <GanttRow
                                            key={`${g.key}-${issue.id}`}
                                            issue={issue}
                                            minDate={minDate}
                                            totalDays={totalDays}
                                            onClick={() => setSelected(issue)}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {undated.length > 0 && (
                <div className="bg-white border border-[var(--neutral-400)] rounded-lg">
                    <button
                        type="button"
                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-[var(--neutral-50)]"
                        onClick={() => setShowUndated((v) => !v)}
                    >
                        <span className="text-[13px] font-medium text-[var(--neutral-1200)]">
                            Sin fechas ({undated.length})
                        </span>
                        {showUndated ? (
                            <ChevronUp className="h-4 w-4 text-[var(--neutral-600)]" />
                        ) : (
                            <ChevronDown className="h-4 w-4 text-[var(--neutral-600)]" />
                        )}
                    </button>
                    {showUndated && (
                        <div className="border-t border-[var(--neutral-200)] divide-y divide-[var(--neutral-100)]">
                            {undated.map((issue) => (
                                <button
                                    key={issue.id}
                                    type="button"
                                    onClick={() => setSelected(issue)}
                                    className="w-full px-4 py-2 text-left hover:bg-[var(--neutral-50)] flex items-center gap-3"
                                >
                                    <span className="font-mono text-[11px] text-[var(--neutral-600)]">
                                        {issue.projectIdentifier}-{issue.sequenceId}
                                    </span>
                                    <span className="text-[13px] text-[var(--neutral-1200)] truncate">
                                        {issue.title}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
                <SheetContent className="overflow-y-auto sm:max-w-md">
                    {selected && (
                        <>
                            <SheetHeader>
                                <SheetTitle className="flex items-center gap-2">
                                    <span className="font-mono text-[12px] text-[var(--neutral-600)]">
                                        {selected.projectIdentifier}-{selected.sequenceId}
                                    </span>
                                </SheetTitle>
                                <SheetDescription className="text-[15px] text-[var(--neutral-1200)] font-medium">
                                    {selected.title}
                                </SheetDescription>
                            </SheetHeader>
                            <div className="mt-6 space-y-3 text-[13px]">
                                <DetailRow label="Estado">
                                    <span
                                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md"
                                        style={{
                                            background: `${selected.stateColor}22`,
                                            color: selected.stateColor,
                                        }}
                                    >
                                        <span
                                            className="w-1.5 h-1.5 rounded-full"
                                            style={{ background: selected.stateColor }}
                                        />
                                        {selected.stateName}
                                    </span>
                                </DetailRow>
                                <DetailRow label="Prioridad">{selected.priority}</DetailRow>
                                <DetailRow label="Asignado">
                                    {selected.assigneeName ?? '—'}
                                </DetailRow>
                                <DetailRow label="Inicio">{formatDate(selected.startDate)}</DetailRow>
                                <DetailRow label="Vence">{formatDate(selected.dueDate)}</DetailRow>
                                <DetailRow label="Completado">
                                    {formatDate(selected.completedAt)}
                                </DetailRow>
                                {selected.isOverdue && (
                                    <div className="mt-3 px-3 py-2 bg-red-50 border border-red-200 text-red-700 text-[12px] rounded-md">
                                        Esta tarea está vencida.
                                    </div>
                                )}
                            </div>
                            <div className="mt-6">
                                <Button asChild className="w-full">
                                    <a
                                        href={`/${workspaceSlug}/projects/${selected.projectIdentifier}/issues/${selected.id}`}
                                    >
                                        Ver tarea completa
                                    </a>
                                </Button>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
};

// ── Helpers ──────────────────────────────────────────────────────────────

function userBuckets(issue: IssueGanttDto): { key: string; label: string }[] {
    if (!issue.assigneeId) return [{ key: '_unassigned', label: 'Sin asignar' }];
    return [{ key: issue.assigneeId, label: issue.assigneeName ?? 'Sin nombre' }];
}

function labelBuckets(
    issue: IssueGanttDto,
    labelMap: Map<string, string>,
): { key: string; label: string }[] {
    if (issue.labelIds.length === 0) return [{ key: '_nolabel', label: 'Sin cliente' }];
    return issue.labelIds.map((id) => ({ key: id, label: labelMap.get(id) ?? id }));
}

function formatDate(s: string | null): string {
    if (!s) return '—';
    return new Date(s).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });
}

interface Tick {
    iso: string;
    label: string;
}

function buildTicks(minDate: Date, maxDate: Date, zoom: ZoomLevel): Tick[] {
    const ticks: Tick[] = [];
    const start = new Date(minDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(maxDate);
    end.setHours(23, 59, 59, 999);

    if (zoom === 'day') {
        const max = 60;
        const stepMs = 86_400_000;
        let i = 0;
        for (let t = start.getTime(); t <= end.getTime() && i < max; t += stepMs, i += 1) {
            const d = new Date(t);
            ticks.push({
                iso: d.toISOString(),
                label: d.toLocaleDateString('es', { day: '2-digit', month: 'short' }),
            });
        }
    } else if (zoom === 'week') {
        const stepMs = 7 * 86_400_000;
        const max = 40;
        let i = 0;
        for (let t = start.getTime(); t <= end.getTime() && i < max; t += stepMs, i += 1) {
            const d = new Date(t);
            ticks.push({
                iso: d.toISOString(),
                label: `S${weekOfYear(d)}`,
            });
        }
    } else {
        const cur = new Date(start.getFullYear(), start.getMonth(), 1);
        const max = 24;
        let i = 0;
        while (cur <= end && i < max) {
            ticks.push({
                iso: cur.toISOString(),
                label: cur.toLocaleDateString('es', { month: 'short', year: '2-digit' }),
            });
            cur.setMonth(cur.getMonth() + 1);
            i += 1;
        }
    }
    if (ticks.length === 0) {
        ticks.push({ iso: start.toISOString(), label: '—' });
    }
    return ticks;
}

function weekOfYear(d: Date): number {
    const target = new Date(d.valueOf());
    const dayNr = (d.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = new Date(target.getFullYear(), 0, 4);
    return 1 + Math.round((target.getTime() - firstThursday.getTime()) / 604_800_000);
}

interface GanttRowProps {
    issue: IssueGanttDto;
    minDate: Date;
    totalDays: number;
    onClick: () => void;
}

const GanttRow = ({ issue, minDate, totalDays, onClick }: GanttRowProps): React.ReactElement | null => {
    const start = issue.startDate ? new Date(issue.startDate) : null;
    const end = issue.dueDate ? new Date(issue.dueDate) : start;
    const startVal = start ?? end;
    if (!startVal || !end) return null;

    const leftDays = (startVal.getTime() - minDate.getTime()) / 86_400_000;
    const spanDays = Math.max(0.5, (end.getTime() - startVal.getTime()) / 86_400_000);

    const leftPct = (leftDays / totalDays) * 100;
    const widthPct = Math.min(100 - leftPct, (spanDays / totalDays) * 100);

    const color = barColor(issue);

    return (
        <button
            type="button"
            onClick={onClick}
            className="grid w-full border-b border-[var(--neutral-100)] hover:bg-[var(--neutral-50)] text-left"
            style={{ gridTemplateColumns: '320px 1fr' }}
        >
            <div className="px-3 py-2 flex items-center gap-2 min-w-0">
                <span className="font-mono text-[10.5px] text-[var(--neutral-600)] shrink-0">
                    {issue.projectIdentifier}-{issue.sequenceId}
                </span>
                <span className="text-[12.5px] text-[var(--neutral-1200)] truncate">
                    {issue.title}
                </span>
            </div>
            <div className="relative h-9 px-3">
                <div
                    className={cn(
                        'absolute top-1/2 -translate-y-1/2 h-3 rounded-sm',
                        issue.isOverdue && 'animate-pulse',
                    )}
                    style={{
                        left: `${Math.max(0, leftPct)}%`,
                        width: `${Math.max(0.5, widthPct)}%`,
                        background: color,
                    }}
                    title={`${issue.title} · ${formatDate(issue.startDate)} → ${formatDate(issue.dueDate)}`}
                />
            </div>
        </button>
    );
};

function barColor(issue: IssueGanttDto): string {
    if (issue.isOverdue) return '#ef4444';
    if (issue.stateCategory === 'Completed') return '#22c55e';
    if (issue.stateCategory === 'Cancelled') return '#94a3b8';
    if (issue.stateCategory === 'Started') return 'var(--brand-700)';
    return '#64748b';
}

interface DetailRowProps {
    label: string;
    children: React.ReactNode;
}

const DetailRow = ({ label, children }: DetailRowProps): React.ReactElement => (
    <div className="flex items-center justify-between gap-3">
        <span className="text-[var(--neutral-600)] text-[12px] uppercase tracking-[0.06em] font-medium">
            {label}
        </span>
        <span className="text-[var(--neutral-1200)] text-right">{children}</span>
    </div>
);

interface ToggleGroupProps {
    ariaLabel: string;
    options: { value: string; label: string }[];
    value: string;
    onChange: (next: string) => void;
}

const ToggleGroup = ({ ariaLabel, options, value, onChange }: ToggleGroupProps): React.ReactElement => (
    <div
        role="radiogroup"
        aria-label={ariaLabel}
        className="inline-flex rounded-md border border-[var(--neutral-400)] overflow-hidden text-[11px] font-mono"
    >
        {options.map((o, i) => (
            <button
                key={o.value}
                type="button"
                role="radio"
                aria-checked={value === o.value}
                onClick={() => onChange(o.value)}
                className={cn(
                    'px-2.5 py-1',
                    i > 0 && 'border-l border-[var(--neutral-400)]',
                    value === o.value ? 'bg-[var(--neutral-200)]' : 'bg-white',
                )}
            >
                {o.label.toUpperCase()}
            </button>
        ))}
    </div>
);
