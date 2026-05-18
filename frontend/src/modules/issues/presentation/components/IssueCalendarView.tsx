import type React from 'react';
import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PRIORITY_COLORS } from '../../domain/types';
import type { Issue } from '../../domain/types';

interface IssueCalendarViewProps {
    issues: Issue[];
    onIssueClick: (issueId: string) => void;
}

const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

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

interface CalendarDay {
    date: Date;
    isCurrentMonth: boolean;
    issues: Issue[];
}

export const IssueCalendarView = ({
    issues,
    onIssueClick,
}: IssueCalendarViewProps): React.ReactElement => {
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());

    const calendarDays = useMemo<CalendarDay[]>(() => {
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
            const dayIssues = issues.filter((issue) => {
                const dueDate = issue.dueDate ? new Date(issue.dueDate) : null;
                return dueDate && isSameDay(dueDate, date);
            });
            days.push({ date, isCurrentMonth: true, issues: dayIssues });
        }

        const totalCells = Math.ceil(days.length / 7) * 7;
        let nextDay = 1;
        while (days.length < totalCells) {
            days.push({ date: new Date(year, month + 1, nextDay++), isCurrentMonth: false, issues: [] });
        }

        return days;
    }, [year, month, issues]);

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

    const weeks = useMemo(() => {
        const result: CalendarDay[][] = [];
        for (let i = 0; i < calendarDays.length; i += 7) {
            result.push(calendarDays.slice(i, i + 7));
        }
        return result;
    }, [calendarDays]);

    return (
        <div className="border border-subtle rounded-lg overflow-hidden animate-fade-in">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-subtle bg-surface-1">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={prevMonth}
                        aria-label="Mes anterior"
                        className="p-1 rounded hover:bg-layer-2 text-tertiary hover:text-secondary transition-colors"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <h2 className="text-sm font-semibold text-primary w-36 text-center">
                        {MONTH_NAMES[month]} {year}
                    </h2>
                    <button
                        type="button"
                        onClick={nextMonth}
                        aria-label="Mes siguiente"
                        className="p-1 rounded hover:bg-layer-2 text-tertiary hover:text-secondary transition-colors"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
                <button
                    type="button"
                    onClick={goToToday}
                    className="text-xs text-tertiary hover:text-secondary border border-subtle rounded px-2 py-1 hover:bg-layer-2 transition-colors"
                >
                    Hoy
                </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-subtle bg-surface-1">
                {DAYS_OF_WEEK.map((d) => (
                    <div
                        key={d}
                        className="px-2 py-1.5 text-center text-xs font-medium text-placeholder"
                    >
                        {d}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="bg-canvas">
                {weeks.map((week) => (
                    <div
                        key={week[0].date.toISOString()}
                        className="grid grid-cols-7 border-b border-subtle last:border-b-0"
                        style={{ minHeight: '96px' }}
                    >
                        {week.map((day) => (
                            <div
                                key={day.date.toISOString()}
                                className={cn(
                                    'px-2 py-1.5 border-r border-subtle last:border-r-0 flex flex-col gap-1',
                                    !day.isCurrentMonth && 'opacity-40',
                                )}
                            >
                                <span
                                    className={cn(
                                        'text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full',
                                        isToday(day.date)
                                            ? 'bg-accent-primary text-on-color'
                                            : 'text-tertiary',
                                    )}
                                >
                                    {day.date.getDate()}
                                </span>

                                {day.issues.slice(0, 3).map((issue) => (
                                    <button
                                        key={issue.id}
                                        type="button"
                                        onClick={() => onIssueClick(issue.id)}
                                        className={cn(
                                            'w-full text-left text-xs px-1.5 py-0.5 rounded truncate transition-opacity hover:opacity-80',
                                            'bg-surface-2 border border-subtle',
                                        )}
                                        title={issue.title}
                                    >
                                        <span className={cn('mr-1', PRIORITY_COLORS[issue.priority])}>
                                            ●
                                        </span>
                                        <span className="text-secondary">{issue.title}</span>
                                    </button>
                                ))}

                                {day.issues.length > 3 && (
                                    <span className="text-xs text-placeholder px-1">
                                        +{day.issues.length - 3} más
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};
