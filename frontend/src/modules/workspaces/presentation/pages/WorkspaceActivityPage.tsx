import type React from 'react';
import { useParams } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Eyebrow } from '@/components/ui/eyebrow';
import { useWorkspaceActivity } from '../../application/use-activity';
import { ACTION_LABELS } from '../../domain/activity-types';

const ACTOR_COLORS = [
    'var(--brand-700)',
    'var(--green-700)',
    'var(--amber-700)',
    '#6b6298',
    'var(--neutral-1200)',
] as const;

function getActorColor(name: string): string {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return ACTOR_COLORS[hash % ACTOR_COLORS.length] ?? 'var(--brand-700)';
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0] ?? '')
        .join('')
        .toUpperCase();
}

function formatRelative(dateStr: string): string {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return 'Justo ahora';
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
    if (diff < 172800) return 'Ayer';
    return new Date(dateStr).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

function formatDayHeader(dateStr: string): string {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return `Hoy · ${date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}`;
    }
    if (date.toDateString() === yesterday.toDateString()) {
        return `Ayer · ${date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}`;
    }
    return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
}

function groupByDay<T extends { createdAt: string }>(items: T[]): [string, T[]][] {
    const map = new Map<string, T[]>();
    for (const item of items) {
        const key = formatDayHeader(item.createdAt);
        const existing = map.get(key);
        if (existing) {
            existing.push(item);
        } else {
            map.set(key, [item]);
        }
    }
    return Array.from(map.entries());
}

export const WorkspaceActivityPage = (): React.ReactElement => {
    const { workspaceSlug = '' } = useParams<{ workspaceSlug: string }>();
    const { data, isLoading } = useWorkspaceActivity(workspaceSlug);

    const activities = data?.items ?? [];
    const grouped = groupByDay(activities);

    return (
        <div className="h-full overflow-y-auto">
            <div className="mx-auto max-w-3xl px-10 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Eyebrow>
                        Feed cronológico · {isLoading ? '…' : `${activities.length} eventos`}
                    </Eyebrow>
                    <h1 className="mt-2 text-[48px] font-medium tracking-[-0.045em] leading-[0.95] text-[var(--neutral-1200)]">
                        Lo que pasó.
                    </h1>
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="space-y-4">
                        {(['a0', 'a1', 'a2', 'a3', 'a4'] as const).map((k) => (
                            <div key={k} className="flex gap-3">
                                <Skeleton className="w-[22px] h-[22px] rounded-full bg-[var(--neutral-200)] shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-3 w-2/3 bg-[var(--neutral-200)]" />
                                    <Skeleton className="h-3 w-1/3 bg-[var(--neutral-200)]" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty */}
                {!isLoading && activities.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-14 h-14 rounded-lg bg-[var(--neutral-200)] flex items-center justify-center mb-4">
                            <Activity size={24} className="text-[var(--neutral-600)]" />
                        </div>
                        <h3 className="text-[18px] font-medium text-[var(--neutral-1200)] mb-1">Sin actividad aún</h3>
                        <p className="text-[13px] text-[var(--neutral-600)] max-w-xs">
                            Las acciones en el workspace aparecerán aquí.
                        </p>
                    </div>
                )}

                {/* Grouped activity feed */}
                {!isLoading && grouped.length > 0 && (
                    <div className="flex flex-col gap-8">
                        {grouped.map(([day, dayActivities]) => (
                            <div key={day}>
                                {/* Day header */}
                                <div className="font-mono text-[10.5px] text-[var(--neutral-600)] tracking-[0.15em] uppercase mb-3 pb-2 border-b border-[var(--neutral-400)]">
                                    {day}
                                </div>

                                {/* Events */}
                                <div className="relative pl-0">
                                    <span
                                        className="absolute left-[11px] top-[18px] bottom-[18px] w-px bg-[var(--neutral-400)]"
                                        aria-hidden="true"
                                    />
                                    <div className="flex flex-col">
                                        {dayActivities.map((activity) => {
                                            const color = getActorColor(activity.actorName);
                                            return (
                                                <div
                                                    key={activity.id}
                                                    className="grid gap-4 py-[10px]"
                                                    style={{ gridTemplateColumns: '24px 1fr 60px' }}
                                                >
                                                    {/* Avatar */}
                                                    <div
                                                        className="relative z-10 w-[22px] h-[22px] rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0"
                                                        style={{ background: color }}
                                                        aria-hidden="true"
                                                    >
                                                        {getInitials(activity.actorName)}
                                                    </div>

                                                    {/* Content */}
                                                    <div>
                                                        <div className="text-[13.5px] leading-[1.55] text-[var(--neutral-700)] tracking-[-0.005em]">
                                                            <strong className="text-[var(--neutral-1200)] font-medium">
                                                                {activity.actorName}
                                                            </strong>
                                                            {' '}
                                                            <span>
                                                                {ACTION_LABELS[activity.action] ?? activity.action}
                                                            </span>
                                                            {activity.entityTitle && (
                                                                <>
                                                                    {' '}
                                                                    <span className="font-mono bg-[var(--neutral-200)] px-[6px] py-[1px] rounded-[3px] text-[11px] font-medium text-[var(--neutral-1200)]">
                                                                        {activity.entityTitle}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Time */}
                                                    <span className="font-mono text-[10.5px] text-[var(--neutral-500)] text-right">
                                                        {formatRelative(activity.createdAt)}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
