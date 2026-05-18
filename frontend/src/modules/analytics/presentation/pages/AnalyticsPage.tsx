import { useState } from 'react';
import type React from 'react';
import { useParams } from 'react-router-dom';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    AreaChart,
    Area,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    Radar,
    BarChart,
    Bar,
    Cell,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useAnalyticsOverview } from '../../application/use-analytics';

const TOOLTIP_STYLE = {
    backgroundColor: 'var(--bg-surface-2)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '6px',
    color: 'var(--txt-primary)',
    fontSize: 12,
} as const;

const PRIORITY_LABELS: Record<number, string> = {
    0: 'Sin prioridad',
    1: 'Urgente',
    2: 'Alta',
    3: 'Media',
    4: 'Baja',
};

const PRIORITY_COLORS: Record<number, string> = {
    0: '#6b7280',
    1: '#ef4444',
    2: '#f97316',
    3: '#3b82f6',
    4: '#22c55e',
};

interface InsightCardProps {
    label: string;
    value: number | string;
}

function InsightCard({ label, value }: InsightCardProps): React.ReactElement {
    return (
        <div className="flex flex-col gap-1 py-4 border-r border-subtle last:border-r-0 px-4 first:pl-0">
            <p className="text-[13px] text-tertiary">{label}</p>
            <p className="text-[20px] font-bold text-primary leading-none">{value}</p>
        </div>
    );
}

function LoadingSkeleton(): React.ReactElement {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-4 gap-0 border border-subtle rounded-lg">
                {([0, 1, 2, 3] as const).map((k) => (
                    <Skeleton key={k} className="h-16 bg-layer-1 m-4" />
                ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-64 rounded-lg bg-layer-1" />
                <Skeleton className="h-64 rounded-lg bg-layer-1" />
            </div>
        </div>
    );
}

type TabId = 'overview' | 'work-items';

interface TabButtonProps {
    id: TabId;
    label: string;
    activeTab: TabId;
    onSelect: (id: TabId) => void;
}

function TabButton({ id, label, activeTab, onSelect }: TabButtonProps): React.ReactElement {
    const isActive = activeTab === id;
    return (
        <button
            type="button"
            onClick={() => onSelect(id)}
            className={cn(
                'px-3 py-1.5 text-[13px] font-medium rounded-sm transition-colors',
                isActive
                    ? 'bg-layer-2 text-primary border border-subtle'
                    : 'text-secondary hover:text-primary hover:bg-layer-transparent-hover',
            )}
        >
            {label}
        </button>
    );
}

interface StateChartPoint {
    name: string;
    count: number;
    color: string;
}

interface PriorityChartPoint {
    name: string;
    count: number;
    color: string;
}

function useAnalyticsData(workspaceSlug: string): {
    radarData: { dimension: string; value: number }[];
    trendData: { week: string; created: number; resolved: number }[];
    stateData: StateChartPoint[];
    priorityData: PriorityChartPoint[];
    data: ReturnType<typeof useAnalyticsOverview>['data'];
    isLoading: boolean;
} {
    const { data, isLoading } = useAnalyticsOverview(workspaceSlug);
    const radarData = [
        { dimension: 'Tareas', value: data?.totalIssues ?? 0 },
        { dimension: 'Completados', value: data?.completedIssues ?? 0 },
        { dimension: 'Ciclos', value: 0 },
        { dimension: 'Módulos', value: 0 },
        { dimension: 'Miembros', value: 0 },
        { dimension: 'Atrasados', value: data?.overdueIssues ?? 0 },
    ];
    const trendData = Array.from({ length: 8 }, (_, i) => ({
        week: `Sem ${i + 1}`,
        created: (i * 3 + 1) % 5,
        resolved: (i * 2) % 4,
    }));
    const stateData: StateChartPoint[] = (data?.issuesByState ?? []).map((s) => ({
        name: s.stateName,
        count: s.count,
        color: s.stateColor,
    }));
    const priorityData: PriorityChartPoint[] = (data?.issuesByPriority ?? []).map((p) => ({
        name: PRIORITY_LABELS[p.priority] ?? `P${p.priority}`,
        count: p.count,
        color: PRIORITY_COLORS[p.priority] ?? '#6b7280',
    }));
    return { radarData, trendData, stateData, priorityData, data, isLoading };
}

interface StateBarChartProps {
    stateData: StateChartPoint[];
}

function StateBarChart({ stateData }: StateBarChartProps): React.ReactElement {
    if (stateData.length === 0) {
        return (
            <div className="flex items-center justify-center h-[200px]">
                <p className="text-xs text-placeholder italic">Sin datos</p>
            </div>
        );
    }
    return (
        <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stateData} margin={{ top: 4, right: 4, left: -20, bottom: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis
                    dataKey="name"
                    tick={{ fill: 'var(--txt-tertiary)', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    angle={-25}
                    textAnchor="end"
                />
                <YAxis
                    tick={{ fill: 'var(--txt-tertiary)', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="count" name="Tareas" radius={[4, 4, 0, 0]}>
                    {stateData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}

interface PriorityBarChartProps {
    priorityData: PriorityChartPoint[];
}

function PriorityBarChart({ priorityData }: PriorityBarChartProps): React.ReactElement {
    if (priorityData.length === 0) {
        return (
            <div className="flex items-center justify-center h-[200px]">
                <p className="text-xs text-placeholder italic">Sin datos</p>
            </div>
        );
    }
    return (
        <ResponsiveContainer width="100%" height={200}>
            <BarChart data={priorityData} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis
                    dataKey="name"
                    tick={{ fill: 'var(--txt-tertiary)', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                />
                <YAxis
                    tick={{ fill: 'var(--txt-tertiary)', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="count" name="Tareas" radius={[4, 4, 0, 0]}>
                    {priorityData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}

export const AnalyticsPage = (): React.ReactElement => {
    const { workspaceSlug = '' } = useParams<{ workspaceSlug: string }>();
    const [activeTab, setActiveTab] = useState<TabId>('overview');
    const { radarData, trendData, stateData, priorityData, data, isLoading } = useAnalyticsData(workspaceSlug);

    return (
        <div className="p-6 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                    <div className="flex items-center gap-1 mb-4">
                        <div className="flex items-center gap-1 border border-subtle rounded-sm p-0.5 bg-layer-1">
                            <TabButton
                                id="overview"
                                label="Resumen"
                                activeTab={activeTab}
                                onSelect={setActiveTab}
                            />
                            <TabButton
                                id="work-items"
                                label="Elementos de trabajo"
                                activeTab={activeTab}
                                onSelect={setActiveTab}
                            />
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <LoadingSkeleton />
                ) : (
                    <div className="space-y-8 animate-fade-in">
                        {activeTab === 'overview' && (
                            <>
                                <div>
                                    <h2 className="text-xl font-bold text-primary mb-4">Resumen</h2>

                                    <div className="grid grid-cols-2 md:grid-cols-4 border border-subtle rounded-t-lg overflow-hidden">
                                        <InsightCard label="Total de elementos" value={data?.totalIssues ?? 0} />
                                        <InsightCard label="Abiertos" value={data?.openIssues ?? 0} />
                                        <InsightCard label="Completados" value={data?.completedIssues ?? 0} />
                                        <InsightCard label="Atrasados" value={data?.overdueIssues ?? 0} />
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 border border-subtle border-t-0 rounded-b-lg overflow-hidden">
                                        <InsightCard label="Ciclos activos" value={0} />
                                        <InsightCard label="Módulos activos" value={0} />
                                        <InsightCard label="Vistas" value={0} />
                                        <InsightCard label="Miembros" value={0} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-sm font-semibold text-primary">
                                        Información del workspace
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="border border-subtle rounded-lg p-4">
                                            <h4 className="text-sm font-medium text-secondary mb-4">
                                                Resumen de actividad
                                            </h4>
                                            <ResponsiveContainer width="100%" height={220}>
                                                <RadarChart
                                                    data={radarData}
                                                    margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
                                                >
                                                    <PolarGrid stroke="var(--border-subtle)" />
                                                    <PolarAngleAxis
                                                        dataKey="dimension"
                                                        tick={{ fill: 'var(--txt-tertiary)', fontSize: 11 }}
                                                    />
                                                    <Radar
                                                        dataKey="value"
                                                        stroke="#3b82f6"
                                                        fill="#3b82f6"
                                                        fillOpacity={0.2}
                                                        strokeWidth={2}
                                                    />
                                                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                                                </RadarChart>
                                            </ResponsiveContainer>
                                        </div>

                                        <div className="border border-subtle rounded-lg p-4">
                                            <h4 className="text-sm font-medium text-secondary mb-4">
                                                Issues por estado
                                            </h4>
                                            <StateBarChart stateData={stateData} />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'work-items' && (
                            <>
                                <div>
                                    <h2 className="text-xl font-bold text-primary mb-4">
                                        Elementos de trabajo
                                    </h2>
                                    <div className="grid grid-cols-2 md:grid-cols-5 border border-subtle rounded-lg overflow-hidden">
                                        <InsightCard label="Total" value={data?.totalIssues ?? 0} />
                                        <InsightCard label="Iniciados" value={0} />
                                        <InsightCard label="En backlog" value={data?.openIssues ?? 0} />
                                        <InsightCard label="No iniciados" value={0} />
                                        <InsightCard label="Completados" value={data?.completedIssues ?? 0} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="border border-subtle rounded-lg p-4">
                                        <h4 className="text-sm font-semibold text-primary mb-4">
                                            Issues por prioridad
                                        </h4>
                                        <PriorityBarChart priorityData={priorityData} />
                                    </div>

                                    <div className="border border-subtle rounded-lg p-4">
                                        <h4 className="text-sm font-semibold text-primary mb-4">
                                            Creado vs Resuelto
                                        </h4>
                                        <ResponsiveContainer width="100%" height={200}>
                                            <AreaChart
                                                data={trendData}
                                                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                                            >
                                                <defs>
                                                    <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                    </linearGradient>
                                                    <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    stroke="var(--border-subtle)"
                                                    vertical={false}
                                                />
                                                <XAxis
                                                    dataKey="week"
                                                    tick={{ fill: 'var(--txt-tertiary)', fontSize: 11 }}
                                                    axisLine={false}
                                                    tickLine={false}
                                                />
                                                <YAxis
                                                    tick={{ fill: 'var(--txt-tertiary)', fontSize: 11 }}
                                                    axisLine={false}
                                                    tickLine={false}
                                                    allowDecimals={false}
                                                />
                                                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                                                <Legend wrapperStyle={{ fontSize: 11, color: 'var(--txt-tertiary)' }} />
                                                <Area
                                                    type="monotone"
                                                    dataKey="created"
                                                    name="Creado"
                                                    stroke="#3b82f6"
                                                    fill="url(#colorCreated)"
                                                    strokeWidth={2}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="resolved"
                                                    name="Resuelto"
                                                    stroke="#22c55e"
                                                    fill="url(#colorResolved)"
                                                    strokeWidth={2}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
