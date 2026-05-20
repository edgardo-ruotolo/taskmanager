import type React from 'react';
import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Issue, IssuePriority } from '../../domain/types';
import { IssuePriorityBadge } from './IssuePriorityBadge';

interface IssueGanttViewProps {
    issues: Issue[];
    onRowClick: (issueId: string) => void;
}

type ViewRange = 'week' | 'month' | 'quarter';

const GANTT_PRIORITY_COLORS: Record<IssuePriority, string> = {
    0: 'bg-layer-2',
    1: 'bg-red-500',
    2: 'bg-orange-500',
    3: 'bg-blue-500',
    4: 'bg-green-600',
};

const VIEW_RANGE_DAYS: Record<ViewRange, number> = {
    week: 7,
    month: 30,
    quarter: 90,
};

const VIEW_RANGE_LABELS: Record<ViewRange, string> = {
    week: 'Semana',
    month: 'Mes',
    quarter: 'Trimestre',
};

function differenceInDays(a: Date, b: Date): number {
    return Math.round((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

function addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

function startOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

function formatMonthYear(date: Date): string {
    return date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
}

function formatDayMonth(date: Date): string {
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}

function getMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return startOfDay(d);
}

function buildWeeklyLabels(viewStart: Date, totalDays: number): { label: string; offsetDays: number }[] {
    const labels: { label: string; offsetDays: number }[] = [];
    let current = getMonday(viewStart);
    if (differenceInDays(current, viewStart) < 0) {
        current = addDays(current, 7);
    }
    while (differenceInDays(current, viewStart) < totalDays) {
        const offset = differenceInDays(current, viewStart);
        if (offset >= 0) {
            labels.push({ label: formatDayMonth(current), offsetDays: offset });
        }
        current = addDays(current, 7);
    }
    return labels;
}

function buildDateLabels(viewStart: Date, totalDays: number, _viewRange: ViewRange): { label: string; offsetDays: number }[] {
    return buildWeeklyLabels(viewStart, totalDays);
}

function computeInitialViewStart(issues: Issue[]): Date {
    const dates: Date[] = [];

    for (const issue of issues) {
        if (issue.startDate) dates.push(new Date(issue.startDate));
        if (issue.dueDate) dates.push(new Date(issue.dueDate));
    }

    if (dates.length === 0) {
        const now = startOfDay(new Date());
        return addDays(now, -7);
    }

    const minDate = dates.reduce((a, b) => (a < b ? a : b));
    return addDays(startOfDay(minDate), -7);
}

interface BarConfig {
    leftPct: number;
    widthPct: number;
    isDiamond: boolean;
    hasNoDate: boolean;
    priorityColor: string;
}

function computeBarConfig(issue: Issue, viewStart: Date, totalDays: number): BarConfig {
    const priorityColor = GANTT_PRIORITY_COLORS[issue.priority];
    const effectiveDueDate = issue.dueDate;

    if (!issue.startDate && !effectiveDueDate) {
        return { leftPct: 0, widthPct: 0, isDiamond: false, hasNoDate: true, priorityColor };
    }

    if (!issue.startDate && effectiveDueDate) {
        // Diamond marker at dueDate
        const dueD = startOfDay(new Date(effectiveDueDate));
        const offset = differenceInDays(dueD, viewStart);
        const leftPct = (offset / totalDays) * 100;
        return { leftPct, widthPct: 0, isDiamond: true, hasNoDate: false, priorityColor };
    }

    const issueStart = startOfDay(new Date(issue.startDate as string));
    const issueEnd = effectiveDueDate
        ? startOfDay(new Date(effectiveDueDate))
        : addDays(issueStart, 1);

    const barStartDays = Math.max(0, differenceInDays(issueStart, viewStart));
    const barDuration = Math.max(1, differenceInDays(issueEnd, issueStart));
    const leftPct = (barStartDays / totalDays) * 100;
    const widthPct = Math.min(100 - leftPct, (barDuration / totalDays) * 100);

    return { leftPct, widthPct, isDiamond: false, hasNoDate: false, priorityColor };
}

export const IssueGanttView = ({ issues, onRowClick }: IssueGanttViewProps): React.ReactElement => {
    const [viewRange, setViewRange] = useState<ViewRange>('month');
    const [viewStart, setViewStart] = useState<Date>(() => computeInitialViewStart(issues));

    const totalDays = VIEW_RANGE_DAYS[viewRange];
    const viewEnd = addDays(viewStart, totalDays);

    const headerLabel = useMemo(() => {
        const startLabel = formatMonthYear(viewStart);
        const endLabel = formatMonthYear(viewEnd);
        return startLabel === endLabel ? startLabel : `${startLabel} — ${endLabel}`;
    }, [viewStart, viewEnd]);

    const dateLabels = useMemo(
        () => buildDateLabels(viewStart, totalDays, viewRange),
        [viewStart, totalDays, viewRange],
    );

    function navigate(direction: 'prev' | 'next'): void {
        const days = VIEW_RANGE_DAYS[viewRange];
        setViewStart((prev) => addDays(prev, direction === 'next' ? days : -days));
    }

    return (
        <div className="border border-subtle rounded-lg overflow-hidden animate-fade-in">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-subtle bg-surface-1">
                {/* View range toggle */}
                <div className="flex items-center border border-subtle rounded-md overflow-hidden">
                    {(['week', 'month', 'quarter'] as const).map((range) => (
                        <button
                            key={range}
                            type="button"
                            onClick={() => setViewRange(range)}
                            className={cn(
                                'px-3 py-1 text-xs font-medium transition-colors',
                                viewRange === range
                                    ? 'bg-layer-2 text-primary'
                                    : 'text-placeholder hover:text-secondary hover:bg-surface-2',
                            )}
                        >
                            {VIEW_RANGE_LABELS[range]}
                        </button>
                    ))}
                </div>

                {/* Navigation */}
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        aria-label="Período anterior"
                        onClick={() => navigate('prev')}
                        className="p-1 rounded text-placeholder hover:text-secondary hover:bg-surface-2 transition-colors"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className="text-xs font-medium text-secondary min-w-[140px] text-center">
                        {headerLabel}
                    </span>
                    <button
                        type="button"
                        aria-label="Período siguiente"
                        onClick={() => navigate('next')}
                        className="p-1 rounded text-placeholder hover:text-secondary hover:bg-surface-2 transition-colors"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className="flex overflow-hidden">
                {/* Left panel — issue names */}
                <div className="w-56 flex-shrink-0 border-r border-subtle overflow-y-auto">
                    {/* Date header spacer */}
                    <div className="h-8 border-b border-subtle bg-surface-1" />

                    {issues.length === 0 ? (
                        <div className="h-12 flex items-center px-3">
                            <span className="text-xs text-placeholder">
                                Sin issues
                            </span>
                        </div>
                    ) : (
                        issues.map((issue) => (
                            <button
                                key={issue.id}
                                type="button"
                                onClick={() => onRowClick(issue.id)}
                                className="w-full h-12 flex items-center gap-2 px-3 border-b border-subtle last:border-b-0 hover:bg-surface-2 transition-colors text-left"
                            >
                                <span className="text-xs font-mono text-placeholder shrink-0">
                                    ISS-{issue.sequenceId}
                                </span>
                                <span className="text-xs text-secondary truncate flex-1">
                                    {issue.title}
                                </span>
                                <IssuePriorityBadge
                                    priority={issue.priority}
                                    className="shrink-0 [&_span]:hidden"
                                />
                            </button>
                        ))
                    )}
                </div>

                {/* Right panel — timeline */}
                <div className="flex-1 overflow-x-auto">
                    {/* Date header */}
                    <div
                        className="relative h-8 border-b border-subtle bg-surface-1"
                        style={{ minWidth: `${totalDays * 28}px` }}
                    >
                        {dateLabels.map(({ label, offsetDays }) => (
                            <span
                                key={`${label}-${offsetDays}`}
                                className="absolute top-1/2 -translate-y-1/2 text-[10px] text-placeholder whitespace-nowrap"
                                style={{ left: `${(offsetDays / totalDays) * 100}%`, paddingLeft: '4px' }}
                            >
                                {label}
                            </span>
                        ))}
                    </div>

                    {/* Issue rows */}
                    {issues.length === 0 ? (
                        <div
                            className="h-12"
                            style={{ minWidth: `${totalDays * 28}px` }}
                        />
                    ) : (
                        issues.map((issue) => {
                            const bar = computeBarConfig(issue, viewStart, totalDays);

                            return (
                                <div
                                    key={issue.id}
                                    className="relative h-12 border-b border-subtle last:border-b-0 hover:bg-surface-2 transition-colors"
                                    style={{ minWidth: `${totalDays * 28}px` }}
                                >
                                    {/* Grid lines */}
                                    {dateLabels.map(({ label, offsetDays }) => (
                                        <div
                                            key={`grid-${label}-${offsetDays}`}
                                            className="absolute top-0 bottom-0 border-l border-subtle opacity-40"
                                            style={{ left: `${(offsetDays / totalDays) * 100}%` }}
                                            aria-hidden="true"
                                        />
                                    ))}

                                    {/* Bar / marker */}
                                    {bar.hasNoDate && (
                                        <div className="absolute inset-0 flex items-center px-2">
                                            <span className="text-xs text-placeholder italic">
                                                sin fechas
                                            </span>
                                        </div>
                                    )}

                                    {!bar.hasNoDate && !bar.isDiamond && bar.widthPct > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => onRowClick(issue.id)}
                                            title={issue.title}
                                            className={cn(
                                                'absolute top-1/2 -translate-y-1/2 h-5 rounded-full opacity-80 hover:opacity-100 transition-opacity cursor-pointer',
                                                bar.priorityColor,
                                            )}
                                            style={{
                                                left: `${bar.leftPct}%`,
                                                width: `${bar.widthPct}%`,
                                                minWidth: '8px',
                                            }}
                                        />
                                    )}

                                    {!bar.hasNoDate && bar.isDiamond && (
                                        <button
                                            type="button"
                                            onClick={() => onRowClick(issue.id)}
                                            title={issue.title}
                                            className={cn(
                                                'absolute top-1/2 -translate-y-1/2 w-3 h-3 rotate-45 opacity-80 hover:opacity-100 transition-opacity cursor-pointer',
                                                bar.priorityColor,
                                            )}
                                            style={{ left: `calc(${bar.leftPct}% - 6px)` }}
                                        />
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};
