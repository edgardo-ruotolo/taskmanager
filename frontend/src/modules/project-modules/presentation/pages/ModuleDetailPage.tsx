import type React from 'react';
import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useModules, useModuleIssues } from '../../application/use-modules';
import { useCompany } from '@/modules/companies/application/use-companies';
import { IssuePeekOverview } from '@/modules/issues/presentation/components/IssuePeekOverview';
import type { Issue } from '@/modules/issues/domain/types';
import type { ProjectModule, ModuleIssueRef } from '../../domain/types';
import { PRIORITY_LABELS } from '@/modules/issues/domain/types';
import type { IssuePriority } from '@/modules/issues/domain/types';

import {
    MODULE_STATUS_LABELS as STATUS_LABELS,
    MODULE_STATUS_CLASSES as STATUS_CLASSES,
} from '@/shared/constants/status-colors';

interface IssueAnalytics {
    totalIssues: number;
    completedIssues: number;
    progressPct: number;
    issuesByState: Record<string, { color: string; count: number }>;
}

function computeAnalytics(issues: ModuleIssueRef[]): IssueAnalytics {
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

function issueRefToIssue(ref: ModuleIssueRef, companyId: string): Issue {
    return {
        id: ref.issueId,
        sequenceId: ref.issueSequenceId,
        title: ref.issueTitle,
        priority: ref.priority as IssuePriority,
        companyId: 'comp_123',
        stateId: 'state_123',
        stateName: 'Todo',
        stateColor: '#e2e2e2',
        createdById: 'user_123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    } as unknown as Issue;
}

function computeModuleVelocity(createdAt: string, completedIssues: number): { rateLabel: string } {
    const created = new Date(createdAt);
    const today = new Date();
    const daysElapsed = Math.max(1, Math.ceil((today.getTime() - created.getTime()) / 86400000));
    const issuesPerDay = completedIssues / daysElapsed;
    const rateLabel =
        issuesPerDay < 1
            ? `${(issuesPerDay * 7).toFixed(1)} / sem`
            : `${issuesPerDay.toFixed(1)} / día`;
    return { rateLabel };
}

interface VelocitySectionProps {
    mod: ProjectModule;
    analytics: IssueAnalytics;
}

function VelocitySection({ mod, analytics }: VelocitySectionProps): React.ReactElement | null {
    if (analytics.totalIssues === 0) return null;
    const { rateLabel } = computeModuleVelocity(mod.createdAt, analytics.completedIssues);
    return (
        <div>
            <p className="text-xs font-semibold text-placeholder uppercase tracking-wider mb-3">Velocidad</p>
            <div className="flex items-center justify-between px-3 py-2 bg-surface-2 rounded-md">
                <span className="text-xs text-secondary">Tasa de completado</span>
                <span className="text-xs font-semibold text-primary">{rateLabel}</span>
            </div>
        </div>
    );
}

interface AnalyticsSidebarProps {
    isLoading: boolean;
    analytics: IssueAnalytics;
    description: string | null | undefined;
    mod: ProjectModule | null;
}

function AnalyticsSidebar({ isLoading, analytics, description, mod }: AnalyticsSidebarProps): React.ReactElement {
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

            {!isLoading && mod && <VelocitySection mod={mod} analytics={analytics} />}

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

export const ModuleDetailPage = (): React.ReactElement => {
    const { workspaceSlug = '', companyId = '', moduleId = '' } = useParams<{
        workspaceSlug: string;
        companyId: string;
        moduleId: string;
    }>();
    const navigate = useNavigate();
    const [peekIssue, setPeekIssue] = useState<Issue | null>(null);

    const { data: modules, isLoading: modulesLoading } = useModules(workspaceSlug, companyId);
    const { data: issueRefs, isLoading: issuesLoading } = useModuleIssues(workspaceSlug, companyId, moduleId);
    const { data: company } = useCompany(workspaceSlug, companyId);

    const mod = modules?.find((m) => m.id === moduleId) ?? null;
    const issues = issueRefs ?? [];
    const isLoading = modulesLoading || issuesLoading;
    const companyIdentifier = company?.identifier ?? 'ISS';

    const analytics = computeAnalytics(issues);

    if (!isLoading && !mod) {
        return (
            <div className="p-8 flex flex-col items-center justify-center py-24 text-center">
                <Layers size={48} className="text-placeholder mb-4" />
                <h2 className="text-lg font-medium text-secondary mb-2">Módulo no encontrado</h2>
                <Button
                    variant="outline"
                    className="border-subtle text-secondary mt-4"
                    onClick={() => void navigate(`/${workspaceSlug}/companies/${companyId}/modules`)}
                >
                    <ArrowLeft size={14} className="mr-2" />
                    Volver a módulos
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
                        to={`/${workspaceSlug}/companies/${companyId}/modules`}
                        className="hover:text-secondary transition-colors"
                    >
                        Módulos
                    </Link>
                    <ChevronRight size={12} />
                    <span className="text-primary">{mod?.name ?? moduleId}</span>
                </nav>

                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => void navigate(`/${workspaceSlug}/companies/${companyId}/modules`)}
                        className="h-7 px-2 text-secondary hover:text-primary -ml-2"
                    >
                        <ArrowLeft size={14} className="mr-1.5" />
                        Volver
                    </Button>

                    {mod && (
                        <Badge className={`text-xs border-0 ${STATUS_CLASSES[mod.status]}`}>
                            {STATUS_LABELS[mod.status]}
                        </Badge>
                    )}

                    <h1 className="text-lg font-semibold text-primary">
                        {isLoading ? <Skeleton className="h-5 w-40 bg-layer-1" /> : (mod?.name ?? '')}
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
                            <Layers size={36} className="text-placeholder mb-3" />
                            <p className="text-sm text-secondary font-medium mb-1">Sin tareas en este módulo</p>
                            <p className="text-xs text-placeholder">
                                Ve al listado de módulos para agregar tareas.
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
                    description={mod?.description}
                    mod={mod}
                />
            </div>

            <IssuePeekOverview issue={peekIssue} onClose={() => setPeekIssue(null)} />
        </div>
    );
};
