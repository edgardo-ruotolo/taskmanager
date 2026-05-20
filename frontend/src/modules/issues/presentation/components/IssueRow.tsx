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
import type { Label } from '@/modules/labels/domain/types';
import type { Cycle } from '@/modules/cycles/domain/types';
import type { Issue } from '../../domain/types';
import { IssueActionsMenu } from './IssueActionsMenu';
import { CreateIssueDialog } from './CreateIssueDialog';

interface IssueRowProps {
    issue: Issue;
    companyIdentifier?: string;
    workspaceSlug?: string;
    companyId?: string;
    onClick: () => void;
}

const STATE_PIP_VALUES = ['backlog', 'unstarted', 'started', 'completed', 'cancelled'] as const;
type StatePipState = (typeof STATE_PIP_VALUES)[number];

const GRID_TEMPLATE = '28px 32px 80px 1fr 110px 120px 110px 60px 36px 100px 60px';

function toStatePipState(stateGroup?: string): StatePipState {
    const lower = stateGroup?.toLowerCase() ?? 'backlog';
    return (STATE_PIP_VALUES as readonly string[]).includes(lower)
        ? (lower as StatePipState)
        : 'backlog';
}

function formatShortDate(dateStr: string): string {
    return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short' }).format(
        new Date(dateStr),
    );
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
        case 4:
            return 'urgent';
        case 3:
            return 'high';
        case 2:
            return 'medium';
        case 1:
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
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const due = new Date(issue.dueDate);
    due.setHours(0, 0, 0, 0);
    if (due.getTime() <= now.getTime()) return 'text-[#c54a3a]';
    return 'text-[var(--neutral-600)]';
}

function renderDue(issue: Issue): string {
    if (!issue.dueDate) return '—';
    const formatted = formatShortDate(issue.dueDate);
    if (issue.completedAt || issue.stateGroup?.toLowerCase() === 'completed') {
        return `✓ ${formatted}`;
    }
    return formatted;
}

export const IssueRow = ({
    issue,
    companyIdentifier,
    workspaceSlug,
    companyId,
    onClick,
}: IssueRowProps): React.ReactElement => {
    const params = useParams<{ workspaceSlug: string; companyId: string }>();
    const resolvedSlug = workspaceSlug ?? params.workspaceSlug ?? '';
    const resolvedCompanyId = companyId ?? params.companyId ?? '';
    const [editingIssue, setEditingIssue] = useState<Issue | null>(null);

    const { data: labelsData } = useLabels(resolvedSlug);
    const { data: cyclesData } = useCycles(resolvedSlug, resolvedCompanyId);

    const label = useMemo<Label | undefined>(() => {
        const firstLabelId = issue.labelIds[0];
        if (!firstLabelId || !labelsData) return undefined;
        const items = Array.isArray(labelsData)
            ? (labelsData as Label[])
            : ((labelsData as { items?: Label[] }).items ?? []);
        return items.find((l) => l.id === firstLabelId);
    }, [issue.labelIds, labelsData]);

    const cycle = useMemo<Cycle | undefined>(() => {
        if (!issue.cycleId || !cyclesData) return undefined;
        const items = Array.isArray(cyclesData)
            ? (cyclesData as Cycle[])
            : ((cyclesData as { items?: Cycle[] }).items ?? []);
        return items.find((c) => c.id === issue.cycleId);
    }, [issue.cycleId, cyclesData]);

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
                    gridTemplateColumns: GRID_TEMPLATE,
                    alignItems: 'center',
                    gap: 10,
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
                    {companyIdentifier ?? 'ISS'}-{issue.sequenceId}
                </span>

                {/* 4. Título */}
                <span className="min-w-0 truncate font-medium tracking-[-0.005em] text-[var(--neutral-1200)]">
                    {issue.title}
                </span>

                {/* 5. Etiqueta */}
                <div className="min-w-0">
                    {label && (
                        <span
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
                    )}
                </div>

                {/* 6. Ciclo */}
                <div className="min-w-0">
                    {cycle && (
                        <span className="inline-flex items-center gap-1 px-2 py-[2px] rounded text-[11px] bg-[var(--neutral-200)] text-[var(--neutral-1100)] max-w-full">
                            <Calendar size={10} className="shrink-0" aria-hidden="true" />
                            <span className="truncate">{cycle.name}</span>
                        </span>
                    )}
                </div>

                {/* 7. Vence */}
                <span
                    className={cn(
                        'font-mono text-[11px] tabular-nums',
                        getDueClasses(issue),
                    )}
                >
                    {renderDue(issue)}
                </span>

                {/* 8. Est. */}
                <span className="font-mono text-[10.5px] tabular-nums text-[var(--neutral-600)]">
                    {issue.point ?? ''}
                </span>

                {/* 9. P */}
                <div className="flex items-center justify-center">
                    <PriorityDot priority={mapPriority(issue.priority)} size={11} />
                </div>

                {/* 10. Sub-issues */}
                <span className="font-mono text-[10.5px] tabular-nums text-[var(--neutral-500)]">
                    —
                </span>

                {/* 11. Asignado + actions on hover */}
                <div className="flex items-center justify-end gap-1.5">
                    {issue.assigneeId ? (
                        <div
                            title={issue.assigneeId}
                            className="w-[22px] h-[22px] rounded-full bg-[var(--brand-700)] flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                        >
                            {getInitials(issue.assigneeId)}
                        </div>
                    ) : (
                        <div
                            className="w-[22px] h-[22px] rounded-full border border-dashed border-[var(--neutral-400)] shrink-0"
                            aria-hidden="true"
                        />
                    )}

                    {resolvedSlug && resolvedCompanyId && (
                        <div className="flex items-center shrink-0 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto transition-opacity">
                            <IssueActionsMenu
                                issue={issue}
                                workspaceSlug={resolvedSlug}
                                companyId={resolvedCompanyId}
                                onEdit={() => setEditingIssue(issue)}
                            />
                        </div>
                    )}
                </div>
            </div>

            {editingIssue && resolvedSlug && resolvedCompanyId && (
                <CreateIssueDialog
                    issue={editingIssue}
                    open={!!editingIssue}
                    onOpenChange={(open) => {
                        if (!open) setEditingIssue(null);
                    }}
                    workspaceSlug={resolvedSlug}
                    companyId={resolvedCompanyId}
                    trigger={<span />}
                />
            )}
        </>
    );
};
