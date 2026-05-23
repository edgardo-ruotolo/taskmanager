import type React from 'react';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { Eyebrow } from '@/components/ui/eyebrow';
import { useAnalyticsFiltersStore } from '../../application/filters-store';
import { useBurndown } from '../../application/use-analytics';
import { ChartEmpty } from '../components/ChartEmpty';
import { ChartSkeleton } from '../components/ChartSkeleton';

export const BurndownPage = (): React.ReactElement => {
    const { workspaceSlug = '' } = useParams<{ workspaceSlug: string }>();
    const filters = useAnalyticsFiltersStore(workspaceSlug);
    const { data, isLoading } = useBurndown(workspaceSlug, filters);

    const series = useMemo(() => {
        if (!data) return [];
        return data.map((p) => ({
            label: new Date(p.date).toLocaleDateString('es', { day: '2-digit', month: 'short' }),
            date: p.date,
            real: p.remaining,
            ideal: Number(p.ideal.toFixed(2)),
            completed: p.completed,
            total: p.total,
        }));
    }, [data]);

    const lastPoint = data?.[data.length - 1];
    const firstPoint = data?.[0];

    const totalScope = lastPoint?.total ?? 0;
    const completed = lastPoint?.completed ?? 0;
    const remaining = lastPoint?.remaining ?? 0;
    const daysRange =
        firstPoint && lastPoint
            ? Math.max(
                  1,
                  Math.ceil(
                      (new Date(lastPoint.date).getTime() - new Date(firstPoint.date).getTime()) /
                          86_400_000,
                  ),
              )
            : 0;

    return (
        <div className="mx-auto max-w-[1100px] px-10 py-8 space-y-5">
            <div>
                <h2 className="text-[20px] font-medium tracking-[-0.02em] text-[var(--neutral-1200)]">
                    Burndown
                </h2>
                <p className="text-[12.5px] text-[var(--neutral-600)] mt-0.5">
                    {filters.cycleId
                        ? 'Mostrando el ciclo seleccionado en los filtros.'
                        : 'Mostrando el rango de fechas activo (por defecto, últimos 30 días).'}
                </p>
            </div>

            <div className="bg-white p-[22px] rounded-lg border border-[var(--neutral-400)]">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <Eyebrow>Issues restantes</Eyebrow>
                        <div className="text-[22px] font-medium tracking-[-0.025em] text-[var(--neutral-1200)] mt-1.5 leading-tight">
                            {totalScope} en alcance · {completed} completadas
                        </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                        <Legend color="var(--brand-700)" label="REAL" />
                        <Legend color="var(--neutral-500)" label="IDEAL" dashed />
                    </div>
                </div>

                {isLoading ? (
                    <ChartSkeleton variant="line" />
                ) : series.length === 0 ? (
                    <ChartEmpty />
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={series} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="var(--neutral-400)"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="label"
                                tick={{ fill: 'var(--neutral-600)', fontSize: 10 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fill: 'var(--neutral-600)', fontSize: 10 }}
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
                            <Line
                                type="monotone"
                                dataKey="real"
                                name="Restantes"
                                stroke="var(--brand-700)"
                                strokeWidth={2}
                                dot={{ fill: 'var(--brand-700)', r: 3, strokeWidth: 1.5, stroke: 'white' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="ideal"
                                name="Ideal"
                                stroke="var(--neutral-500)"
                                strokeWidth={1.5}
                                strokeDasharray="4 4"
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Scope total" value={totalScope.toString()} />
                <StatCard label="Completadas" value={completed.toString()} accent="green" />
                <StatCard label="Restantes" value={remaining.toString()} accent="brand" />
                <StatCard label="Días" value={daysRange.toString()} />
            </div>
        </div>
    );
};

interface StatCardProps {
    label: string;
    value: string;
    accent?: 'green' | 'brand';
}

const StatCard = ({ label, value, accent }: StatCardProps): React.ReactElement => {
    const color =
        accent === 'green'
            ? 'text-[var(--green-700)]'
            : accent === 'brand'
              ? 'text-[var(--brand-700)]'
              : 'text-[var(--neutral-1200)]';
    return (
        <div className="bg-white p-4 rounded-lg border border-[var(--neutral-400)]">
            <Eyebrow>{label}</Eyebrow>
            <div className={`mt-2 text-[28px] font-medium tracking-[-0.03em] leading-none ${color}`}>
                {value}
            </div>
        </div>
    );
};

interface LegendProps {
    color: string;
    label: string;
    dashed?: boolean;
}

const Legend = ({ color, label, dashed }: LegendProps): React.ReactElement => (
    <span className="flex items-center gap-1.5 font-mono text-[11px] text-[var(--neutral-600)]">
        <span
            className={`w-2.5 inline-block ${dashed ? '' : 'h-0.5'}`}
            style={dashed ? { borderTop: `1.5px dashed ${color}`, marginBottom: 1 } : { background: color }}
            aria-hidden="true"
        />
        {label}
    </span>
);
