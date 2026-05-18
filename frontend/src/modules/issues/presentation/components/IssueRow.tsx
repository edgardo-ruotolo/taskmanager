import type React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatePip } from '@/components/ui/state-pip';
import { PriorityDot } from '@/components/ui/priority-dot';
import type { Issue } from '../../domain/types';

interface IssueRowProps {
    issue: Issue;
    companyIdentifier?: string;
    onClick: () => void;
}

const STATE_PIP_VALUES = ['backlog', 'unstarted', 'started', 'completed', 'cancelled'] as const;
type StatePipState = (typeof STATE_PIP_VALUES)[number];

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

export const IssueRow = ({ issue, companyIdentifier, onClick }: IssueRowProps): React.ReactElement => (
    <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onClick();
        }}
        className={cn(
            'group w-full flex items-center gap-3 px-4 h-11 text-left cursor-pointer',
            'hover:bg-white hover:shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all duration-150',
            'border-b border-[var(--neutral-300)] last:border-b-0 relative',
        )}
    >
        {/* Left: sequence id + pip */}
        <div className="flex items-center gap-3 w-28 shrink-0">
            <StatePip state={toStatePipState(issue.stateGroup)} size={14} />
            <span className="text-[11px] font-mono text-[var(--neutral-600)] tracking-tight">
                {companyIdentifier ?? 'ISS'}-{issue.sequenceId}
            </span>
        </div>

        {/* Center: title */}
        <span className="flex-1 min-w-0 text-[13.5px] text-[var(--neutral-1200)] truncate tracking-[-0.01em] font-medium">
            {issue.title}
        </span>

        {/* Right: priority + date + assignee + hover actions */}
        <div className="flex items-center gap-4 shrink-0">
            <PriorityDot priority={mapPriority(issue.priority)} size={12} />

            {issue.dueDate ? (
                <span className="text-[11px] text-[var(--neutral-600)] font-mono tabular-nums w-12 text-right">
                    {formatShortDate(issue.dueDate)}
                </span>
            ) : (
                <span className="w-12" aria-hidden="true" />
            )}

            {issue.assigneeId ? (
                <div
                    title={issue.assigneeId}
                    className="w-6 h-6 rounded-full bg-[var(--brand-700)] flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                >
                    {getInitials(issue.assigneeId)}
                </div>
            ) : (
                <div
                    className="w-6 h-6 rounded-full border border-dashed border-[var(--neutral-400)] shrink-0"
                    aria-hidden="true"
                />
            )}

            {/* Hover action icons */}
            <div className="hidden group-hover:flex items-center gap-0.5 shrink-0 ml-1">
                <button
                    type="button"
                    aria-label="Más opciones"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 rounded-md text-[var(--neutral-600)] hover:text-[var(--neutral-1200)] hover:bg-[var(--neutral-200)] transition-colors"
                >
                    <MoreHorizontal size={14} />
                </button>
            </div>
        </div>
    </div>
);
