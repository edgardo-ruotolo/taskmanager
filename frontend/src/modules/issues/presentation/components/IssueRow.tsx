import type React from 'react';
import { Clock, Copy, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IssuePriorityBadge } from './IssuePriorityBadge';
import type { Issue } from '../../domain/types';

interface IssueRowProps {
    issue: Issue;
    companyIdentifier?: string;
    onClick: () => void;
}

function formatShortDate(dateStr: string): string {
    return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit' }).format(
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

export const IssueRow = ({ issue, companyIdentifier, onClick }: IssueRowProps): React.ReactElement => (
    <button
        type="button"
        onClick={onClick}
        className={cn(
            'group w-full flex items-center gap-3 px-4 h-12 text-left',
            'hover:bg-surface-2 transition-colors',
            'border-b border-subtle last:border-b-0',
        )}
    >
        {/* Left: sequence id */}
        <span className="text-xs font-mono text-placeholder w-16 shrink-0">
            {companyIdentifier ?? 'ISS'}-{issue.sequenceId}
        </span>

        {/* Center: title */}
        <span className="flex-1 min-w-0 text-sm text-primary truncate">{issue.title}</span>

        {/* Right: state + priority + date + assignee + hover actions */}
        <div className="flex items-center gap-3 shrink-0">
            {/* State badge */}
            <span className="flex items-center gap-1.5">
                <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: issue.stateColor }}
                    aria-hidden="true"
                />
                <span className="hidden sm:inline text-xs text-placeholder">{issue.stateName}</span>
            </span>

            <IssuePriorityBadge priority={issue.priority} />

            {issue.dueDate ? (
                <span className="text-xs text-placeholder tabular-nums w-10 text-right">
                    {formatShortDate(issue.dueDate)}
                </span>
            ) : (
                <span className="w-10" aria-hidden="true" />
            )}

            {issue.assigneeId ? (
                <abbr
                    title={issue.assigneeId}
                    className="no-underline w-6 h-6 rounded-full bg-layer-2 flex items-center justify-center text-[10px] font-semibold text-secondary shrink-0 cursor-default"
                >
                    {getInitials(issue.assigneeId)}
                </abbr>
            ) : (
                <span className="w-6 h-6 rounded-full border border-dashed border-subtle shrink-0" aria-hidden="true" />
            )}

            {/* Hover action icons */}
            <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
                <button
                    type="button"
                    aria-label="Fecha"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 rounded text-placeholder hover:text-secondary hover:bg-surface-2 transition-colors"
                >
                    <Clock size={13} />
                </button>
                <button
                    type="button"
                    aria-label="Copiar"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 rounded text-placeholder hover:text-secondary hover:bg-surface-2 transition-colors"
                >
                    <Copy size={13} />
                </button>
                <button
                    type="button"
                    aria-label="Más opciones"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 rounded text-placeholder hover:text-secondary hover:bg-surface-2 transition-colors"
                >
                    <MoreHorizontal size={13} />
                </button>
            </div>
        </div>
    </button>
);
