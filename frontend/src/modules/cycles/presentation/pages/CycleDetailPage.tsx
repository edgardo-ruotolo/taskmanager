import type React from 'react';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Eyebrow } from '@/components/ui/eyebrow';
import { useCycles, useCycleIssues } from '../../application/use-cycles';
import { useCycleProgress } from '../../application/use-cycle-analytics';
import { useProject } from '@/modules/projects/application/use-projects';
import { IssuePeekOverview } from '@/modules/issues/presentation/components/IssuePeekOverview';
import type { Issue } from '@/modules/issues/domain/types';
import type { Cycle, CycleIssueRef } from '../../domain/types';
import { PRIORITY_LABELS } from '@/modules/issues/domain/types';
import type { IssuePriority } from '@/modules/issues/domain/types';
import { cn } from '@/lib/utils';

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(date: string | null): string {
    if (!date) return '—';
    return new Date(date)
        .toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
        .toUpperCase();
}

interface DaysInfo {
    daysRemaining: number;
    daysPassed: number;
    totalDays: number;
}

function getDaysInfo(startDate: string | null, endDate: string | null): DaysInfo {
    if (!startDate || !endDate) return { daysRemaining: 0, daysPassed: 0, totalDays: 0 };
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000));
    const daysPassed = Math.max(0, Math.ceil((today.getTime() - start.getTime()) / 86400000));
    const daysRemaining = Math.max(0, Math.ceil((end.getTime() - today.getTime()) / 86400000));
    return { daysRemaining, daysPassed, totalDays };
}

function computeVelocity(startDate: string | null, completedIssues: number): number {
    if (!startDate) return 0;
    const start = new Date(startDate);
    const today = new Date();
    const daysElapsed = Math.max(1, Math.ceil((today.getTime() - start.getTime()) / 86400000));
    return Math.round((completedIssues / daysElapsed) * 10) / 10;
}

function issueRefToIssue(ref: CycleIssueRef, projectId: string): Issue {
    return {
        id: ref.issueId,
        sequenceId: ref.issueSequenceId,
        title: ref.issueTitle,
        priority: ref.priority as IssuePriority,
        projectId,
        stateId: '',
        stateName: ref.stateName,
        stateColor: ref.stateColor,
        createdById: '',
        createdAt: '',
        updatedAt: '',
        assigneeIds: [],
        labelIds: [],
        moduleIds: [],
        sortOrder: 0,
        isDraft: false,
        isArchived: false,
        requiresAdminApproval: false,
        approvalRequiredStateIds: [],
        approvedById: null,
        approvedAt: null,
    };
}

// ─── Burndown SVG ────────────────────────────────────────────────────────────

interface BurndownChartProps {
    cycle: Cycle;
    completedIssues: number;
    totalIssues: number;
}

function BurndownChart({ cycle, completedIssues, totalIssues }: BurndownChartProps): React.ReactElement | null {
    if (!cycle.startDate || !cycle.endDate || totalIssues === 0) return null;

    const { daysPassed, totalDays } = getDaysInfo(cycle.startDate, cycle.endDate);
    const todayRatio = Math.min(1, daysPassed / totalDays);
    const todayX = Math.round(20 + todayRatio * 560);

    const steps = Math.min(daysPassed, 8);
    const realPoints: [number, number][] = [];
    if (steps > 0) {
        for (let i = 0; i <= steps; i++) {
            const ratio = i / steps;
            const x = 20 + ratio * todayRatio * 560;
            const remaining = totalIssues - Math.round(completedIssues * ratio);
            const y = 30 + (remaining / totalIssues) * 140;
            realPoints.push([x, y]);
        }
    } else {
        realPoints.push([20, 30]);
    }

    const lastReal = realPoints[realPoints.length - 1] ?? [20, 30];
    const realPathD = realPoints.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x} ${y}`).join(' ');
    const areaD = `${realPathD} L${lastReal[0]} 200 L20 200 Z`;
    const forecastEndY = 30 + ((totalIssues - completedIssues) / totalIssues) * 140;
    const startLabel = formatDate(cycle.startDate);
    const endLabel = formatDate(cycle.endDate);

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <div>
                    <Eyebrow className="text-[var(--neutral-600)] mb-0.5">Burndown · scope vs ideal</Eyebrow>
                    <div className="text-[14px] font-medium tracking-[-0.02em] text-[var(--neutral-1200)]">
                        {completedIssues} de {totalIssues} cerrados · {totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0}% scope
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-0.5 bg-[var(--brand-700)] inline-block rounded" />
                        <span className="font-mono text-[10px] text-[var(--neutral-600)]">REAL</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-0.5 border-t border-dashed border-[var(--neutral-600)] inline-block" />
                        <span className="font-mono text-[10px] text-[var(--neutral-600)]">IDEAL</span>
                    </div>
                </div>
            </div>
            <svg viewBox="0 0 600 200" className="w-full" role="img" aria-label="Gráfico de burndown del ciclo">
                <defs>
                    <linearGradient id="cd-fill" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="var(--brand-700)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="var(--brand-700)" stopOpacity={0} />
                    </linearGradient>
                </defs>
                {[40, 80, 120, 160].map((y) => (
                    <line key={y} x1="20" y1={y} x2="600" y2={y} stroke="var(--neutral-300)" strokeWidth="1" />
                ))}
                <path d="M 20 30 L 580 170" stroke="var(--neutral-400)" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
                <path d={areaD} fill="url(#cd-fill)" />
                <path d={realPathD} stroke="var(--brand-700)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                {daysPassed > 0 && daysPassed < totalDays && (
                    <>
                        <line x1={todayX} y1="0" x2={todayX} y2="200" stroke="var(--neutral-1200)" strokeWidth="1" strokeDasharray="3 3" />
                        <text x={todayX + 6} y="18" fontSize="10" fill="var(--neutral-1200)" fontFamily="Geist Mono">
                            HOY · DÍA {daysPassed}
                        </text>
                    </>
                )}
                {completedIssues < totalIssues && lastReal[0] < 580 && (
                    <>
                        <path
                            d={`M ${lastReal[0]} ${lastReal[1]} L 580 ${forecastEndY > 170 ? 170 : forecastEndY}`}
                            stroke="var(--brand-700)"
                            strokeWidth="2"
                            strokeDasharray="3 3"
                            fill="none"
                        />
                        <text x="580" y="185" fontSize="10" fill="var(--neutral-600)" fontFamily="Geist Mono" textAnchor="end">
                            CIERRE PROYECTADO ↓
                        </text>
                    </>
                )}
            </svg>
            <div className="flex justify-between mt-2">
                <span className="font-mono text-[10px] text-[var(--neutral-600)]">{startLabel} · INICIO</span>
                <span className="font-mono text-[10px] text-[var(--neutral-600)]">{endLabel} · CIERRE</span>
            </div>
        </div>
    );
}

// ─── State Donut ────────────────────────────────────────────────────────────

interface StateDonutProps {
    issuesByState: Record<string, { color: string; count: number }>;
    totalIssues: number;
}

function StateDonut({ issuesByState, totalIssues }: StateDonutProps): React.ReactElement | null {
    if (totalIssues === 0) return null;
    const entries = Object.entries(issuesByState);
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;
    const arcs = entries.map(([name, { color, count }]) => {
        const dash = (count / totalIssues) * circumference;
        const gap = circumference - dash;
        const arc = { name, color, count, dash, gap, offset };
        offset += dash;
        return arc;
    });
    return (
        <div>
            <Eyebrow className="text-[var(--neutral-600)] mb-3">Estados</Eyebrow>
            <div className="flex items-center gap-6">
                <svg viewBox="0 0 100 100" className="w-20 h-20 shrink-0" role="img" aria-label="Distribución de estados">
                    {arcs.map((arc) => (
                        <circle
                            key={arc.name}
                            cx="50"
                            cy="50"
                            r={radius}
                            fill="none"
                            stroke={arc.color}
                            strokeWidth="12"
                            strokeDasharray={`${arc.dash} ${arc.gap}`}
                            strokeDashoffset={-arc.offset}
                            transform="rotate(-90 50 50)"
                        />
                    ))}
                </svg>
                <div className="flex flex-col gap-1.5">
                    {entries.map(([name, { color, count }]) => (
                        <div key={name} className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} aria-hidden="true" />
                            <span className="text-[12px] text-[var(--neutral-900)]">{name}</span>
                            <span className="font-mono text-[11px] text-[var(--neutral-600)] tabular-nums ml-auto pl-4">{count}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Issue Group Section ─────────────────────────────────────────────────────

interface IssueGroupSectionProps {
    stateName: string;
    stateColor: string;
    issues: CycleIssueRef[];
    projectIdentifier: string;
    onPeek: (ref: CycleIssueRef) => void;
}

function IssueGroupSection({ stateName, stateColor, issues, projectIdentifier, onPeek }: IssueGroupSectionProps): React.ReactElement {
    const [collapsed, setCollapsed] = useState(false);
    return (
        <div className="border border-[var(--neutral-400)] rounded-lg overflow-hidden">
            <button
                type="button"
                onClick={() => setCollapsed((c) => !c)}
                className="w-full flex items-center gap-3 px-4 h-10 bg-[var(--neutral-100)] hover:bg-[var(--neutral-200)] transition-colors text-left"
                aria-expanded={!collapsed}
            >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: stateColor }} aria-hidden="true" />
                <span className="flex-1 text-[13px] font-medium tracking-[-0.01em] text-[var(--neutral-1200)]">{stateName}</span>
                <span className="font-mono text-[11px] text-[var(--neutral-600)] tabular-nums">{issues.length}</span>
            </button>
            {!collapsed && (
                <div>
                    {issues.map((ref, idx) => (
                        <button
                            key={ref.issueId}
                            type="button"
                            onClick={() => onPeek(ref)}
                            className={cn(
                                'w-full flex items-center gap-3 px-4 h-11 hover:bg-[var(--neutral-100)] transition-colors text-left',
                                idx < issues.length - 1 && 'border-b border-[var(--neutral-400)]',
                            )}
                        >
                            <span className="font-mono text-[11px] text-[var(--neutral-600)] w-16 shrink-0 tabular-nums">
                                {projectIdentifier}-{ref.issueSequenceId}
                            </span>
                            <span className="flex-1 text-[13px] text-[var(--neutral-1200)] truncate">{ref.issueTitle}</span>
                            <span className="text-[11px] text-[var(--neutral-500)] shrink-0">
                                {PRIORITY_LABELS[ref.priority as IssuePriority]}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────

interface CycleHeroProps {
    cycle: Cycle;
    totalIssues: number;
    scopePct: number;
    daysRemaining: number;
    predictionLabel: string;
}

function CycleHero({ cycle, totalIssues, scopePct, daysRemaining, predictionLabel }: CycleHeroProps): React.ReactElement {
    const eyebrowText = cycle.status === 'Started'
        ? `● CICLO ACTIVO${daysRemaining > 0 ? ` · ${daysRemaining} DÍAS RESTANTES` : ''}`
        : cycle.status === 'Completed'
            ? '✓ CICLO CERRADO'
            : '○ CICLO PRÓXIMO';

    return (
        <div>
            <Eyebrow className="text-[var(--brand-700)] mb-2">{eyebrowText}</Eyebrow>
            <h1 className="text-[52px] font-medium tightest text-[var(--neutral-1200)]">
                {cycle.name}
                {cycle.description && (
                    <span className="font-serif italic text-[var(--neutral-700)]"> — {cycle.description}</span>
                )}
            </h1>
            <div className="flex flex-wrap items-center gap-6 mt-6 pt-6 border-t border-[var(--neutral-400)]">
                <div>
                    <div className="font-mono text-[10px] text-[var(--neutral-500)] tracking-[0.1em] uppercase mb-1">Periodo</div>
                    <div className="text-[13px] text-[var(--neutral-1200)]">
                        {formatDate(cycle.startDate)} — {formatDate(cycle.endDate)}
                    </div>
                </div>
                <div className="w-px h-8 bg-[var(--neutral-400)]" aria-hidden="true" />
                <div>
                    <div className="font-mono text-[10px] text-[var(--neutral-500)] tracking-[0.1em] uppercase mb-1">Scope</div>
                    <div className="text-[13px] text-[var(--neutral-1200)]">{totalIssues} issues</div>
                </div>
                <div className="w-px h-8 bg-[var(--neutral-400)]" aria-hidden="true" />
                {/* TODO(backend): campo leadId + leadName esperado en DTO Cycle */}
                <div>
                    <div className="font-mono text-[10px] text-[var(--neutral-500)] tracking-[0.1em] uppercase mb-1">Lead</div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-[var(--brand-700)] flex items-center justify-center text-[8px] font-bold text-white">
                            ?
                        </span>
                        <span className="text-[13px] text-[var(--neutral-1200)]">—</span>
                    </div>
                </div>
                <div className="w-px h-8 bg-[var(--neutral-400)]" aria-hidden="true" />
                {/* TODO(backend): campo members[] esperado en DTO Cycle */}
                <div>
                    <div className="font-mono text-[10px] text-[var(--neutral-500)] tracking-[0.1em] uppercase mb-1">Equipo</div>
                    <div className="text-[13px] text-[var(--neutral-1200)]">— personas</div>
                </div>
                <div className="w-px h-8 bg-[var(--neutral-400)]" aria-hidden="true" />
                <div>
                    <div className="font-mono text-[10px] text-[var(--neutral-500)] tracking-[0.1em] uppercase mb-1">Estado</div>
                    <div className="flex items-center gap-1.5 text-[13px] text-[var(--neutral-1200)]">
                        <span className={cn('inline-block w-1.5 h-1.5 rounded-full', scopePct >= 65 ? 'bg-green-500' : 'bg-amber-500')} />
                        {predictionLabel}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Quick Stats ─────────────────────────────────────────────────────────────

interface QuickStatsProps {
    totalIssues: number;
    scopePct: number;
    velocity: number;
    daysPassed: number;
    totalDays: number;
}

function QuickStats({ totalIssues, scopePct, velocity, daysPassed, totalDays }: QuickStatsProps): React.ReactElement {
    const stats = [
        { label: 'Issues', value: String(totalIssues), sub: 'en el ciclo' },
        { label: 'Scope', value: `${scopePct}%`, sub: 'completado' },
        { label: 'Velocity', value: String(velocity), sub: 'issues/día' },
        { label: 'Día', value: String(daysPassed), sub: `de ${totalDays} totales` },
    ];
    return (
        <div className="grid grid-cols-4 gap-4">
            {stats.map((s) => (
                <div key={s.label} className="bg-[var(--neutral-100)] border border-[var(--neutral-400)] rounded-lg p-4">
                    <div className="font-mono text-[10px] text-[var(--neutral-500)] tracking-[0.1em] uppercase mb-1">{s.label}</div>
                    <div className="text-[28px] font-medium tracking-[-0.04em] text-[var(--neutral-1200)] tabular-nums leading-none">{s.value}</div>
                    <div className="text-[11px] text-[var(--neutral-600)] mt-1">{s.sub}</div>
                </div>
            ))}
        </div>
    );
}

// ─── Issues List ─────────────────────────────────────────────────────────────

interface CycleIssuesListProps {
    isLoading: boolean;
    issues: CycleIssueRef[];
    totalIssues: number;
    issuesByState: Record<string, { color: string; refs: CycleIssueRef[] }>;
    projectIdentifier: string;
    onPeek: (ref: CycleIssueRef) => void;
}

function CycleIssuesList({ isLoading, issues, totalIssues, issuesByState, projectIdentifier, onPeek }: CycleIssuesListProps): React.ReactElement {
    return (
        <div>
            {!isLoading && (
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[16px] font-medium tracking-[-0.02em] text-[var(--neutral-1200)]">
                        Issues del ciclo <span className="text-[var(--neutral-600)] font-normal">· {totalIssues}</span>
                    </h2>
                </div>
            )}
            {isLoading && (
                <div className="space-y-3">
                    {(['sk-0', 'sk-1', 'sk-2', 'sk-3'] as const).map((k) => (
                        <Skeleton key={k} className="h-11 w-full rounded-lg bg-[var(--neutral-200)]" />
                    ))}
                </div>
            )}
            {!isLoading && issues.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <RefreshCw size={32} className="text-[var(--neutral-600)] mb-3" />
                    <p className="text-[14px] font-medium text-[var(--neutral-900)] mb-1">Sin tareas en este ciclo</p>
                    <p className="text-[12px] text-[var(--neutral-600)]">Agrega issues desde la vista de ciclos.</p>
                </div>
            )}
            {!isLoading && issues.length > 0 && (
                <div className="space-y-3">
                    {Object.entries(issuesByState).map(([stateName, { color, refs }]) => (
                        <IssueGroupSection
                            key={stateName}
                            stateName={stateName}
                            stateColor={color}
                            issues={refs}
                            projectIdentifier={projectIdentifier}
                            onPeek={onPeek}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Cycle Detail Header ──────────────────────────────────────────────────────

interface CycleDetailHeaderProps {
    projectName: string;
    cycleName: string;
    cycleStatus: Cycle['status'] | undefined;
    onBack: () => void;
    onClose: () => void;
}

function CycleDetailHeader({ projectName, cycleName, cycleStatus, onBack, onClose }: CycleDetailHeaderProps): React.ReactElement {
    return (
        <header className="flex items-center justify-between">
            <nav className="flex items-center gap-1.5 text-[12px] font-mono text-[var(--neutral-600)]" aria-label="Navegación de ciclo">
                <span>{projectName}</span>
                <span>/</span>
                <button type="button" onClick={onBack} className="hover:text-[var(--neutral-1200)] transition-colors">
                    Cycles
                </button>
                <span>/</span>
                <span className="text-[var(--neutral-1200)]">{cycleName}</span>
            </nav>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px] text-[var(--neutral-900)] border-[var(--neutral-400)]">
                    <Download size={12} />
                    Reporte
                </Button>
                {cycleStatus === 'Started' && (
                    <Button size="sm" className="h-8 text-[12px] bg-[var(--neutral-1200)] hover:bg-[var(--neutral-1000)] text-[var(--text-on-dark)]" onClick={onClose}>
                        Cerrar ciclo
                    </Button>
                )}
                <Button size="sm" className="h-8 gap-1.5 text-[12px] bg-[var(--neutral-1200)] hover:bg-[var(--neutral-1000)] text-[var(--text-on-dark)]">
                    <Plus size={12} />
                    Issue
                </Button>
            </div>
        </header>
    );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

function groupIssuesByState(issues: CycleIssueRef[]): Record<string, { color: string; refs: CycleIssueRef[] }> {
    return issues.reduce<Record<string, { color: string; refs: CycleIssueRef[] }>>((acc, ref) => {
        if (!acc[ref.stateName]) acc[ref.stateName] = { color: ref.stateColor, refs: [] };
        acc[ref.stateName].refs.push(ref);
        return acc;
    }, {});
}

interface CycleMetrics {
    totalIssues: number;
    completedIssues: number;
    scopePct: number;
    velocity: number;
    daysRemaining: number;
    daysPassed: number;
    totalDays: number;
    predictionLabel: string;
    issuesByState: Record<string, { color: string; refs: CycleIssueRef[] }>;
    issuesByStateForDonut: Record<string, { color: string; count: number }>;
}

function computeCycleMetrics(
    cycle: Cycle | null,
    issues: CycleIssueRef[],
    progressData: { totalIssues: number; completedIssues: number } | null | undefined,
): CycleMetrics {
    const totalIssues = progressData?.totalIssues ?? issues.length;
    const completed = progressData?.completedIssues
        ?? issues.filter((i) => i.stateName.toLowerCase().includes('complet')).length;
    const scopePct = totalIssues > 0 ? Math.round((completed / totalIssues) * 100) : 0;
    const velocity = computeVelocity(cycle?.startDate ?? null, completed);
    const { daysRemaining, daysPassed, totalDays } = getDaysInfo(cycle?.startDate ?? null, cycle?.endDate ?? null);
    const predictionLabel = scopePct >= 65 ? 'On track' : 'At risk';
    const issuesByState = groupIssuesByState(issues);
    const issuesByStateForDonut = Object.fromEntries(
        Object.entries(issuesByState).map(([name, { color, refs }]) => [name, { color, count: refs.length }]),
    );
    return { totalIssues, completedIssues: completed, scopePct, velocity, daysRemaining, daysPassed, totalDays, predictionLabel, issuesByState, issuesByStateForDonut };
}

export const CycleDetailPage = (): React.ReactElement => {
    const { workspaceSlug = '', projectId = '', cycleId = '' } = useParams<{
        workspaceSlug: string;
        projectId: string;
        cycleId: string;
    }>();
    const navigate = useNavigate();
    const [peekIssue, setPeekIssue] = useState<Issue | null>(null);

    const { data: cycles, isLoading: cyclesLoading } = useCycles(workspaceSlug, projectId);
    const { data: issueRefs, isLoading: issuesLoading } = useCycleIssues(workspaceSlug, projectId, cycleId);
    const { data: project } = useProject(workspaceSlug, projectId);
    const { data: cycleProgress } = useCycleProgress(workspaceSlug, projectId, cycleId);

    const cycle = cycles?.find((c) => c.id === cycleId) ?? null;
    const issues = issueRefs ?? [];
    const isLoading = cyclesLoading || issuesLoading;
    const projectIdentifier = project?.identifier ?? 'ISS';
    const projectName = project?.name ?? workspaceSlug;

    const metrics = computeCycleMetrics(cycle, issues, cycleProgress);
    const handleBack = (): void => { void navigate(`/${workspaceSlug}/projects/${projectId}/cycles`); };

    if (!isLoading && !cycle) {
        return (
            <div className="p-8 flex flex-col items-center justify-center py-24 text-center">
                <RefreshCw size={48} className="text-[var(--neutral-600)] mb-4" />
                <h2 className="text-lg font-medium text-[var(--neutral-1200)] mb-2">Ciclo no encontrado</h2>
                <Button variant="outline" className="mt-4" onClick={handleBack}>Volver a ciclos</Button>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto">
            <div className="w-full px-10 py-8 flex flex-col gap-8">
                <CycleDetailHeader
                    projectName={projectName}
                    cycleName={cycle?.name ?? cycleId}
                    cycleStatus={cycle?.status}
                    onBack={handleBack}
                    onClose={handleBack}
                />
                {isLoading ? (
                    <div className="space-y-3">
                        <Skeleton className="h-4 w-48 bg-[var(--neutral-200)]" />
                        <Skeleton className="h-14 w-2/3 bg-[var(--neutral-200)]" />
                        <Skeleton className="h-4 w-full bg-[var(--neutral-200)]" />
                    </div>
                ) : cycle && (
                    <CycleHero cycle={cycle} totalIssues={metrics.totalIssues} scopePct={metrics.scopePct} daysRemaining={metrics.daysRemaining} predictionLabel={metrics.predictionLabel} />
                )}
                {!isLoading && cycle && (
                    <div className="grid grid-cols-[1fr_220px] gap-8 bg-[var(--neutral-100)] rounded-lg p-6 border border-[var(--neutral-400)]">
                        <BurndownChart cycle={cycle} completedIssues={metrics.completedIssues} totalIssues={metrics.totalIssues} />
                        <StateDonut issuesByState={metrics.issuesByStateForDonut} totalIssues={metrics.totalIssues} />
                    </div>
                )}
                {!isLoading && cycle && (
                    <QuickStats totalIssues={metrics.totalIssues} scopePct={metrics.scopePct} velocity={metrics.velocity} daysPassed={metrics.daysPassed} totalDays={metrics.totalDays} />
                )}
                <CycleIssuesList
                    isLoading={isLoading}
                    issues={issues}
                    totalIssues={metrics.totalIssues}
                    issuesByState={metrics.issuesByState}
                    projectIdentifier={projectIdentifier}
                    onPeek={(ref) => setPeekIssue(issueRefToIssue(ref, projectId))}
                />
            </div>
            <IssuePeekOverview issue={peekIssue} onClose={() => setPeekIssue(null)} />
        </div>
    );
};
