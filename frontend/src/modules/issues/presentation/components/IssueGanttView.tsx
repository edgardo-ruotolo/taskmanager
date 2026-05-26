import type React from 'react';
import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatePip } from '@/components/ui/state-pip';
import { useWorkspaceMembers } from '@/modules/workspaces/application/use-workspaces';
import { parseDateOnly } from '@/shared/lib/date';
import type { Issue } from '../../domain/types';
import { useIssuesUiStore } from '../../application/issues-ui-store';

interface IssueGanttViewProps {
    issues: Issue[];
    projectIdentifier?: string;
    onRowClick: (issueId: string) => void;
    workspaceSlug?: string;
}

// 4 zoom levels: day (7 d) | week (14 d) | month (30 d) | quarter (90 d)
type ViewRange = 'day' | 'week' | 'month' | 'quarter';

const VIEW_RANGE_DAYS: Record<ViewRange, number> = {
    day: 7,
    week: 14,
    month: 30,
    quarter: 90,
};

const VIEW_RANGE_LABELS: Record<ViewRange, string> = {
    day: 'Día',
    week: 'Semana',
    month: 'Mes',
    quarter: 'Q',
};

const STATE_PIP_VALUES = ['backlog', 'unstarted', 'started', 'completed', 'cancelled'] as const;
type StatePipState = (typeof STATE_PIP_VALUES)[number];

function toStatePipState(stateGroup?: string): StatePipState {
    const lower = stateGroup?.toLowerCase() ?? 'unstarted';
    return (STATE_PIP_VALUES as readonly string[]).includes(lower)
        ? (lower as StatePipState)
        : 'unstarted';
}


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

function getQuarter(date: Date): number {
    return Math.floor(date.getMonth() / 3) + 1;
}

function getMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return startOfDay(d);
}

function getWeekNumber(date: Date): number {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function buildDateLabels(viewStart: Date, totalDays: number, viewRange: ViewRange): { label: string; offsetDays: number }[] {
    if (viewRange === 'day') {
        // Daily labels
        const labels: { label: string; offsetDays: number }[] = [];
        for (let i = 0; i < totalDays; i++) {
            const d = addDays(viewStart, i);
            labels.push({
                label: d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }),
                offsetDays: i,
            });
        }
        return labels;
    }
    // Weekly labels for week/month/quarter
    const labels: { label: string; offsetDays: number }[] = [];
    let current = getMonday(viewStart);
    if (differenceInDays(current, viewStart) < 0) current = addDays(current, 7);
    while (differenceInDays(current, viewStart) < totalDays) {
        const offset = differenceInDays(current, viewStart);
        if (offset >= 0) {
            const wn = getWeekNumber(current);
            labels.push({ label: `W${wn}`, offsetDays: offset });
        }
        current = addDays(current, 7);
    }
    return labels;
}

function computeInitialViewStart(issues: Issue[]): Date {
    const dates: Date[] = [];
    for (const issue of issues) {
        if (issue.startDate) {
            const d = parseDateOnly(issue.startDate);
            if (d) dates.push(d);
        }
        if (issue.dueDate) {
            const d = parseDateOnly(issue.dueDate);
            if (d) dates.push(d);
        }
    }
    if (dates.length === 0) {
        const now = startOfDay(new Date());
        return addDays(now, -7);
    }
    const minDate = dates.reduce((a, b) => (a < b ? a : b));
    return addDays(startOfDay(minDate), -7);
}

function getInitialsFromName(name?: string): string {
    if (!name || name.trim() === '') return '?';
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const second = parts[1]?.[0] ?? '';
    return (first + second).toUpperCase() || '?';
}

interface BarConfig {
    leftPct: number;
    widthPct: number;
    isDiamond: boolean;
    hasNoDate: boolean;
    barColor: string;
}

/** Use stateColor for the bar (per design). Falls back to grey if not available. */
function computeBarConfig(issue: Issue, viewStart: Date, totalDays: number): BarConfig {
    // Use stateColor per design spec (Timeline uses state color, not priority color)
    const barColor = issue.stateColor || '#94a3b8';
    const effectiveDueDate = issue.dueDate;

    if (!issue.startDate && !effectiveDueDate) {
        return { leftPct: 0, widthPct: 0, isDiamond: false, hasNoDate: true, barColor };
    }

    if (!issue.startDate && effectiveDueDate) {
        const dueParsed = parseDateOnly(effectiveDueDate);
        if (!dueParsed) return { leftPct: 0, widthPct: 0, isDiamond: false, hasNoDate: true, barColor };
        const dueD = startOfDay(dueParsed);
        const offset = differenceInDays(dueD, viewStart);
        const leftPct = (offset / totalDays) * 100;
        return { leftPct, widthPct: 0, isDiamond: true, hasNoDate: false, barColor };
    }

    const startParsed = parseDateOnly(issue.startDate as string);
    if (!startParsed) return { leftPct: 0, widthPct: 0, isDiamond: false, hasNoDate: true, barColor };
    const issueStart = startOfDay(startParsed);
    const endParsed = effectiveDueDate ? parseDateOnly(effectiveDueDate) : null;
    const issueEnd = endParsed ? startOfDay(endParsed) : addDays(issueStart, 1);

    const barStartDays = Math.max(0, differenceInDays(issueStart, viewStart));
    const barDuration = Math.max(1, differenceInDays(issueEnd, issueStart));
    const leftPct = (barStartDays / totalDays) * 100;
    const widthPct = Math.min(100 - leftPct, (barDuration / totalDays) * 100);

    return { leftPct, widthPct, isDiamond: false, hasNoDate: false, barColor };
}

interface GanttRow {
    issue: Issue;
    level: number;
    /** Rollup bar dates when issue itself has no dates but children do */
    rollupStart?: Date;
    rollupEnd?: Date;
    isRollup: boolean;
}

/** Computes rollup date range from direct children when parent has no dates. */
function computeRollup(children: Issue[]): { rollupStart?: Date; rollupEnd?: Date; isRollup: boolean } {
    const starts: Date[] = [];
    const ends: Date[] = [];
    for (const child of children) {
        if (child.startDate) {
            const d = parseDateOnly(child.startDate);
            if (d) starts.push(d);
        }
        if (child.dueDate) {
            const d = parseDateOnly(child.dueDate);
            if (d) ends.push(d);
        }
    }
    if (starts.length === 0 && ends.length === 0) return { isRollup: false };
    const rollupStart = starts.reduce((a, b) => (a < b ? a : b), starts[0] ?? ends[0]);
    const rollupEnd = ends.reduce((a, b) => (a > b ? a : b), ends[0] ?? starts[0]);
    return { rollupStart, rollupEnd, isRollup: true };
}

/** DFS-walks the issue tree, appending GanttRows in order. */
function walkGanttTree(
    parentId: string | null,
    level: number,
    byParent: Map<string | null, Issue[]>,
    expandedIds: Set<string>,
    result: GanttRow[],
): void {
    const children = byParent.get(parentId) ?? [];
    const sorted = [...children].sort((a, b) => a.sortOrder - b.sortOrder);
    for (const issue of sorted) {
        const directChildren = byParent.get(issue.id) ?? [];
        let rollupData: { rollupStart?: Date; rollupEnd?: Date; isRollup: boolean } = { isRollup: false };
        if (!issue.startDate && !issue.dueDate && directChildren.length > 0) {
            rollupData = computeRollup(directChildren);
        }
        result.push({ issue, level, ...rollupData });
        if (expandedIds.has(issue.id)) {
            walkGanttTree(issue.id, level + 1, byParent, expandedIds, result);
        }
    }
}

/** Builds a DFS-ordered flat list of rows with level and parent rollup info. */
function buildGanttTree(issues: Issue[], expandedIds: Set<string>): GanttRow[] {
    const byParent = new Map<string | null, Issue[]>();
    for (const issue of issues) {
        const key = issue.parentId ?? null;
        const bucket = byParent.get(key) ?? [];
        bucket.push(issue);
        byParent.set(key, bucket);
    }
    const result: GanttRow[] = [];
    walkGanttTree(null, 0, byParent, expandedIds, result);
    return result;
}

export const IssueGanttView = ({ issues, projectIdentifier, onRowClick, workspaceSlug = '' }: IssueGanttViewProps): React.ReactElement => {
    // Bug 5: resolve assignee names from workspace members
    const { data: membersData } = useWorkspaceMembers(workspaceSlug);
    const [viewRange, setViewRange] = useState<ViewRange>('month');
    const [viewStart, setViewStart] = useState<Date>(() => computeInitialViewStart(issues));
    const { expandedIssueIds, toggleExpanded } = useIssuesUiStore();

    const totalDays = VIEW_RANGE_DAYS[viewRange];

    const ganttRows = useMemo(
        () => buildGanttTree(issues, expandedIssueIds),
        [issues, expandedIssueIds],
    );

    // "Timeline · Q3 2026" header per design
    const headerLabel = useMemo(() => {
        const q = getQuarter(viewStart);
        const yr = viewStart.getFullYear();
        return `Timeline · Q${q} ${yr}`;
    }, [viewStart]);

    const dateLabels = useMemo(
        () => buildDateLabels(viewStart, totalDays, viewRange),
        [viewStart, totalDays, viewRange],
    );

    // Today's offset within the view (may be outside range — clamp display)
    const todayOffset = useMemo(() => {
        const todayDay = startOfDay(new Date());
        return differenceInDays(todayDay, viewStart);
    }, [viewStart]);

    const todayInView = todayOffset >= 0 && todayOffset < totalDays;
    const todayLeftPct = (todayOffset / totalDays) * 100;
    const todayDayNumber = (() => {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now.getTime() - start.getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    })();

    function navigate(direction: 'prev' | 'next'): void {
        setViewStart((prev) => addDays(prev, direction === 'next' ? totalDays : -totalDays));
    }

    function goToToday(): void {
        const todayDay = startOfDay(new Date());
        setViewStart(addDays(todayDay, -Math.floor(totalDays / 2)));
    }

    const minColWidth = viewRange === 'day' ? 60 : 28;

    return (
        <div className="border border-[var(--neutral-300)] rounded-lg overflow-hidden animate-fade-in">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--neutral-300)] bg-[var(--neutral-100)]">
                {/* Header label: "Timeline · Q3 2026" */}
                <span className="text-[13px] font-semibold text-[var(--neutral-1200)] tracking-[-0.01em]">
                    {headerLabel}
                </span>

                <div className="flex items-center gap-2">
                    {/* 4-level zoom toggle: Día | Semana | Mes | Q */}
                    <div className="flex items-center border border-[var(--neutral-300)] rounded-md overflow-hidden">
                        {(['day', 'week', 'month', 'quarter'] as const).map((range) => (
                            <button
                                key={range}
                                type="button"
                                onClick={() => setViewRange(range)}
                                className={cn(
                                    'px-3 py-1 text-[11px] font-medium transition-colors',
                                    viewRange === range
                                        ? 'bg-[var(--neutral-1200)] text-white'
                                        : 'text-[var(--neutral-600)] hover:text-[var(--neutral-1200)] hover:bg-[var(--neutral-200)]',
                                )}
                            >
                                {VIEW_RANGE_LABELS[range]}
                            </button>
                        ))}
                    </div>

                    {/* Today button */}
                    <button
                        type="button"
                        onClick={goToToday}
                        className="text-[11.5px] font-medium text-[var(--neutral-700)] hover:text-[var(--neutral-1200)] border border-[var(--neutral-300)] rounded px-2.5 py-1 hover:bg-[var(--neutral-200)] transition-colors"
                    >
                        Hoy
                    </button>

                    {/* Navigation */}
                    <button
                        type="button"
                        aria-label="Período anterior"
                        onClick={() => navigate('prev')}
                        className="p-1 rounded text-[var(--neutral-600)] hover:text-[var(--neutral-1200)] hover:bg-[var(--neutral-200)] transition-colors"
                    >
                        <ChevronLeft size={15} />
                    </button>
                    <button
                        type="button"
                        aria-label="Período siguiente"
                        onClick={() => navigate('next')}
                        className="p-1 rounded text-[var(--neutral-600)] hover:text-[var(--neutral-1200)] hover:bg-[var(--neutral-200)] transition-colors"
                    >
                        <ChevronRight size={15} />
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className="flex overflow-hidden">
                {/* Left panel — issue name + assignee */}
                <div className="w-64 flex-shrink-0 border-r border-[var(--neutral-300)] overflow-y-auto">
                    {/* Column header */}
                    <div className="h-8 border-b border-[var(--neutral-300)] bg-[var(--neutral-100)] flex items-center">
                        <span className="px-3 text-[10px] font-mono text-[var(--neutral-500)] uppercase tracking-[0.08em] flex-1">
                            Issue
                        </span>
                        <span className="px-3 text-[10px] font-mono text-[var(--neutral-500)] uppercase tracking-[0.08em] w-12 shrink-0 text-center">
                            Asig.
                        </span>
                    </div>

                    {ganttRows.length === 0 ? (
                        <div className="h-12 flex items-center px-3">
                            <span className="text-xs text-[var(--neutral-500)]">Sin issues</span>
                        </div>
                    ) : (
                        ganttRows.map(({ issue, level }) => {
                            const hasChildren = issues.some((i) => i.parentId === issue.id);
                            const isExpanded = expandedIssueIds.has(issue.id);
                            return (
                                <div
                                    key={issue.id}
                                    className="w-full h-12 flex items-center border-b border-[var(--neutral-300)] last:border-b-0 hover:bg-[var(--neutral-100)] transition-colors"
                                >
                                    {/* Indent + expand toggle */}
                                    <div
                                        className="flex items-center"
                                        style={{ paddingLeft: `${8 + level * 16}px` }}
                                    >
                                        {hasChildren ? (
                                            <button
                                                type="button"
                                                onClick={() => toggleExpanded(issue.id)}
                                                aria-label={isExpanded ? 'Colapsar' : 'Expandir'}
                                                aria-expanded={isExpanded}
                                                className="w-4 h-4 flex items-center justify-center text-[var(--neutral-600)] hover:text-[var(--neutral-1200)] transition-colors shrink-0"
                                            >
                                                {isExpanded ? (
                                                    <ChevronDown size={12} aria-hidden="true" />
                                                ) : (
                                                    <ChevronRight size={12} aria-hidden="true" />
                                                )}
                                            </button>
                                        ) : (
                                            <span className="w-4 shrink-0" />
                                        )}
                                    </div>
                                    {/* Issue ID + title */}
                                    <button
                                        type="button"
                                        onClick={() => onRowClick(issue.id)}
                                        className="flex items-center gap-2 flex-1 min-w-0 text-left h-full"
                                    >
                                        <StatePip
                                            state={toStatePipState(issue.stateGroup)}
                                            size={14}
                                        />
                                        <span className="text-[10px] font-mono text-[var(--neutral-500)] shrink-0">
                                            {projectIdentifier ?? 'ISS'}-{issue.sequenceId}
                                        </span>
                                        <span className="text-[12px] text-[var(--neutral-900)] truncate flex-1">
                                            {issue.title}
                                        </span>
                                    </button>
                                    {/* Bug 5: Assignee avatar from assigneeIds + workspace members */}
                                    <div className="px-3 w-12 shrink-0 flex items-center justify-center">
                                        {issue.assigneeIds.length > 0 ? (() => {
                                            const firstId = issue.assigneeIds[0];
                                            const member = membersData?.find((m) => m.userId === firstId);
                                            const label = member ? (member.displayName ?? member.email) : firstId ?? '';
                                            return (
                                                <span
                                                    role="img"
                                                    aria-label={`Asignado a ${label}`}
                                                    title={label}
                                                    className="w-[22px] h-[22px] rounded-full bg-[var(--brand-700)] flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                                                >
                                                    {member?.avatarUrl ? (
                                                        <img
                                                            src={member.avatarUrl}
                                                            alt={label}
                                                            className="w-full h-full rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        getInitialsFromName(label)
                                                    )}
                                                </span>
                                            );
                                        })() : (
                                            <span
                                                className="w-[22px] h-[22px] rounded-full border border-dashed border-[var(--neutral-400)] shrink-0"
                                                aria-hidden="true"
                                            />
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Right panel — timeline */}
                <div className="flex-1 overflow-x-auto">
                    {/* Date header */}
                    <div
                        className="relative h-8 border-b border-[var(--neutral-300)] bg-[var(--neutral-100)]"
                        style={{ minWidth: `${totalDays * minColWidth}px` }}
                    >
                        {dateLabels.map(({ label, offsetDays }) => (
                            <span
                                key={`${label}-${offsetDays}`}
                                className="absolute top-1/2 -translate-y-1/2 text-[10px] font-mono text-[var(--neutral-500)] whitespace-nowrap"
                                style={{ left: `${(offsetDays / totalDays) * 100}%`, paddingLeft: '4px' }}
                            >
                                {label}
                            </span>
                        ))}

                        {/* TODAY marker in header */}
                        {todayInView && (
                            <div
                                className="absolute top-0 bottom-0 flex flex-col items-center pointer-events-none"
                                style={{ left: `${todayLeftPct}%` }}
                                aria-hidden="true"
                            >
                                <div className="w-px h-full bg-[var(--terra)] opacity-80" />
                            </div>
                        )}
                    </div>

                    {/* Issue rows — relative container for today vertical line */}
                    <div className="relative" style={{ minWidth: `${totalDays * minColWidth}px` }}>
                        {/* TODAY vertical line crossing all rows */}
                        {todayInView && (
                            <div
                                className="absolute top-0 bottom-0 w-px bg-[var(--terra)] pointer-events-none"
                                style={{ left: `${todayLeftPct}%`, zIndex: 5 }}
                                aria-hidden="true"
                            />
                        )}

                        {ganttRows.length === 0 ? (
                            <div className="h-12" />
                        ) : (
                            ganttRows.map(({ issue, isRollup, rollupStart, rollupEnd }) => {
                                // If it's a rollup parent (no own dates), synthesise a virtual issue for bar computation
                                const barIssue: Issue = isRollup && rollupStart && rollupEnd
                                    ? {
                                        ...issue,
                                        startDate: rollupStart.toISOString().slice(0, 10),
                                        dueDate: rollupEnd.toISOString().slice(0, 10),
                                    }
                                    : issue;

                                const bar = computeBarConfig(barIssue, viewStart, totalDays);

                                return (
                                    <div
                                        key={issue.id}
                                        className="relative h-12 border-b border-[var(--neutral-300)] last:border-b-0 hover:bg-[var(--neutral-100)] transition-colors"
                                    >
                                        {/* Grid lines */}
                                        {dateLabels.map(({ label, offsetDays }) => (
                                            <div
                                                key={`grid-${label}-${offsetDays}`}
                                                className="absolute top-0 bottom-0 border-l border-[var(--neutral-300)] opacity-50"
                                                style={{ left: `${(offsetDays / totalDays) * 100}%` }}
                                                aria-hidden="true"
                                            />
                                        ))}

                                        {/* No-date fallback */}
                                        {bar.hasNoDate && (
                                            <div className="absolute inset-0 flex items-center px-3">
                                                <span className="text-[10px] text-[var(--neutral-500)] italic">
                                                    sin fechas
                                                </span>
                                            </div>
                                        )}

                                        {/* Bar — rollup bars get translucent + border style */}
                                        {!bar.hasNoDate && !bar.isDiamond && bar.widthPct > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => onRowClick(issue.id)}
                                                title={issue.title}
                                                className={cn(
                                                    'absolute top-1/2 -translate-y-1/2 h-[6px] rounded-full transition-opacity cursor-pointer',
                                                    isRollup
                                                        ? 'opacity-40 hover:opacity-60 border border-current'
                                                        : 'opacity-80 hover:opacity-100',
                                                )}
                                                style={{
                                                    left: `${bar.leftPct}%`,
                                                    width: `${bar.widthPct}%`,
                                                    minWidth: '8px',
                                                    backgroundColor: bar.barColor,
                                                    zIndex: 4,
                                                }}
                                            />
                                        )}

                                        {/* Diamond marker */}
                                        {!bar.hasNoDate && bar.isDiamond && (
                                            <button
                                                type="button"
                                                onClick={() => onRowClick(issue.id)}
                                                title={issue.title}
                                                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rotate-45 opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                                                style={{
                                                    left: `calc(${bar.leftPct}% - 6px)`,
                                                    backgroundColor: bar.barColor,
                                                    zIndex: 4,
                                                }}
                                            />
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Today label footer — "HOY · DÍA N" */}
            {todayInView && (
                <div className="flex items-center gap-2 px-4 py-1.5 border-t border-[var(--neutral-300)] bg-[var(--neutral-100)]">
                    <span className="w-2 h-2 rounded-full bg-[var(--terra)] shrink-0" aria-hidden="true" />
                    <span className="text-[10px] font-mono font-semibold text-[var(--terra)] uppercase tracking-[0.1em]">
                        HOY · DÍA {todayDayNumber}
                    </span>
                </div>
            )}
        </div>
    );
};
