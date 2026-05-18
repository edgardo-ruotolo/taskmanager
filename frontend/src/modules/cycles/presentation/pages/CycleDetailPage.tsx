import type React from 'react';
import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useCycles, useCycleIssues } from '../../application/use-cycles';
import { useCycleProgress } from '../../application/use-cycle-analytics';
import { useCompany } from '@/modules/companies/application/use-companies';
import { IssuePeekOverview } from '@/modules/issues/presentation/components/IssuePeekOverview';
import type { Issue } from '@/modules/issues/domain/types';
import type { Cycle, CycleIssueRef } from '../../domain/types';
import { PRIORITY_LABELS } from '@/modules/issues/domain/types';
import type { IssuePriority } from '@/modules/issues/domain/types';

const STATUS_LABELS = {
    Draft: 'Borrador',
    Started: 'En curso',
    Completed: 'Completado',
} as const;

const STATUS_CLASSES = {
    Draft: 'bg-layer-1 text-secondary',
    Started: 'bg-blue-900 text-blue-300',
    Completed: 'bg-green-900 text-green-300',
} as const;

const TOOLTIP_STYLE: React.CSSProperties = {
    background: '#131319',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '4px',
    fontSize: '11px',
};

interface IssueAnalytics {
    totalIssues: number;
    completedIssues: number;
    progressPct: number;
    issuesByState: Record<string, { color: string; count: number }>;
}

function computeAnalytics(issues: CycleIssueRef[]): IssueAnalytics {
    const totalIssues = issues.length;
    const completedIssues = issues.filter((i) => i.stateName.toLowerCase().includes('complet')).length;
    const progressPct = totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0;
    const issuesByState = issues.reduce<Record<string, { color: string; count: number }>>((acc, ref) => {
        if (!acc[ref.stateName]) {
            acc[ref.stateName] = { color: ref.stateColor, count: 0 };
        }
        acc[ref.stateName].count += 1;
        return acc;
    }, {});
    return { totalIssues, completedIssues, progressPct, issuesByState };
}

function issueRefToIssue(ref: CycleIssueRef, companyId: string): Issue {
    return {
        id: ref.issueId,
        sequenceId: ref.issueSequenceId,
        title: ref.issueTitle,
        priority: ref.priority as IssuePriority,
        companyId,
        stateId: '',
        stateName: ref.stateName,
        stateColor: ref.stateColor,
        createdById: '',
        createdAt: '',
        updatedAt: '',
    };
}

interface BurndownPoint {
    label: string;
    ideal: number;
    actual: number | null;
}

function buildBurndownData(
    startDate: string,
    endDate: string,
    totalIssues: number,
    completedIssues: number,
): BurndownPoint[] {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000));
    const elapsedDays = Math.max(0, Math.min(totalDays, Math.ceil((today.getTime() - start.getTime()) / 86400000)));
    const step = Math.max(1, Math.ceil(totalDays / 10));

    const daySet = new Set<number>([0]);
    for (let d = step; d < totalDays; d += step) {
        daySet.add(d);
    }
    daySet.add(totalDays);

    return [...daySet].sort((a, b) => a - b).map((day) => {
        const date = new Date(start.getTime() + day * 86400000);
        const ideal = Math.max(0, Math.round(totalIssues * (1 - day / totalDays)));
        let actual: number | null = null;
        if (day === 0) {
            actual = totalIssues;
        } else if (day <= elapsedDays && elapsedDays > 0) {
            actual = Math.max(0, Math.round(totalIssues - completedIssues * (day / elapsedDays)));
        }
        return {
            label: date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
            ideal,
            actual,
        };
    });
}

interface VelocityMetrics {
    issuesPerDay: number;
    projectedEnd: string | null;
    daysLeft: number;
}

function computeVelocity(
    startDate: string,
    endDate: string | null,
    completedIssues: number,
    remainingIssues: number,
): VelocityMetrics {
    const today = new Date();
    const start = new Date(startDate);
    const daysElapsed = Math.max(1, Math.ceil((today.getTime() - start.getTime()) / 86400000));
    const issuesPerDay = completedIssues / daysElapsed;
    const daysLeft = endDate
        ? Math.max(0, Math.ceil((new Date(endDate).getTime() - today.getTime()) / 86400000))
        : 0;

    let projectedEnd: string | null = null;
    if (remainingIssues === 0) {
        projectedEnd = 'Completado';
    } else if (issuesPerDay > 0) {
        const proj = new Date(today.getTime() + (remainingIssues / issuesPerDay) * 86400000);
        projectedEnd = proj.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    return { issuesPerDay, projectedEnd, daysLeft };
}

interface BurndownSectionProps {
    cycle: Cycle;
    analytics: IssueAnalytics;
}

function BurndownSection({ cycle, analytics }: BurndownSectionProps): React.ReactElement | null {
    if (!cycle.startDate || !cycle.endDate || analytics.totalIssues === 0) return null;
    const data = buildBurndownData(cycle.startDate, cycle.endDate, analytics.totalIssues, analytics.completedIssues);
    return (
        <div>
            <p className="text-xs font-semibold text-placeholder uppercase tracking-wider mb-3">Curva de avance</p>
            <ResponsiveContainer width="100%" height={140}>
                <LineChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                        dataKey="label"
                        tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.3)' }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.3)' }}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                    />
                    <Tooltip
                        contentStyle={TOOLTIP_STYLE}
                        itemStyle={{ color: 'rgba(255,255,255,0.75)' }}
                        labelStyle={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}
                    />
                    <Line
                        type="linear"
                        dataKey="ideal"
                        stroke="rgba(255,255,255,0.2)"
                        strokeDasharray="4 4"
                        dot={false}
                        name="Ideal"
                        strokeWidth={1.5}
                    />
                    <Line
                        type="linear"
                        dataKey="actual"
                        stroke="#60a5fa"
                        strokeWidth={2}
                        dot={{ r: 3, fill: '#60a5fa' }}
                        connectNulls={false}
                        name="Real"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

interface VelocitySectionProps {
    cycle: Cycle;
    analytics: IssueAnalytics;
}

function VelocitySection({ cycle, analytics }: VelocitySectionProps): React.ReactElement | null {
    if (!cycle.startDate) return null;
    const remaining = analytics.totalIssues - analytics.completedIssues;
    const { issuesPerDay, projectedEnd, daysLeft } = computeVelocity(
        cycle.startDate,
        cycle.endDate,
        analytics.completedIssues,
        remaining,
    );
    const rateLabel =
        issuesPerDay < 1
            ? `${(issuesPerDay * 7).toFixed(1)} / sem`
            : `${issuesPerDay.toFixed(1)} / día`;

    return (
        <div>
            <p className="text-xs font-semibold text-placeholder uppercase tracking-wider mb-3">Velocidad</p>
            <div className="space-y-1.5">
                <div className="flex items-center justify-between px-3 py-2 bg-surface-2 rounded-md">
                    <span className="text-xs text-secondary">Tasa</span>
                    <span className="text-xs font-semibold text-primary">{rateLabel}</span>
                </div>
                {daysLeft > 0 && (
                    <div className="flex items-center justify-between px-3 py-2 bg-surface-2 rounded-md">
                        <span className="text-xs text-secondary">Días restantes</span>
                        <span className="text-xs font-semibold text-primary">{daysLeft}</span>
                    </div>
                )}
                {projectedEnd && (
                    <div className="flex items-center justify-between px-3 py-2 bg-surface-2 rounded-md">
                        <span className="text-xs text-secondary">Fin estimado</span>
                        <span className="text-xs font-semibold text-primary">{projectedEnd}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

interface ServerProgress {
    totalIssues: number;
    completedIssues: number;
    inProgressIssues: number;
    pendingIssues: number;
    completionPercentage: number;
}

interface AnalyticsSidebarProps {
    isLoading: boolean;
    analytics: IssueAnalytics;
    description: string | null | undefined;
    serverProgress: ServerProgress | null;
    cycle: Cycle | null;
}

function AnalyticsSidebar({ isLoading, analytics, description, cycle, serverProgress }: AnalyticsSidebarProps): React.ReactElement {
    return (
        <aside className="w-[300px] shrink-0 border-l border-subtle bg-surface-1 overflow-y-auto p-5 space-y-6">
            <div>
                <p className="text-xs font-semibold text-placeholder uppercase tracking-wider mb-3">Progreso</p>
                {isLoading ? (
                    <Skeleton className="h-4 w-full bg-layer-1" />
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs text-secondary">
                                {analytics.completedIssues} / {analytics.totalIssues} completados
                            </span>
                            <span className="text-xs font-semibold text-primary">{analytics.progressPct}%</span>
                        </div>
                        <Progress value={analytics.progressPct} className="h-2" />
                    </>
                )}
            </div>

            {serverProgress && (
                <div>
                    <p className="text-xs font-semibold text-placeholder uppercase tracking-wider mb-3">Desglose</p>
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between px-3 py-2 bg-surface-2 rounded-md">
                            <span className="text-xs text-secondary">Total</span>
                            <span className="text-xs font-semibold text-primary">{serverProgress.totalIssues}</span>
                        </div>
                        <div className="flex items-center justify-between px-3 py-2 bg-surface-2 rounded-md">
                            <span className="text-xs text-secondary">Completadas</span>
                            <span className="text-xs font-semibold text-green-400">{serverProgress.completedIssues}</span>
                        </div>
                        <div className="flex items-center justify-between px-3 py-2 bg-surface-2 rounded-md">
                            <span className="text-xs text-secondary">En progreso</span>
                            <span className="text-xs font-semibold text-blue-400">{serverProgress.inProgressIssues}</span>
                        </div>
                        <div className="flex items-center justify-between px-3 py-2 bg-surface-2 rounded-md">
                            <span className="text-xs text-secondary">Pendientes</span>
                            <span className="text-xs font-semibold text-secondary">{serverProgress.pendingIssues}</span>
                        </div>
                        <div className="flex items-center justify-between px-3 py-2 bg-surface-2 rounded-md">
                            <span className="text-xs text-secondary">Completado</span>
                            <span className="text-xs font-semibold text-primary">{serverProgress.completionPercentage}%</span>
                        </div>
                    </div>
                </div>
            )}

            {!isLoading && cycle && <BurndownSection cycle={cycle} analytics={analytics} />}
            {!isLoading && cycle && <VelocitySection cycle={cycle} analytics={analytics} />}

            <div>
                <p className="text-xs font-semibold text-placeholder uppercase tracking-wider mb-3">Tareas por estado</p>
                {isLoading ? (
                    <div className="space-y-2">
                        {(['l0', 'l1', 'l2'] as const).map((k) => (
                            <Skeleton key={k} className="h-8 w-full bg-layer-1 rounded" />
                        ))}
                    </div>
                ) : analytics.totalIssues === 0 ? (
                    <p className="text-xs text-placeholder italic">Sin tareas</p>
                ) : (
                    <div className="space-y-2">
                        {Object.entries(analytics.issuesByState).map(([name, { color, count }]) => (
                            <div key={name} className="flex items-center gap-2 px-3 py-2 bg-surface-2 rounded-md">
                                <span
                                    className="w-2 h-2 rounded-full shrink-0"
                                    style={{ backgroundColor: color }}
                                    aria-hidden="true"
                                />
                                <span className="flex-1 text-xs text-secondary truncate">{name}</span>
                                <span className="text-xs font-semibold text-primary">{count}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {description && (
                <div>
                    <p className="text-xs font-semibold text-placeholder uppercase tracking-wider mb-2">Descripción</p>
                    <p className="text-xs text-secondary leading-relaxed">{description}</p>
                </div>
            )}
        </aside>
    );
}

export const CycleDetailPage = (): React.ReactElement => {
    const { workspaceSlug = '', companyId = '', cycleId = '' } = useParams<{
        workspaceSlug: string;
        companyId: string;
        cycleId: string;
    }>();
    const navigate = useNavigate();
    const [peekIssue, setPeekIssue] = useState<Issue | null>(null);

    const { data: cycles, isLoading: cyclesLoading } = useCycles(workspaceSlug, companyId);
    const { data: issueRefs, isLoading: issuesLoading } = useCycleIssues(workspaceSlug, companyId, cycleId);
    const { data: company } = useCompany(workspaceSlug, companyId);
    const { data: cycleProgress } = useCycleProgress(workspaceSlug, companyId, cycleId);

    const cycle = cycles?.find((c) => c.id === cycleId) ?? null;
    const issues = issueRefs ?? [];
    const isLoading = cyclesLoading || issuesLoading;
    const companyIdentifier = company?.identifier ?? 'ISS';

    const analytics = computeAnalytics(issues);

    if (!isLoading && !cycle) {
        return (
            <div className="p-8 flex flex-col items-center justify-center py-24 text-center">
                <RefreshCw size={48} className="text-placeholder mb-4" />
                <h2 className="text-lg font-medium text-secondary mb-2">Ciclo no encontrado</h2>
                <Button
                    variant="outline"
                    className="border-subtle text-secondary mt-4"
                    onClick={() => void navigate(`/${workspaceSlug}/companies/${companyId}/cycles`)}
                >
                    <ArrowLeft size={14} className="mr-2" />
                    Volver a ciclos
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="px-6 py-4 border-b border-subtle bg-canvas shrink-0">
                <nav className="flex items-center gap-1.5 text-xs text-placeholder mb-3">
                    <Link
                        to={`/${workspaceSlug}/companies`}
                        className="hover:text-secondary transition-colors"
                    >
                        {workspaceSlug}
                    </Link>
                    <ChevronRight size={12} />
                    <Link
                        to={`/${workspaceSlug}/companies/${companyId}/cycles`}
                        className="hover:text-secondary transition-colors"
                    >
                        Ciclos
                    </Link>
                    <ChevronRight size={12} />
                    <span className="text-primary">{cycle?.name ?? cycleId}</span>
                </nav>

                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => void navigate(`/${workspaceSlug}/companies/${companyId}/cycles`)}
                        className="h-7 px-2 text-secondary hover:text-primary -ml-2"
                    >
                        <ArrowLeft size={14} className="mr-1.5" />
                        Volver
                    </Button>

                    {cycle && (
                        <Badge className={`text-xs border-0 ${STATUS_CLASSES[cycle.status]}`}>
                            {STATUS_LABELS[cycle.status]}
                        </Badge>
                    )}

                    <h1 className="text-lg font-semibold text-primary">
                        {isLoading ? <Skeleton className="h-5 w-40 bg-layer-1" /> : (cycle?.name ?? '')}
                    </h1>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading && (
                        <div className="space-y-2">
                            {(['sk-0', 'sk-1', 'sk-2', 'sk-3'] as const).map((k) => (
                                <Skeleton key={k} className="h-14 w-full bg-layer-1 rounded-lg" />
                            ))}
                        </div>
                    )}

                    {!isLoading && issues.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <RefreshCw size={36} className="text-placeholder mb-3" />
                            <p className="text-sm text-secondary font-medium mb-1">Sin tareas en este ciclo</p>
                            <p className="text-xs text-placeholder">
                                Ve al listado de ciclos para agregar tareas.
                            </p>
                        </div>
                    )}

                    {!isLoading && issues.length > 0 && (
                        <div className="border border-subtle rounded-lg overflow-hidden">
                            <div className="flex items-center gap-3 px-4 h-9 border-b border-subtle bg-surface-1">
                                <span className="w-2 h-2 shrink-0 opacity-0" aria-hidden="true" />
                                <span className="text-xs font-medium text-placeholder w-16">ID</span>
                                <span className="flex-1 text-xs font-medium text-placeholder">Título</span>
                                <span className="text-xs font-medium text-placeholder w-28 text-right">Estado</span>
                                <span className="text-xs font-medium text-placeholder w-20 text-right">Prioridad</span>
                            </div>
                            {issues.map((ref) => (
                                <button
                                    key={ref.issueId}
                                    type="button"
                                    onClick={() => setPeekIssue(issueRefToIssue(ref, companyId))}
                                    className="w-full flex items-center gap-3 px-4 h-12 border-b border-subtle last:border-b-0 hover:bg-surface-2 transition-colors text-left"
                                >
                                    <span
                                        className="w-2 h-2 rounded-full shrink-0"
                                        style={{ backgroundColor: ref.stateColor }}
                                        aria-hidden="true"
                                    />
                                    <span className="text-xs font-mono text-placeholder w-16">
                                        {companyIdentifier}-{ref.issueSequenceId}
                                    </span>
                                    <span className="flex-1 text-sm text-primary truncate">{ref.issueTitle}</span>
                                    <span className="text-xs text-placeholder w-28 text-right">{ref.stateName}</span>
                                    <span className="text-xs text-placeholder w-20 text-right">
                                        {PRIORITY_LABELS[ref.priority as IssuePriority]}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <AnalyticsSidebar
                    isLoading={isLoading}
                    analytics={analytics}
                    description={cycle?.description}
                    cycle={cycle}
                    serverProgress={cycleProgress ?? null}
                />
            </div>

            <IssuePeekOverview issue={peekIssue} onClose={() => setPeekIssue(null)} />
        </div>
    );
};
