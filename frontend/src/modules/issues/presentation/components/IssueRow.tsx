import type React from 'react';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatePip } from '@/components/ui/state-pip';
import { PriorityDot } from '@/components/ui/priority-dot';
import { Checkbox } from '@/components/ui/checkbox';
import { useLabels } from '@/modules/labels/application/use-labels';
import { useCycles } from '@/modules/cycles/application/use-cycles';
import { useModules } from '@/modules/modules/application/use-modules';
import { useWorkspaceMembers } from '@/modules/workspaces/application/use-workspaces';
import type { ProjectFeatures } from '@/modules/projects/application/use-project-features';
import type { Label } from '@/modules/labels/domain/types';
import type { Cycle } from '@/modules/cycles/domain/types';
import type { Module } from '@/modules/modules/domain/types';
import { formatDateOnly } from '@/shared/lib/date';
import type { Issue } from '../../domain/types';
import { IssueActionsMenu } from './IssueActionsMenu';
import { CreateIssueDialog } from './CreateIssueDialog';

interface IssueRowProps {
    issue: Issue;
    projectIdentifier?: string;
    workspaceSlug?: string;
    projectId?: string;
    features?: ProjectFeatures;
    onClick: () => void;
}

const STATE_PIP_VALUES = ['backlog', 'unstarted', 'started', 'completed', 'cancelled'] as const;
type StatePipState = (typeof STATE_PIP_VALUES)[number];

// Grid: checkbox | pip | id | title | label | [cycle] | [module] | due | priority | sub-issues | assigned
// Exported so IssueListHeader (IssuesPage.tsx) can use the same template and stay pixel-aligned.
export function buildGridTemplate(features?: ProjectFeatures): string {
    return [
        '28px 32px 92px 1fr 160px',
        features?.cyclesEnabled ? '120px' : null,
        features?.modulesEnabled ? '100px' : null,
        '80px 36px 70px 96px',
    ].filter(Boolean).join(' ');
}

function toStatePipState(stateGroup?: string): StatePipState {
    const lower = stateGroup?.toLowerCase() ?? 'backlog';
    return (STATE_PIP_VALUES as readonly string[]).includes(lower)
        ? (lower as StatePipState)
        : 'backlog';
}


function getInitials(name: string): string {
    return name
        .split(' ')
        .map((p) => p[0] ?? '')
        .join('')
        .slice(0, 2)
        .toUpperCase();
}

const mapPriority = (p: number): 'urgent' | 'high' | 'medium' | 'low' | 'none' => {
    switch (p) {
        case 1:
            return 'urgent';
        case 2:
            return 'high';
        case 3:
            return 'medium';
        case 4:
            return 'low';
        default:
            return 'none';
    }
};

function getDueClasses(issue: Issue): string {
    if (issue.completedAt || issue.stateGroup?.toLowerCase() === 'completed') {
        return 'text-[var(--green-700)]';
    }
    if (!issue.dueDate) return 'text-[var(--neutral-500)]';
    // Compare date-only values in UTC to avoid timezone shift
    const todayUtc = new Date(`${new Date().toISOString().slice(0, 10)}T00:00:00Z`);
    const dueUtc = new Date(`${issue.dueDate.slice(0, 10)}T00:00:00Z`);
    if (dueUtc.getTime() <= todayUtc.getTime()) return 'text-[#c54a3a]';
    return 'text-[var(--neutral-600)]';
}

function renderDue(issue: Issue): string {
    if (!issue.dueDate) return '—';
    const formatted = formatDateOnly(issue.dueDate, { day: '2-digit', month: 'short' }) || '—';
    if (issue.completedAt || issue.stateGroup?.toLowerCase() === 'completed') {
        return `✓ ${formatted}`;
    }
    return formatted;
}

export const IssueRow = ({
    issue,
    projectIdentifier,
    workspaceSlug,
    projectId,
    features,
    onClick,
}: IssueRowProps): React.ReactElement => {
    const params = useParams<{ workspaceSlug: string; projectId: string }>();
    const resolvedSlug = workspaceSlug ?? params.workspaceSlug ?? '';
    const resolvedProjectId = projectId ?? params.projectId ?? '';
    const [editingIssue, setEditingIssue] = useState<Issue | null>(null);

    const { data: labelsData } = useLabels(resolvedSlug);
    const { data: cyclesData } = useCycles(resolvedSlug, resolvedProjectId, { enabled: !!resolvedSlug && !!resolvedProjectId && (features?.cyclesEnabled ?? false) });
    const { data: modulesData } = useModules(resolvedSlug, resolvedProjectId, { enabled: !!resolvedSlug && !!resolvedProjectId && (features?.modulesEnabled ?? false) });
    // Bug 1: fetch workspace members to resolve assigneeIds
    const { data: membersData } = useWorkspaceMembers(resolvedSlug);

    const labels = useMemo<Label[]>(() => {
        if (!issue.labelIds?.length || !labelsData) return [];
        const items = Array.isArray(labelsData)
            ? (labelsData as Label[])
            : ((labelsData as { items?: Label[] }).items ?? []);
        return issue.labelIds.map((id) => items.find((l) => l.id === id)).filter((l): l is Label => l !== undefined);
    }, [issue.labelIds, labelsData]);

    const cycle = useMemo<Cycle | undefined>(() => {
        if (!issue.cycleId || !cyclesData) return undefined;
        const items = Array.isArray(cyclesData)
            ? (cyclesData as Cycle[])
            : ((cyclesData as { items?: Cycle[] }).items ?? []);
        return items.find((c) => c.id === issue.cycleId);
    }, [issue.cycleId, cyclesData]);

    // Bug 8: resolve module names for the new Module column
    const resolvedModules = useMemo<Module[]>(() => {
        if (!issue.moduleIds?.length || !modulesData) return [];
        const items = Array.isArray(modulesData)
            ? (modulesData as Module[])
            : ((modulesData as { items?: Module[] }).items ?? []);
        return issue.moduleIds.map((id) => items.find((m) => m.id === id)).filter((m): m is Module => m !== undefined);
    }, [issue.moduleIds, modulesData]);

    // Bug 1: resolve assignee display info from workspace members
    const assignees = useMemo(() => {
        if (!issue.assigneeIds?.length || !membersData) return [];
        return issue.assigneeIds
            .map((id) => membersData.find((m) => m.userId === id))
            .filter((m): m is NonNullable<typeof m> => m !== undefined);
    }, [issue.assigneeIds, membersData]);

    return (
        <>
            <div
                role="button"
                tabIndex={0}
                onClick={onClick}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') onClick();
                }}
                style={{
                    display: 'grid',
                    gridTemplateColumns: buildGridTemplate(features),
                    alignItems: 'center',
                    columnGap: 14,
                    padding: '9px 24px',
                    borderTop: '1px solid var(--neutral-300)',
                    fontSize: 13,
                }}
                className={cn(
                    'group relative w-full text-left cursor-pointer',
                    'hover:bg-white hover:shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all duration-150',
                )}
            >
                {/* 1. Checkbox */}
                {/* biome-ignore lint/a11y/noStaticElementInteractions: wrapper exists solely to swallow the row click; checkbox inside owns the real interaction */}
                <div
                    role="presentation"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                >
                    <Checkbox aria-label={`Seleccionar ${issue.title}`} />
                </div>

                {/* 2. StatePip */}
                <div className="flex items-center justify-center">
                    <StatePip state={toStatePipState(issue.stateGroup)} size={13} />
                </div>

                {/* 3. ID */}
                <span className="font-mono text-[11px] text-[var(--neutral-600)] tracking-tight">
                    {projectIdentifier ?? 'ISS'}-{issue.sequenceId}
                </span>

                {/* 4. Título */}
                <span className="min-w-0 truncate font-medium tracking-[-0.005em] text-[var(--neutral-1200)]">
                    {issue.title}
                </span>

                {/* 5. Etiqueta */}
                <div className="min-w-0 flex items-center flex-wrap gap-1">
                    {labels.slice(0, 2).map((label) => (
                        <span
                            key={label.id}
                            className="inline-flex items-center gap-1.5 px-2 py-[2px] rounded-full text-[11px] font-medium max-w-full"
                            style={{
                                background: `${label.color}1f`,
                                color: label.color,
                            }}
                        >
                            <span
                                className="w-1.5 h-1.5 rounded-full shrink-0"
                                style={{ background: label.color }}
                                aria-hidden="true"
                            />
                            <span className="truncate">{label.name}</span>
                        </span>
                    ))}
                    {labels.length > 2 && (
                        <span className="text-[10px] font-mono text-[var(--neutral-600)] px-1 py-[2px] rounded bg-[var(--neutral-200)]">
                            +{labels.length - 2}
                        </span>
                    )}
                </div>

                {/* 6. Ciclo (conditionally rendered) */}
                {(features?.cyclesEnabled ?? false) && (
                    <div className="min-w-0">
                        {cycle && (
                            <span className="inline-flex items-center gap-1 px-2 py-[2px] rounded text-[11px] bg-[var(--neutral-200)] text-[var(--neutral-1100)] max-w-full">
                                <Calendar size={10} className="shrink-0" aria-hidden="true" />
                                <span className="truncate">{cycle.name}</span>
                            </span>
                        )}
                    </div>
                )}

                {/* 7. Módulo (conditionally rendered) */}
                {(features?.modulesEnabled ?? false) && (
                    <div className="min-w-0 flex items-center gap-1 flex-wrap">
                        {resolvedModules.slice(0, 1).map((mod) => (
                            <span
                                key={mod.id}
                                className="inline-flex items-center px-2 py-[2px] rounded text-[11px] bg-[var(--neutral-200)] text-[var(--neutral-1100)] max-w-full truncate"
                            >
                                <span className="truncate">{mod.name}</span>
                            </span>
                        ))}
                        {resolvedModules.length > 1 && (
                            <span className="text-[10px] font-mono text-[var(--neutral-600)] px-1 py-[2px] rounded bg-[var(--neutral-200)]">
                                +{resolvedModules.length - 1}
                            </span>
                        )}
                    </div>
                )}

                {/* 8. Vence */}
                <span
                    className={cn(
                        'font-mono text-[11px] tabular-nums',
                        getDueClasses(issue),
                    )}
                >
                    {renderDue(issue)}
                </span>

                {/* 9. P */}
                <div className="flex items-center justify-center">
                    <PriorityDot priority={mapPriority(issue.priority)} size={11} withTooltip />
                </div>

                {/* 11. Sub-issues — Bug 7: no subIssueCount in DTO, show — */}
                {/* TODO(backend): include subIssueCount/subIssueCompletedCount in Issue DTO */}
                <span
                    className="font-mono text-[10.5px] tabular-nums text-[var(--neutral-500)]"
                    title="Sub-issues no disponibles hasta que el backend provea el campo"
                >
                    —
                </span>

                {/* 12. Asignado — Bug 1: use assigneeIds + workspace members */}
                <div className="flex items-center justify-end gap-1.5">
                    {assignees.length > 0 ? (
                        <div className="flex items-center -space-x-1.5">
                            {assignees.slice(0, 3).map((member) => (
                                <div
                                    key={member.userId}
                                    title={member.displayName ?? member.email}
                                    className="w-[22px] h-[22px] rounded-full bg-[var(--brand-700)] flex items-center justify-center text-[9px] font-bold text-white shrink-0 ring-2 ring-white"
                                    aria-hidden="true"
                                >
                                    {member.avatarUrl ? (
                                        <img
                                            src={member.avatarUrl}
                                            alt={member.displayName ?? member.email}
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    ) : (
                                        getInitials(member.displayName ?? member.email)
                                    )}
                                </div>
                            ))}
                            {assignees.length > 3 && (
                                <div
                                    className="w-[22px] h-[22px] rounded-full bg-[var(--neutral-300)] flex items-center justify-center text-[9px] font-mono text-[var(--neutral-700)] shrink-0 ring-2 ring-white"
                                    title={`+${assignees.length - 3} más`}
                                    aria-hidden="true"
                                >
                                    +{assignees.length - 3}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div
                            className="w-[22px] h-[22px] rounded-full border border-dashed border-[var(--neutral-400)] shrink-0"
                            aria-hidden="true"
                        />
                    )}

                    {resolvedSlug && resolvedProjectId && (
                        <div className="flex items-center shrink-0">
                            <IssueActionsMenu
                                issue={issue}
                                workspaceSlug={resolvedSlug}
                                projectId={resolvedProjectId}
                                onEdit={() => setEditingIssue(issue)}
                            />
                        </div>
                    )}
                </div>
            </div>

            {editingIssue && resolvedSlug && resolvedProjectId && (
                <CreateIssueDialog
                    issue={editingIssue}
                    open={!!editingIssue}
                    onOpenChange={(open) => {
                        if (!open) setEditingIssue(null);
                    }}
                    workspaceSlug={resolvedSlug}
                    projectId={resolvedProjectId}
                    trigger={<span />}
                />
            )}
        </>
    );
};
