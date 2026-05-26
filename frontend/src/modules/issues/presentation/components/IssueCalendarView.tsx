import type React from 'react';
import { useState, useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight, CornerDownRight } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { parseDateOnly } from '@/shared/lib/date';
import type { Issue } from '../../domain/types';

interface IssueCalendarViewProps {
    issues: Issue[];
    onIssueClick: (issueId: string) => void;
    projectIdentifier?: string;
}

const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

/** Max issue rows shown per cell before "+N más" overflow chip */
const MAX_VISIBLE_PER_CELL = 2;

function startOfMonth(year: number, month: number): Date {
    return new Date(year, month, 1);
}

function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
}

function isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();
}


function isToday(date: Date): boolean {
    return isSameDay(date, new Date());
}

function mondayBasedDow(date: Date): number {
    const dow = date.getDay();
    return dow === 0 ? 6 : dow - 1;
}

/** Returns true if the issue should appear on the given calendar date. */
function issueMatchesDate(issue: Issue, date: Date): boolean {
    if (issue.dueDate) {
        const d = parseDateOnly(issue.dueDate);
        if (d && isSameDay(d, date)) return true;
    }
    if (issue.startDate && !issue.dueDate) {
        const d = parseDateOnly(issue.startDate);
        if (d && isSameDay(d, date)) return true;
    }
    return false;
}

/** Builds the CalendarDay array for the given year/month using the provided issues. */
function buildCalendarDays(year: number, month: number, issues: Issue[]): CalendarDay[] {
    const firstDay = startOfMonth(year, month);
    const daysInMonth = getDaysInMonth(year, month);
    const startOffset = mondayBasedDow(firstDay);

    const days: CalendarDay[] = [];

    for (let i = startOffset - 1; i >= 0; i--) {
        const d = new Date(year, month, -i);
        days.push({ date: d, isCurrentMonth: false, issues: [] });
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month, d);
        const dayIssues = issues.filter((issue) => issueMatchesDate(issue, date));
        days.push({ date, isCurrentMonth: true, issues: dayIssues });
    }

    const totalCells = Math.ceil(days.length / 7) * 7;
    let nextDay = 1;
    while (days.length < totalCells) {
        days.push({ date: new Date(year, month + 1, nextDay++), isCurrentMonth: false, issues: [] });
    }

    return days;
}

interface CalendarDay {
    date: Date;
    isCurrentMonth: boolean;
    issues: Issue[];
}

// ── Issue pill used in cell and in popover ──
interface IssuePillProps {
    issue: Issue;
    onClick: () => void;
    className?: string;
    projectIdentifier?: string;
    /** All issues in the current view — used to resolve parent title for tooltip */
    allIssues?: Issue[];
}

function IssuePill({ issue, onClick, className, projectIdentifier, allIssues }: IssuePillProps): React.ReactElement {
    // Bug 13: use projectIdentifier prop instead of hardcoded 'ISS'
    const identifier = `${projectIdentifier ?? 'ISS'}-${issue.sequenceId}`;
    const borderColor = issue.stateColor || 'var(--neutral-400)';
    const isSubIssue = !!issue.parentId;

    const parentIssue = isSubIssue && allIssues
        ? allIssues.find((i) => i.id === issue.parentId)
        : undefined;

    const tooltipText = parentIssue
        ? `${projectIdentifier ?? 'ISS'}-${parentIssue.sequenceId} ${parentIssue.title} › ${issue.title}`
        : issue.title;

    return (
        <button
            key={issue.id}
            type="button"
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className={cn(
                'w-full text-left px-1.5 pl-1.5 py-[3px] rounded truncate transition-opacity hover:opacity-80 flex items-center gap-0',
                'bg-[var(--neutral-200)] border border-[var(--neutral-300)] hover:bg-[var(--neutral-300)]',
                className,
            )}
            style={{ borderLeft: `2px solid ${borderColor}` }}
            title={tooltipText}
        >
            {isSubIssue && (
                <CornerDownRight
                    size={9}
                    className="mr-1 shrink-0 text-[var(--neutral-500)]"
                    aria-hidden="true"
                />
            )}
            <span className="font-mono text-[10px] text-[var(--neutral-600)] mr-1 shrink-0">
                {identifier}
            </span>
            <span className="text-[11px] text-[var(--neutral-1200)] truncate">
                {issue.title}
            </span>
        </button>
    );
}

// ── Calendar cell — independent card ──
interface CalendarCellProps {
    day: CalendarDay;
    onIssueClick: (id: string) => void;
    projectIdentifier?: string;
    allIssues: Issue[];
}

function CalendarCell({ day, onIssueClick, projectIdentifier, allIssues }: CalendarCellProps): React.ReactElement {
    const overflowCount = day.issues.length - MAX_VISIBLE_PER_CELL;
    const hasOverflow = overflowCount > 0;
    const triggerRef = useRef<HTMLButtonElement>(null);
    const todayCell = isToday(day.date);

    return (
        <div
            className={cn(
                'flex flex-col gap-1 min-h-[120px] p-3 rounded-md border',
                todayCell
                    ? 'bg-[rgba(217,119,87,0.06)] border-[var(--terra)]/30'
                    : day.isCurrentMonth
                        ? 'bg-white border-[var(--neutral-300)]'
                        : 'bg-white border-[var(--neutral-200)] opacity-60',
            )}
        >
            {/* Day number + issue count */}
            <div className="flex items-center justify-between shrink-0">
                <span
                    className={cn(
                        'text-[16px] font-medium tracking-tight w-[26px] h-[26px] flex items-center justify-center rounded-full',
                        todayCell
                            ? 'bg-[var(--terra)] text-white'
                            : day.isCurrentMonth
                                ? 'text-[var(--neutral-600)]'
                                : 'text-[var(--neutral-500)]',
                    )}
                >
                    {day.date.getDate()}
                </span>
                {day.issues.length > 0 && (
                    <span className="font-mono text-[10px] text-[var(--neutral-600)]">
                        {day.issues.length}
                    </span>
                )}
            </div>

            {/* Issue pills: up to MAX_VISIBLE_PER_CELL */}
            {day.issues.slice(0, MAX_VISIBLE_PER_CELL).map((issue) => (
                <IssuePill
                    key={issue.id}
                    issue={issue}
                    onClick={() => onIssueClick(issue.id)}
                    projectIdentifier={projectIdentifier}
                    allIssues={allIssues}
                />
            ))}

            {/* Overflow chip with popover listing all issues for the day */}
            {hasOverflow && (
                <Popover>
                    <PopoverTrigger asChild>
                        <button
                            ref={triggerRef}
                            type="button"
                            className="text-[10px] text-[var(--neutral-600)] hover:text-[var(--neutral-1200)] px-1 py-0.5 rounded hover:bg-[var(--neutral-200)] transition-colors text-left w-full"
                        >
                            +{overflowCount} más
                        </button>
                    </PopoverTrigger>
                    <PopoverContent
                        className="w-64 p-2 bg-white border border-[var(--neutral-300)] shadow-lg rounded-lg"
                        side="right"
                        align="start"
                    >
                        <p className="text-[10px] font-mono text-[var(--neutral-600)] uppercase tracking-[0.08em] mb-2 px-1">
                            {day.date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                            {' · '}{day.issues.length} issues
                        </p>
                        <div className="flex flex-col gap-1">
                            {day.issues.map((issue) => (
                                <IssuePill
                                    key={issue.id}
                                    issue={issue}
                                    onClick={() => onIssueClick(issue.id)}
                                    className="text-[11px]"
                                    projectIdentifier={projectIdentifier}
                                    allIssues={allIssues}
                                />
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>
            )}
        </div>
    );
}

export const IssueCalendarView = ({
    issues,
    onIssueClick,
    projectIdentifier,
}: IssueCalendarViewProps): React.ReactElement => {
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());

    const calendarDays = useMemo<CalendarDay[]>(
        () => buildCalendarDays(year, month, issues),
        [year, month, issues],
    );

    const prevMonth = (): void => {
        if (month === 0) { setMonth(11); setYear((y) => y - 1); }
        else setMonth((m) => m - 1);
    };

    const nextMonth = (): void => {
        if (month === 11) { setMonth(0); setYear((y) => y + 1); }
        else setMonth((m) => m + 1);
    };

    const goToToday = (): void => {
        setYear(today.getFullYear());
        setMonth(today.getMonth());
    };

    return (
        <div className="w-full animate-fade-in">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2.5 mb-3 border border-[var(--neutral-300)] rounded-lg bg-[var(--neutral-100)]">
                {/* Navigation: prev / title / next */}
                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={prevMonth}
                        aria-label="Mes anterior"
                        className="p-1 rounded hover:bg-[var(--neutral-200)] text-[var(--neutral-600)] hover:text-[var(--neutral-1200)] transition-colors"
                    >
                        <ChevronLeft size={15} />
                    </button>
                    {/* Month name + year in serif italic per design */}
                    <h2 className="text-[15px] font-semibold text-[var(--neutral-1200)] w-44 text-center select-none">
                        <span className="serif">{MONTH_NAMES[month]}</span>
                        {' '}
                        <span className="serif text-[var(--neutral-500)]">{year}</span>
                    </h2>
                    <button
                        type="button"
                        onClick={nextMonth}
                        aria-label="Mes siguiente"
                        className="p-1 rounded hover:bg-[var(--neutral-200)] text-[var(--neutral-600)] hover:text-[var(--neutral-1200)] transition-colors"
                    >
                        <ChevronRight size={15} />
                    </button>
                </div>

                {/* Right: Hoy button only */}
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={goToToday}
                        className="text-[11.5px] font-medium text-[var(--neutral-700)] hover:text-[var(--neutral-1200)] border border-[var(--neutral-300)] rounded px-2.5 py-1 hover:bg-[var(--neutral-200)] transition-colors"
                    >
                        Hoy
                    </button>
                </div>
            </div>

            {/* Day-of-week headers — no border, just text */}
            <div className="grid grid-cols-7 gap-2 mb-2">
                {DAYS_OF_WEEK.map((d) => (
                    <div
                        key={d}
                        className="font-mono text-[10px] text-[var(--neutral-600)] uppercase tracking-wide text-left px-1"
                    >
                        {d}
                    </div>
                ))}
            </div>

            {/* Calendar grid — independent cards with gap */}
            <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day) => (
                    <CalendarCell
                        key={day.date.toISOString()}
                        day={day}
                        onIssueClick={onIssueClick}
                        projectIdentifier={projectIdentifier}
                        allIssues={issues}
                    />
                ))}
            </div>
        </div>
    );
};
