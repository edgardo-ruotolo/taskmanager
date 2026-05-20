/**
 * Centralized status-color mapping. Until now each surface duplicated its own
 * `STATUS_CLASSES` literal; the inconsistency made it impossible to tweak the
 * palette in one place. Consumers import the mapping they need and call the
 * matching helper to derive a className string.
 */

export type CycleStatus = 'Draft' | 'Started' | 'Completed';
export type ModuleStatus = 'Backlog' | 'InProgress' | 'Paused' | 'Completed' | 'Archived';

/** Canonical Plane-style state groups (lowercased). */
export type StateGroup =
    | 'backlog'
    | 'unstarted'
    | 'started'
    | 'completed'
    | 'cancelled';

export const CYCLE_STATUS_LABELS: Record<CycleStatus, string> = {
    Draft: 'Borrador',
    Started: 'En curso',
    Completed: 'Completado',
};

export const CYCLE_STATUS_CLASSES: Record<CycleStatus, string> = {
    Draft: 'bg-layer-1 text-secondary',
    Started: 'bg-blue-900 text-blue-300',
    Completed: 'bg-green-900 text-green-300',
};

export const MODULE_STATUS_LABELS: Record<ModuleStatus, string> = {
    Backlog: 'Backlog',
    InProgress: 'En progreso',
    Paused: 'Pausado',
    Completed: 'Completado',
    Archived: 'Archivado',
};

export const MODULE_STATUS_CLASSES: Record<ModuleStatus, string> = {
    Backlog: 'bg-layer-1 text-secondary',
    InProgress: 'bg-blue-900 text-blue-300',
    Paused: 'bg-yellow-900 text-yellow-300',
    Completed: 'bg-green-900 text-green-300',
    Archived: 'bg-surface-1 text-placeholder',
};

/** State group colors map to the Atlas semantic token scale. */
export const STATE_GROUP_DOT_CLASSES: Record<StateGroup, string> = {
    backlog: 'bg-[var(--neutral-700)]',
    unstarted: 'bg-[var(--neutral-900)]',
    started: 'bg-[var(--brand-700)]',
    completed: 'bg-[var(--green-700)]',
    cancelled: 'bg-[var(--red-700)]',
};

export const STATE_GROUP_BG_CLASSES: Record<StateGroup, string> = {
    backlog: 'bg-layer-1 text-secondary',
    unstarted: 'bg-layer-2 text-secondary',
    started: 'bg-[var(--brand-100)] text-[var(--brand-900)]',
    completed: 'bg-[var(--green-100)] text-[var(--green-900)]',
    cancelled: 'bg-[var(--red-100)] text-[var(--red-900)]',
};

export function normalizeStateGroup(group?: string | null): StateGroup {
    const lower = group?.toLowerCase() ?? '';
    if (lower === 'unstarted' || lower === 'started' || lower === 'completed' || lower === 'cancelled') {
        return lower;
    }
    return 'backlog';
}

export function getStatusDotClass(group?: string | null): string {
    return STATE_GROUP_DOT_CLASSES[normalizeStateGroup(group)];
}

export function getStatusBgClass(group?: string | null): string {
    return STATE_GROUP_BG_CLASSES[normalizeStateGroup(group)];
}
