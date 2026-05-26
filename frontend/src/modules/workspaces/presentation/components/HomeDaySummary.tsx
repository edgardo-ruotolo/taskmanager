import type React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import type { Issue } from '@/modules/issues/domain/types';

interface DayIssueRowProps {
    issue: Issue;
}

function formatDueDate(dateStr: string | undefined): string | null {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Hoy';
    if (date.toDateString() === tomorrow.toDateString()) return 'Mañana';
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}

function isOverdue(dateStr: string | undefined): boolean {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
}

function DayIssueRow({ issue }: DayIssueRowProps): React.ReactElement {
    const dueDateLabel = formatDueDate(issue.dueDate);
    const overdue = isOverdue(issue.dueDate);

    return (
        <div className="flex items-center gap-3 py-[9px] border-b border-[var(--neutral-300)] last:border-b-0 group hover:bg-[var(--neutral-50)] -mx-3 px-3 rounded-lg transition-colors">
            {/* State color pip */}
            <span
                className="shrink-0 w-2 h-2 rounded-full"
                style={{ backgroundColor: issue.stateColor || 'var(--neutral-500)' }}
                aria-hidden="true"
            />

            {/* Sequence ID */}
            <span className="shrink-0 font-mono text-[11px] font-medium text-[var(--neutral-600)] tracking-wider min-w-[3rem]">
                #{issue.sequenceId}
            </span>

            {/* Title */}
            <span className="flex-1 text-[13.5px] text-[var(--neutral-1200)] tracking-[-0.01em] truncate min-w-0">
                {issue.title}
            </span>

            {/* State chip */}
            <span className="shrink-0 hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--neutral-200)] text-[11px] font-medium text-[var(--neutral-700)] whitespace-nowrap">
                {issue.stateName}
            </span>

            {/* Due date */}
            {dueDateLabel && (
                <span
                    className={cn(
                        'shrink-0 font-mono text-[11px] font-medium whitespace-nowrap',
                        overdue
                            ? 'text-red-500'
                            : 'text-[var(--neutral-600)]',
                    )}
                >
                    {dueDateLabel}
                </span>
            )}
        </div>
    );
}

interface HomeDaySummaryProps {
    issues: Issue[];
    isLoading?: boolean;
}

export function HomeDaySummary({ issues, isLoading = false }: HomeDaySummaryProps): React.ReactElement {
    if (isLoading) {
        return (
            <div className="flex flex-col gap-3">
                {(['a', 'b', 'c'] as const).map((k) => (
                    <Skeleton key={k} className="h-9 w-full bg-[var(--neutral-200)] rounded-lg" />
                ))}
            </div>
        );
    }

    if (issues.length === 0) {
        return (
            <div className="py-8 text-center">
                <p className="text-[13px] text-[var(--neutral-600)]">No hay tareas asignadas para hoy.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            {issues.map((issue) => (
                <DayIssueRow key={issue.id} issue={issue} />
            ))}
        </div>
    );
}
