import type React from 'react';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Link2, Plus, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Eyebrow } from '@/components/ui/eyebrow';
import { useModules, useModuleIssues } from '../../application/use-modules';
import { useProject } from '@/modules/projects/application/use-projects';
import { IssuePeekOverview } from '@/modules/issues/presentation/components/IssuePeekOverview';
import type { Issue } from '@/modules/issues/domain/types';
import type { Module, ModuleIssueRef } from '../../domain/types';
import { PRIORITY_LABELS } from '@/modules/issues/domain/types';
import type { IssuePriority } from '@/modules/issues/domain/types';
import { cn } from '@/lib/utils';

// ─── Status helpers ──────────────────────────────────────────────────────────

const STATUS_EDITORIAL: Record<Module['status'], string> = {
    Backlog: 'Backlog',
    InProgress: '○ On track',
    Paused: '○ At risk',
    Completed: '✓ Completado',
    Archived: 'Archivado',
};

const STATUS_DOT: Record<Module['status'], string> = {
    Backlog: 'bg-[var(--neutral-500)]',
    InProgress: 'bg-green-500',
    Paused: 'bg-amber-500',
    Completed: 'bg-green-600',
    Archived: 'bg-[var(--neutral-400)]',
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function issueRefToIssue(ref: ModuleIssueRef, projectId: string): Issue {
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

// ─── Issue Group Section ─────────────────────────────────────────────────────

interface IssueGroupSectionProps {
    stateName: string;
    stateColor: string;
    issues: ModuleIssueRef[];
    projectIdentifier: string;
    onPeek: (ref: ModuleIssueRef) => void;
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

// ─── Module Hero ─────────────────────────────────────────────────────────────

interface ModuleHeroProps {
    mod: Module;
    projectName: string;
}

function ModuleHero({ mod, projectName }: ModuleHeroProps): React.ReactElement {
    return (
        <div>
            <Eyebrow className="text-[var(--neutral-600)] mb-2">Módulo · {projectName}</Eyebrow>
            <h1 className="text-[52px] font-medium tightest text-[var(--neutral-1200)]">
                {mod.name}.
            </h1>
            {mod.description && (
                <p className="mt-3 text-[15px] text-[var(--neutral-600)] max-w-[600px] leading-relaxed">
                    {mod.description}
                </p>
            )}
            <div className="flex flex-wrap items-center gap-6 mt-6 pt-6 border-t border-[var(--neutral-400)]">
                <div>
                    <div className="font-mono text-[10px] text-[var(--neutral-500)] tracking-[0.1em] uppercase mb-1">Lead</div>
                    {/* TODO(backend): campo leadName/leadInitials esperado en DTO Module (leadId existe) */}
                    <div className="flex items-center gap-1.5">
                        {mod.leadId ? (
                            <>
                                <span className="w-5 h-5 rounded-full bg-[var(--brand-700)] flex items-center justify-center text-[8px] font-bold text-white">
                                    ?
                                </span>
                                <span className="text-[13px] text-[var(--neutral-1200)]">—</span>
                            </>
                        ) : (
                            <span className="text-[13px] text-[var(--neutral-600)]">Sin asignar</span>
                        )}
                    </div>
                </div>
                <div className="w-px h-8 bg-[var(--neutral-400)]" aria-hidden="true" />
                {/* TODO(backend): campo startDate/endDate esperado en DTO Module */}
                <div>
                    <div className="font-mono text-[10px] text-[var(--neutral-500)] tracking-[0.1em] uppercase mb-1">Periodo</div>
                    <div className="text-[13px] text-[var(--neutral-1200)]">—</div>
                </div>
                <div className="w-px h-8 bg-[var(--neutral-400)]" aria-hidden="true" />
                <div>
                    <div className="font-mono text-[10px] text-[var(--neutral-500)] tracking-[0.1em] uppercase mb-1">Estado</div>
                    <div className="flex items-center gap-1.5">
                        <span className={cn('w-1.5 h-1.5 rounded-full', STATUS_DOT[mod.status])} aria-hidden="true" />
                        <span className="text-[13px] text-[var(--neutral-1200)]">{STATUS_EDITORIAL[mod.status]}</span>
                    </div>
                </div>
                <div className="w-px h-8 bg-[var(--neutral-400)]" aria-hidden="true" />
                {/* TODO(backend): campo members[] esperado en DTO Module para avatares */}
                <div>
                    <div className="font-mono text-[10px] text-[var(--neutral-500)] tracking-[0.1em] uppercase mb-1">Equipo</div>
                    <div className="text-[13px] text-[var(--neutral-1200)]">—</div>
                </div>
            </div>
        </div>
    );
}

// ─── Progress Block ───────────────────────────────────────────────────────────

interface ProgressBlockProps {
    progressPct: number;
    completedIssues: number;
    totalIssues: number;
}

function ProgressBlock({ progressPct, completedIssues, totalIssues }: ProgressBlockProps): React.ReactElement {
    const barColor = progressPct >= 80 ? 'var(--green-700)' : progressPct >= 40 ? 'var(--brand-700)' : 'var(--amber-700)';
    return (
        <div className="bg-[var(--neutral-100)] border border-[var(--neutral-400)] rounded-lg p-6">
            <Eyebrow className="text-[var(--brand-700)] mb-4">● PROGRESO</Eyebrow>
            <div className="flex items-end gap-4 mb-4">
                <div className="leading-none">
                    <span className="text-[64px] font-medium tracking-[-0.06em] text-[var(--neutral-1200)] tabular-nums leading-none">
                        {progressPct}
                    </span>
                    <span className="text-[28px] font-medium text-[var(--neutral-600)] ml-1">%</span>
                </div>
                <div className="pb-2">
                    <div className="font-mono text-[11px] text-[var(--neutral-600)] tracking-[0.08em] uppercase">
                        {completedIssues} DE {totalIssues} ISSUES
                    </div>
                </div>
            </div>
            <div className="h-2 bg-[var(--neutral-300)] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${progressPct}%`, background: barColor }} />
            </div>
        </div>
    );
}

// ─── Module Issues List ───────────────────────────────────────────────────────

interface ModuleIssuesListProps {
    isLoading: boolean;
    issues: ModuleIssueRef[];
    issuesByState: Record<string, { color: string; refs: ModuleIssueRef[] }>;
    projectIdentifier: string;
    onPeek: (ref: ModuleIssueRef) => void;
}

function ModuleIssuesList({ isLoading, issues, issuesByState, projectIdentifier, onPeek }: ModuleIssuesListProps): React.ReactElement {
    return (
        <div>
            {!isLoading && (
                <Eyebrow className="text-[var(--neutral-600)] mb-4">Issues del módulo · agrupadas por estado</Eyebrow>
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
                    <Layers size={32} className="text-[var(--neutral-600)] mb-3" />
                    <p className="text-[14px] font-medium text-[var(--neutral-900)] mb-1">Sin tareas en este módulo</p>
                    <p className="text-[12px] text-[var(--neutral-600)]">Agrega issues desde la vista de módulos.</p>
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

// ─── Module Detail Header ─────────────────────────────────────────────────────

interface ModuleDetailHeaderProps {
    projectName: string;
    moduleName: string;
    onBack: () => void;
    onCopyLink: () => void;
}

function ModuleDetailHeader({ projectName, moduleName, onBack, onCopyLink }: ModuleDetailHeaderProps): React.ReactElement {
    return (
        <header className="flex items-center justify-between">
            <nav className="flex items-center gap-1.5 text-[12px] font-mono text-[var(--neutral-600)]" aria-label="Navegación del módulo">
                <span>{projectName}</span>
                <span>/</span>
                <button type="button" onClick={onBack} className="hover:text-[var(--neutral-1200)] transition-colors">
                    Modules
                </button>
                <span>/</span>
                <span className="text-[var(--neutral-1200)]">{moduleName}</span>
            </nav>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px] text-[var(--neutral-900)] border-[var(--neutral-400)]" onClick={onCopyLink} aria-label="Copiar link del módulo">
                    <Link2 size={12} />
                    Copiar link
                </Button>
                <Button size="sm" className="h-8 gap-1.5 text-[12px] bg-[var(--neutral-1200)] hover:bg-[var(--neutral-1000)] text-[#f0eadf]">
                    <Plus size={12} />
                    Issue al módulo
                </Button>
            </div>
        </header>
    );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

function groupModuleIssuesByState(issues: ModuleIssueRef[]): Record<string, { color: string; refs: ModuleIssueRef[] }> {
    return issues.reduce<Record<string, { color: string; refs: ModuleIssueRef[] }>>((acc, ref) => {
        if (!acc[ref.stateName]) acc[ref.stateName] = { color: ref.stateColor, refs: [] };
        acc[ref.stateName].refs.push(ref);
        return acc;
    }, {});
}

export const ModuleDetailPage = (): React.ReactElement => {
    const { workspaceSlug = '', projectId = '', moduleId = '' } = useParams<{
        workspaceSlug: string;
        projectId: string;
        moduleId: string;
    }>();
    const navigate = useNavigate();
    const [peekIssue, setPeekIssue] = useState<Issue | null>(null);

    const { data: modules, isLoading: modulesLoading } = useModules(workspaceSlug, projectId);
    const { data: issueRefs, isLoading: issuesLoading } = useModuleIssues(workspaceSlug, projectId, moduleId);
    const { data: project } = useProject(workspaceSlug, projectId);

    const mod = modules?.find((m) => m.id === moduleId) ?? null;
    const issues = issueRefs ?? [];
    const isLoading = modulesLoading || issuesLoading;
    const projectIdentifier = project?.identifier ?? 'ISS';
    const projectName = project?.name ?? workspaceSlug;

    // TODO(backend): campo completedIssues esperado en DTO Module para calcular porcentaje real
    const totalIssues = mod?.issueCount ?? issues.length;
    const completedIssues = issues.filter((i) => i.stateName.toLowerCase().includes('complet')).length;
    const progressPct = totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0;

    const issuesByState = groupModuleIssuesByState(issues);

    const handleBack = (): void => { void navigate(`/${workspaceSlug}/projects/${projectId}/modules`); };
    const handleCopyLink = (): void => { void navigator.clipboard.writeText(window.location.href); };

    if (!isLoading && !mod) {
        return (
            <div className="p-8 flex flex-col items-center justify-center py-24 text-center">
                <Layers size={48} className="text-[var(--neutral-600)] mb-4" />
                <h2 className="text-lg font-medium text-[var(--neutral-1200)] mb-2">Módulo no encontrado</h2>
                <Button variant="outline" className="mt-4" onClick={handleBack}>Volver a módulos</Button>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto">
            <div className="w-full px-10 py-8 flex flex-col gap-8">
                <ModuleDetailHeader projectName={projectName} moduleName={mod?.name ?? moduleId} onBack={handleBack} onCopyLink={handleCopyLink} />
                {isLoading ? (
                    <div className="space-y-3">
                        <Skeleton className="h-4 w-48 bg-[var(--neutral-200)]" />
                        <Skeleton className="h-14 w-2/3 bg-[var(--neutral-200)]" />
                        <Skeleton className="h-4 w-full bg-[var(--neutral-200)]" />
                    </div>
                ) : mod && (
                    <ModuleHero mod={mod} projectName={projectName} />
                )}
                {!isLoading && mod && (
                    <ProgressBlock progressPct={progressPct} completedIssues={completedIssues} totalIssues={totalIssues} />
                )}
                <ModuleIssuesList
                    isLoading={isLoading}
                    issues={issues}
                    issuesByState={issuesByState}
                    projectIdentifier={projectIdentifier}
                    onPeek={(ref) => setPeekIssue(issueRefToIssue(ref, projectId))}
                />
            </div>
            <IssuePeekOverview issue={peekIssue} onClose={() => setPeekIssue(null)} />
        </div>
    );
};
