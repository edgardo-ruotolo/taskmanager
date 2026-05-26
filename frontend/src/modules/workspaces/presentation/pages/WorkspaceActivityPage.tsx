import type React from 'react';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Activity, Filter, Calendar, ChevronDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useWorkspaceActivity } from '../../application/use-activity';
import { ACTION_LABELS } from '../../domain/activity-types';
import type { WorkspaceActivity } from '../../domain/activity-types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const AI_ACTOR_NAME = 'Atlas IA';

const ENTITY_TYPE_MAP: Record<string, string> = {
    issue_created: 'issue',
    issue_updated: 'issue',
    issue_deleted: 'issue',
    comment_created: 'comment',
    comment_updated: 'comment',
    comment_deleted: 'comment',
    page_created: 'page',
    page_updated: 'page',
    cycle_created: 'cycle',
    cycle_updated: 'cycle',
    module_created: 'module',
    module_updated: 'module',
    member_invited: 'member',
    member_removed: 'member',
    workspace_updated: 'settings',
    project_created: 'settings',
};

type FilterTab =
    | 'all'
    | 'issue'
    | 'comment'
    | 'page'
    | 'cycle'
    | 'member'
    | 'settings';

interface TabDefinition {
    id: FilterTab;
    label: string;
}

const TABS: TabDefinition[] = [
    { id: 'all', label: 'Todo' },
    { id: 'issue', label: 'Issues' },
    { id: 'comment', label: 'Comentarios' },
    { id: 'page', label: 'Páginas' },
    { id: 'cycle', label: 'Ciclos' },
    { id: 'member', label: 'Miembros' },
    { id: 'settings', label: 'Settings' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveEntityType(activity: WorkspaceActivity): string {
    return activity.entityType ?? ENTITY_TYPE_MAP[activity.action] ?? 'other';
}

function isAiActor(name: string): boolean {
    return name.toLowerCase().includes('ia') || name === AI_ACTOR_NAME;
}

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

function countThisWeek(activities: WorkspaceActivity[]): number {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return activities.filter((a) => new Date(a.createdAt).getTime() > weekAgo).length;
}

// ---------------------------------------------------------------------------
// Activity row
// ---------------------------------------------------------------------------

interface ActivityRowProps {
    activity: WorkspaceActivity;
}

function ActivityRow({ activity }: ActivityRowProps): React.ReactElement {
    const isAi = isAiActor(activity.actorName);
    const color = getActorColor(activity.actorName);

    return (
        <div
            className="grid gap-4 py-[10px]"
            style={{ gridTemplateColumns: '24px 1fr 72px' }}
        >
            {/* Avatar */}
            <div
                className="relative z-10 w-[22px] h-[22px] rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0"
                style={{ background: isAi ? 'linear-gradient(135deg, #7c3aed, #4f46e5)' : color }}
                role="img"
                aria-label={activity.actorName}
            >
                {isAi ? '✦' : getInitials(activity.actorName)}
            </div>

            {/* Content */}
            <div>
                <div className="text-[13.5px] leading-[1.55] text-[var(--neutral-700)] tracking-[-0.005em]">
                    <strong className="text-[var(--neutral-1200)] font-medium">
                        {activity.actorName}
                    </strong>
                    {isAi && (
                        <Badge
                            variant="secondary"
                            className="ml-1.5 text-[9px] font-mono px-1.5 py-0 bg-violet-100 text-violet-700 border-0 align-middle"
                        >
                            IA
                        </Badge>
                    )}{' '}
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
                {/* Comment snippet — rendered when action is a comment event */}
                {(activity.action === 'comment_created' || activity.action === 'comment_updated') && activity.newValue && (
                    // TODO(backend): include comment body in activity payload via activity.newValue
                    <p className="mt-1 mono text-[11px] text-[var(--neutral-600)] leading-[1.55] pl-0 line-clamp-2">
                        &ldquo;{activity.newValue}&rdquo;
                    </p>
                )}
            </div>

            {/* Time */}
            <span className="font-mono text-[10.5px] text-[var(--neutral-500)] text-right self-start pt-[1px]">
                {formatRelative(activity.createdAt)}
            </span>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Activity feed
// ---------------------------------------------------------------------------

interface ActivityFeedProps {
    activities: WorkspaceActivity[];
    isLoading: boolean;
}

function ActivityFeed({ activities, isLoading }: ActivityFeedProps): React.ReactElement {
    const grouped = useMemo(() => groupByDay(activities), [activities]);

    if (isLoading) {
        return (
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
        );
    }

    if (activities.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-14 h-14 rounded-lg bg-[var(--neutral-200)] flex items-center justify-center mb-4">
                    <Activity size={24} className="text-[var(--neutral-600)]" aria-hidden="true" />
                </div>
                <h3 className="text-[18px] font-medium text-[var(--neutral-1200)] mb-1">
                    Sin actividad aún
                </h3>
                <p className="text-[13px] text-[var(--neutral-600)] max-w-xs">
                    Las acciones en el workspace aparecerán aquí.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8">
            {grouped.map(([day, dayActivities]) => (
                <div key={day}>
                    <div className="font-mono text-[10.5px] text-[var(--neutral-600)] tracking-[0.15em] uppercase mb-3 pb-2 border-b border-[var(--neutral-400)]">
                        {day}
                    </div>

                    <div className="relative pl-0">
                        <span
                            className="absolute left-[11px] top-[18px] bottom-[18px] w-px bg-[var(--neutral-400)]"
                            aria-hidden="true"
                        />
                        <div className="flex flex-col">
                            {dayActivities.map((activity) => (
                                <ActivityRow key={activity.id} activity={activity} />
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Pill tabs
// ---------------------------------------------------------------------------

interface PillTabsProps {
    tabs: TabDefinition[];
    activeTab: FilterTab;
    countsByType: Record<FilterTab, number>;
    isLoading: boolean;
    onTabChange: (tab: FilterTab) => void;
}

function PillTabs({ tabs, activeTab, countsByType, isLoading, onTabChange }: PillTabsProps): React.ReactElement {
    return (
        <div className="flex items-center gap-2 flex-wrap" role="tablist" aria-label="Filtrar actividad por tipo">
            {tabs.map((tab) => {
                const isActive = tab.id === activeTab;
                const count = isLoading ? null : countsByType[tab.id];
                return (
                    <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => onTabChange(tab.id)}
                        className={cn(
                            'inline-flex items-center rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors duration-150',
                            'border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-500)]',
                            isActive
                                ? 'bg-[var(--neutral-1200)] text-white border-transparent'
                                : 'bg-transparent text-[var(--neutral-900)] border-[var(--neutral-300)] hover:border-[var(--neutral-500)] hover:text-[var(--neutral-1200)]',
                        )}
                    >
                        {tab.label}
                        {count !== null && (
                            <span
                                className={cn(
                                    'ml-1.5 font-mono text-[11px] tabular-nums',
                                    isActive ? 'text-white/70' : 'text-[var(--neutral-600)]',
                                )}
                                aria-hidden="true"
                            >
                                {count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export const WorkspaceActivityPage = (): React.ReactElement => {
    const { workspaceSlug = '' } = useParams<{ workspaceSlug: string }>();
    const { data, isLoading } = useWorkspaceActivity(workspaceSlug);
    const [activeTab, setActiveTab] = useState<FilterTab>('all');

    const activities = data?.items ?? [];
    const weekCount = useMemo(() => countThisWeek(activities), [activities]);

    // Per-type counts
    // TODO(backend): add entityType field to WorkspaceActivity responses for accurate tab counts
    const countsByType = useMemo<Record<FilterTab, number>>(() => {
        const counts: Record<FilterTab, number> = {
            all: activities.length,
            issue: 0,
            comment: 0,
            page: 0,
            cycle: 0,
            member: 0,
            settings: 0,
        };
        for (const a of activities) {
            const t = resolveEntityType(a) as FilterTab;
            if (t in counts && t !== 'all') {
                counts[t]++;
            }
        }
        return counts;
    }, [activities]);

    const filteredActivities = useMemo(() => {
        if (activeTab === 'all') return activities;
        return activities.filter((a) => resolveEntityType(a) === activeTab);
    }, [activities, activeTab]);

    return (
        <div className="h-full overflow-y-auto">
            <div className="w-full px-10 py-8">

                {/* ── Sub-header ───────────────────────────────────────────── */}
                <div className="mb-6 flex items-center justify-between gap-4">
                    {/* Left: icon + title */}
                    <div className="flex items-center gap-2">
                        <Activity size={16} className="text-[var(--neutral-600)] shrink-0" aria-hidden="true" />
                        <span className="text-[13px] font-medium text-[var(--neutral-1200)]">
                            Actividad del workspace
                        </span>
                        {!isLoading && (
                            <span className="font-mono text-[11px] text-[var(--neutral-500)] ml-1">
                                · {weekCount} eventos esta semana
                            </span>
                        )}
                    </div>

                    {/* Right: action buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1.5 text-[12px] font-medium text-[var(--neutral-700)] hover:text-[var(--neutral-1200)]"
                            aria-label="Abrir panel de filtros"
                        >
                            <Filter size={13} aria-hidden="true" />
                            Filtros
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1.5 text-[12px] font-medium text-[var(--neutral-700)] hover:text-[var(--neutral-1200)]"
                            aria-label="Seleccionar rango de fechas"
                        >
                            <Calendar size={13} aria-hidden="true" />
                            Últimos 7 días
                            <ChevronDown size={12} aria-hidden="true" />
                        </Button>
                    </div>
                </div>

                {/* ── Editorial heading ───────────────────────────────────── */}
                <h1 className="tightest text-[64px] font-medium text-[var(--neutral-1200)] mt-8 mb-6">
                    Lo que pasó.
                </h1>

                {/* ── Pill tabs ────────────────────────────────────────────── */}
                <div className="mb-6">
                    <PillTabs
                        tabs={TABS}
                        activeTab={activeTab}
                        countsByType={countsByType}
                        isLoading={isLoading}
                        onTabChange={setActiveTab}
                    />
                </div>

                {/* ── Feed ────────────────────────────────────────────────── */}
                <ActivityFeed
                    activities={filteredActivities}
                    isLoading={isLoading}
                />

            </div>
        </div>
    );
};
