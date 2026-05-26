import type React from 'react';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    ComposedChart,
    Area,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { Eyebrow } from '@/components/ui/eyebrow';
import { cn } from '@/lib/utils';
import {
    useAnalyticsOverview,
    useProjectActivity,
    useCreatedVsResolved,
    useIssuesByPriority,
    useIssuesByState,
} from '../../application/use-analytics';
import type {
    ProjectActivityPoint,
    CreatedVsResolvedPoint,
    PriorityBucket,
    StateBucket,
} from '../../domain/types';
import { ChartSkeleton } from '../components/ChartSkeleton';
import { ChartEmpty } from '../components/ChartEmpty';

const STATE_COLORS = [
    'var(--brand-700)',
    'var(--green-700)',
    'var(--amber-700)',
    'var(--red-700)',
    'var(--neutral-700)',
];

const PRIORITY_LABELS: Record<string, string> = {
    Urgent: 'Urgente',
    High: 'Alta',
    Medium: 'Media',
    Low: 'Baja',
    None: 'Sin prioridad',
};

interface KpiCardProps {
    label: string;
    value: number | string;
    unit?: string;
    delta: string;
    trend: 'up' | 'down' | 'flat';
}

function KpiCard({ label, value, unit, delta, trend }: KpiCardProps): React.ReactElement {
    return (
        <div className="bg-white p-[18px] rounded-lg border border-[var(--neutral-400)]">
            <Eyebrow>{label}</Eyebrow>
            <div className="flex items-baseline gap-1.5 mt-3">
                <span className="text-[44px] font-medium leading-none tracking-[-0.05em] text-[var(--neutral-1200)]">
                    {value}
                </span>
                {unit && <span className="text-[13px] text-[var(--neutral-600)]">{unit}</span>}
            </div>
            <div
                className={cn(
                    'font-mono text-[10.5px] mt-2 tracking-[0.05em] flex items-center gap-1',
                    trend === 'up'
                        ? 'text-[var(--green-700)]'
                        : trend === 'down'
                          ? 'text-[#c54a3a]'
                          : 'text-[var(--neutral-600)]',
                )}
            >
                {trend === 'up' && '↗'}
                {trend === 'down' && '↘'}
                {trend === 'flat' && '→'} {delta}
            </div>
        </div>
    );
}

/* ── Trend chart ── */

type TrendView = 'daily' | 'weekly';

interface TrendPoint {
    label: string;
    created: number;
    closed: number;
}

function buildWeeklySeries(points: CreatedVsResolvedPoint[]): TrendPoint[] {
    if (points.length === 0) return [];
    // Group by ISO week starting Monday. Output up to 4 weeks (W1..W4).
    const sorted = [...points].sort((a, b) => a.date.localeCompare(b.date));
    const buckets = new Map<string, { created: number; closed: number }>();
    let index = 0;
    let lastWeekKey = '';
    for (const p of sorted) {
        const d = new Date(p.date);
        const weekKey = `${d.getFullYear()}-${getIsoWeek(d)}`;
        if (weekKey !== lastWeekKey) {
            lastWeekKey = weekKey;
            index += 1;
        }
        const acc = buckets.get(weekKey) ?? { created: 0, closed: 0 };
        acc.created += p.created;
        acc.closed += p.resolved;
        buckets.set(weekKey, acc);
    }
    return Array.from(buckets.entries())
        .map(([_, value], i) => ({ label: `W${i + 1}`, ...value }));
}

function getIsoWeek(d: Date): number {
    const target = new Date(d.valueOf());
    const dayNr = (d.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = new Date(target.getFullYear(), 0, 4);
    const diff = target.getTime() - firstThursday.getTime();
    return 1 + Math.round(diff / 604_800_000);
}

function buildDailySeries(points: CreatedVsResolvedPoint[]): TrendPoint[] {
    return [...points]
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((p) => ({
            label: new Date(p.date).toLocaleDateString('es', { month: 'short', day: 'numeric' }),
            created: p.created,
            closed: p.resolved,
        }));
}

interface TrendChartProps {
    workspaceSlug: string;
}

function TrendChart({ workspaceSlug }: TrendChartProps): React.ReactElement {
    const { data, isLoading } = useCreatedVsResolved(workspaceSlug);
    const [view, setView] = useState<TrendView>('weekly');

    const series = useMemo(() => {
        if (!data) return [];
        return view === 'weekly' ? buildWeeklySeries(data) : buildDailySeries(data);
    }, [data, view]);

    return (
        <div className="bg-white p-[22px] rounded-lg border border-[var(--neutral-400)] col-span-2">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <Eyebrow>Issues creados vs cerrados</Eyebrow>
                    <div className="text-[22px] font-medium tracking-[-0.025em] text-[var(--neutral-1200)] mt-1.5 leading-tight">
                        Tendencia del flujo de trabajo.
                    </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                    <div role="tablist" aria-label="Vista" className="flex rounded-md border border-[var(--neutral-400)] overflow-hidden text-[11px] font-mono">
                        <button
                            type="button"
                            role="tab"
                            aria-selected={view === 'daily'}
                            onClick={() => setView('daily')}
                            className={cn('px-2.5 py-1', view === 'daily' ? 'bg-[var(--neutral-200)]' : 'bg-white')}
                        >
                            DÍA
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={view === 'weekly'}
                            onClick={() => setView('weekly')}
                            className={cn('px-2.5 py-1 border-l border-[var(--neutral-400)]', view === 'weekly' ? 'bg-[var(--neutral-200)]' : 'bg-white')}
                        >
                            SEM
                        </button>
                    </div>
                    <span className="flex items-center gap-1.5 font-mono text-[11px] text-[var(--neutral-600)]">
                        <span className="w-2.5 h-0.5 bg-[var(--brand-700)] inline-block" aria-hidden="true" />
                        CERRADOS
                    </span>
                    <span className="flex items-center gap-1.5 font-mono text-[11px] text-[var(--neutral-600)]">
                        <span
                            className="w-2.5 inline-block"
                            style={{ borderTop: '1.5px dashed var(--neutral-1200)', marginBottom: 1 }}
                            aria-hidden="true"
                        />
                        CREADOS
                    </span>
                </div>
            </div>

            {isLoading ? (
                <ChartSkeleton variant="line" />
            ) : series.length === 0 ? (
                <ChartEmpty />
            ) : (
                <ResponsiveContainer width="100%" height={220}>
                    <ComposedChart data={series} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="closedGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="var(--brand-700)" stopOpacity={0.25} />
                                <stop offset="100%" stopColor="var(--brand-700)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--neutral-400)" vertical={false} />
                        <XAxis
                            dataKey="label"
                            tick={{ fill: 'var(--neutral-600)', fontSize: 9 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fill: 'var(--neutral-600)', fontSize: 9 }}
                            axisLine={false}
                            tickLine={false}
                            allowDecimals={false}
                        />
                        <Tooltip
                            contentStyle={{
                                background: 'white',
                                border: '1px solid var(--neutral-400)',
                                borderRadius: 6,
                                fontSize: 12,
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="closed"
                            name="Cerrados"
                            stroke="var(--brand-700)"
                            strokeWidth={2}
                            fill="url(#closedGrad)"
                            dot={{ fill: 'var(--brand-700)', strokeWidth: 1.5, r: 3, stroke: 'white' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="created"
                            name="Creados"
                            stroke="var(--neutral-1200)"
                            strokeWidth={1.5}
                            strokeDasharray="4 4"
                            dot={false}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}

/* ── Donut by state ── */

interface DonutSegment {
    label: string;
    value: number;
    color: string;
    pct: number;
}

function buildDonutSegments(buckets: StateBucket[]): { segments: DonutSegment[]; total: number } {
    const total = buckets.reduce((acc, b) => acc + b.count, 0);
    if (total === 0) {
        return {
            segments: [{ label: 'Sin datos', value: 1, color: 'var(--neutral-400)', pct: 100 }],
            total: 0,
        };
    }
    const segments = buckets.map((b, i) => ({
        label: b.stateName,
        value: b.count,
        color: STATE_COLORS[i % STATE_COLORS.length] ?? 'var(--neutral-700)',
        pct: Math.round((b.count / total) * 100),
    }));
    return { segments, total };
}

interface DonutChartProps {
    workspaceSlug: string;
}

function DonutChart({ workspaceSlug }: DonutChartProps): React.ReactElement {
    const { data, isLoading } = useIssuesByState(workspaceSlug);
    const { segments, total } = useMemo(() => buildDonutSegments(data ?? []), [data]);

    // Render dasharray for the SVG donut: circumference = 2π·40 ≈ 251.3
    const circumference = 2 * Math.PI * 40;
    let cumulative = 0;
    const segmentsWithOffsets = segments.map((s) => {
        const fraction = s.value / segments.reduce((acc, x) => acc + x.value, 0);
        const dash = fraction * circumference;
        const offset = -cumulative * circumference;
        cumulative += fraction;
        return { ...s, dash, offset };
    });

    return (
        <div className="bg-white p-[22px] rounded-lg border border-[var(--neutral-400)]">
            <Eyebrow>Composición por estado</Eyebrow>
            <div className="text-[16px] font-medium tracking-[-0.02em] text-[var(--neutral-1200)] mt-1.5 mb-4">
                {total} {total === 1 ? 'issue' : 'issues'}
            </div>
            {isLoading ? (
                <ChartSkeleton variant="donut" />
            ) : (
                <>
                    <div className="relative flex justify-center">
                        <svg
                            viewBox="0 0 100 100"
                            className="w-40 h-40"
                            style={{ transform: 'rotate(-90deg)' }}
                            aria-hidden="true"
                        >
                            {segmentsWithOffsets.map((s) => (
                                <circle
                                    key={s.label}
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    fill="none"
                                    stroke={s.color}
                                    strokeWidth="12"
                                    strokeDasharray={`${s.dash} ${circumference}`}
                                    strokeDashoffset={s.offset}
                                />
                            ))}
                        </svg>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                            <div className="text-[28px] font-medium tracking-[-0.03em] text-[var(--neutral-1200)]">
                                {total}
                            </div>
                            <div className="font-mono text-[9.5px] text-[var(--neutral-600)] tracking-[0.1em] uppercase">
                                Total
                            </div>
                        </div>
                    </div>
                    <div className="mt-5 flex flex-col gap-1.5">
                        {segments.map((s) => (
                            <div
                                key={s.label}
                                className="grid items-center gap-2"
                                style={{ gridTemplateColumns: '14px 1fr auto auto' }}
                            >
                                <span
                                    className="w-2.5 h-2.5 rounded-sm"
                                    style={{ background: s.color }}
                                    aria-hidden="true"
                                />
                                <span className="text-[12px] font-medium text-[var(--neutral-1200)]">
                                    {s.label}
                                </span>
                                <span className="font-mono text-[12px] text-[var(--neutral-600)] tabular-nums">
                                    {s.value}
                                </span>
                                <span className="font-mono text-[12px] text-[var(--neutral-1200)]">
                                    {s.pct}%
                                </span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

/* ── Priority distribution ── */

interface PriorityChartProps {
    workspaceSlug: string;
}

function PriorityChart({ workspaceSlug }: PriorityChartProps): React.ReactElement {
    const { data, isLoading } = useIssuesByPriority(workspaceSlug);
    const buckets: PriorityBucket[] = data ?? [];
    const total = buckets.reduce((acc, b) => acc + b.count, 0);

    return (
        <div className="bg-white p-[22px] rounded-lg border border-[var(--neutral-400)]">
            <Eyebrow>Distribución por prioridad</Eyebrow>
            <div className="text-[16px] font-medium tracking-[-0.02em] text-[var(--neutral-1200)] mt-1.5 mb-4">
                {total} {total === 1 ? 'issue' : 'issues'}
            </div>
            {isLoading ? (
                <ChartSkeleton variant="bar" />
            ) : total === 0 ? (
                <ChartEmpty />
            ) : (
                <div className="flex flex-col gap-2">
                    {buckets.map((b, i) => {
                        const pct = total > 0 ? (b.count / total) * 100 : 0;
                        const color = STATE_COLORS[i % STATE_COLORS.length];
                        return (
                            <div key={b.priority} className="flex items-center gap-3">
                                <span className="w-20 text-[12px] text-[var(--neutral-1200)] truncate">
                                    {PRIORITY_LABELS[b.priority] ?? b.priority}
                                </span>
                                <div className="flex-1 bg-[var(--neutral-200)] h-2 rounded-sm overflow-hidden">
                                    <div
                                        className="h-full rounded-sm transition-[width] duration-300"
                                        style={{ width: `${pct}%`, background: color }}
                                    />
                                </div>
                                <span className="font-mono text-[11px] text-[var(--neutral-600)] tabular-nums w-10 text-right">
                                    {b.count}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

/* ── Project activity heatmap ── */

interface ProjectActivityHeatmapProps {
    workspaceSlug: string;
    projectIdentifier?: string;
}

function intensityClass(value: number): string {
    if (value === 0) return 'bg-[var(--neutral-200)]';
    if (value <= 3) return 'bg-[var(--brand-300)]';
    if (value <= 7) return 'bg-[var(--brand-500)]';
    return 'bg-[var(--brand-700)]';
}

function ProjectActivityHeatmap({ workspaceSlug, projectIdentifier }: ProjectActivityHeatmapProps): React.ReactElement {
    const enabled = !!projectIdentifier;
    const { data, isLoading } = useProjectActivity(workspaceSlug, projectIdentifier ?? '');

    return (
        <div className="bg-white p-[22px] rounded-lg border border-[var(--neutral-400)]">
            <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                    <Eyebrow>Actividad del equipo · 30 días</Eyebrow>
                    <div className="text-[22px] font-medium tracking-[-0.025em] text-[var(--neutral-1200)] mt-1.5">
                        Issues completados por día.
                    </div>
                </div>
                <Legend />
            </div>
            {!enabled ? (
                <ChartEmpty
                    title="Selecciona una proyecto"
                    description="La actividad por equipo se muestra al filtrar por proyecto."
                />
            ) : isLoading ? (
                <ChartSkeleton variant="heatmap" />
            ) : !data || data.length === 0 ? (
                <ChartEmpty />
            ) : (
                <HeatmapGrid points={data} />
            )}
        </div>
    );
}

function Legend(): React.ReactElement {
    return (
        <div className="flex items-center gap-2 font-mono text-[10px] text-[var(--neutral-600)] uppercase tracking-[0.1em]">
            <span>—</span>
            {['var(--neutral-200)', 'var(--brand-300)', 'var(--brand-500)', 'var(--brand-700)'].map((c) => (
                <span
                    key={c}
                    className="size-3 rounded-sm inline-block"
                    style={{ background: c }}
                    aria-hidden="true"
                />
            ))}
            <span>+</span>
        </div>
    );
}

function HeatmapGrid({ points }: { points: ProjectActivityPoint[] }): React.ReactElement {
    // Backend already returns 30 contiguous days ordered ascending. We render as a
    // single-row strip; if multi-member support is added later this becomes
    // `N members × 30 days`.
    return (
        <div
            className="grid gap-1"
            style={{ gridTemplateColumns: `repeat(${points.length}, 1fr)` }}
        >
            {points.map((p) => (
                <div
                    key={p.date}
                    className={cn('h-5 rounded-sm flex items-center justify-center', intensityClass(p.completed))}
                    title={`${p.date}: ${p.completed} completados`}
                >
                    <span
                        className="font-mono text-[9px]"
                        style={{ color: p.completed > 3 ? '#fff' : 'var(--neutral-1200)' }}
                    >
                        {p.completed > 0 ? p.completed : ''}
                    </span>
                </div>
            ))}
        </div>
    );
}

/* ── Page ── */

export const AnalyticsPage = (): React.ReactElement => {
    const { workspaceSlug = '', projectId } = useParams<{ workspaceSlug: string; projectId?: string }>();
    const { data: overview } = useAnalyticsOverview(workspaceSlug);
    const { data: trend } = useCreatedVsResolved(workspaceSlug);

    const kpiItems: KpiCardProps[] = useMemo(() => {
        const total = overview?.totalIssues ?? 0;
        const open = overview?.openIssues ?? 0;
        const completed = overview?.completedIssues ?? 0;
        const overdue = overview?.overdueIssues ?? 0;

        const slaPct = total > 0 ? Math.round(((total - overdue) / total) * 100) : 100;

        const velocity = computeVelocity(trend ?? []);

        return [
            { label: 'Total · issues', value: total, delta: '', trend: 'flat' },
            { label: 'En curso', value: open, unit: 'issues', delta: '', trend: 'flat' },
            { label: 'Completados', value: completed, delta: '', trend: 'up' },
            { label: 'Vencidos', value: overdue, delta: '', trend: overdue > 0 ? 'down' : 'flat' },
            {
                label: 'SLA',
                value: `${slaPct}%`,
                delta: overdue > 0 ? `${overdue} vencidos` : 'sin vencidos',
                trend: slaPct >= 90 ? 'up' : slaPct >= 70 ? 'flat' : 'down',
            },
            {
                label: 'Velocidad',
                value: velocity.toFixed(1),
                unit: 'cierres/día',
                delta: 'últimos 30 días',
                trend: velocity > 0 ? 'up' : 'flat',
            },
        ];
    }, [overview, trend]);

    return (
        <div className="w-full px-10 py-8 flex flex-col gap-7">
            {/* KPI grid */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {kpiItems.map((kpi) => (
                    <KpiCard key={kpi.label} {...kpi} />
                ))}
            </div>

            {/* Chart row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <TrendChart workspaceSlug={workspaceSlug} />
                <DonutChart workspaceSlug={workspaceSlug} />
            </div>

            {/* Priority + team activity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <PriorityChart workspaceSlug={workspaceSlug} />
                <ProjectActivityHeatmap workspaceSlug={workspaceSlug} projectIdentifier={projectId} />
            </div>
        </div>
    );
};

function computeVelocity(points: CreatedVsResolvedPoint[]): number {
    if (points.length === 0) return 0;
    const last30 = points.slice(-30);
    const total = last30.reduce((acc, p) => acc + p.resolved, 0);
    const days = Math.max(1, last30.length);
    return total / days;
}
