import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type AnalyticsDateField = 'createdAt' | 'dueDate' | 'completedAt';

export type AnalyticsStateCategory =
    | 'Backlog'
    | 'Unstarted'
    | 'Started'
    | 'Completed'
    | 'Cancelled';

export type AnalyticsPriority = 'Urgent' | 'High' | 'Medium' | 'Low' | 'None';

export interface AnalyticsFiltersState {
    userIds: string[];
    labelIds: string[];
    projectIds: string[];
    stateIds: string[];
    stateCategories: AnalyticsStateCategory[];
    priorities: AnalyticsPriority[];
    dateFrom: string | null;
    dateTo: string | null;
    dateField: AnalyticsDateField;
    cycleId: string | null;
    includeArchived: boolean;
}

interface AnalyticsFiltersStore extends AnalyticsFiltersState {
    setFilters: (patch: Partial<AnalyticsFiltersState>) => void;
    resetFilters: () => void;
    hasActiveFilters: () => boolean;
    countActiveFilters: () => number;
}

export const defaultFilters: AnalyticsFiltersState = {
    userIds: [],
    labelIds: [],
    projectIds: [],
    stateIds: [],
    stateCategories: [],
    priorities: [],
    dateFrom: null,
    dateTo: null,
    dateField: 'createdAt',
    cycleId: null,
    includeArchived: false,
};

const STORAGE_PREFIX = 'tm-analytics-filters';

/**
 * Builds a workspace-scoped Zustand store. Each workspaceSlug gets an
 * independent persisted instance so switching workspaces never leaks filters.
 */
const storeCache = new Map<string, ReturnType<typeof createAnalyticsFiltersStore>>();

function createAnalyticsFiltersStore(workspaceSlug: string) {
    return create<AnalyticsFiltersStore>()(
        persist(
            (set, get) => ({
                ...defaultFilters,
                setFilters: (patch) => set((state) => ({ ...state, ...patch })),
                resetFilters: () => set({ ...defaultFilters }),
                hasActiveFilters: () => {
                    const s = get();
                    return (
                        s.userIds.length > 0 ||
                        s.labelIds.length > 0 ||
                        s.projectIds.length > 0 ||
                        s.stateIds.length > 0 ||
                        s.stateCategories.length > 0 ||
                        s.priorities.length > 0 ||
                        !!s.dateFrom ||
                        !!s.dateTo ||
                        !!s.cycleId ||
                        s.includeArchived
                    );
                },
                countActiveFilters: () => {
                    const s = get();
                    let count = 0;
                    if (s.userIds.length > 0) count += 1;
                    if (s.labelIds.length > 0) count += 1;
                    if (s.projectIds.length > 0) count += 1;
                    if (s.stateIds.length > 0) count += 1;
                    if (s.stateCategories.length > 0) count += 1;
                    if (s.priorities.length > 0) count += 1;
                    if (s.dateFrom || s.dateTo) count += 1;
                    if (s.cycleId) count += 1;
                    if (s.includeArchived) count += 1;
                    return count;
                },
            }),
            {
                name: `${STORAGE_PREFIX}-${workspaceSlug}`,
                storage: createJSONStorage(() => localStorage),
                partialize: (state) => ({
                    userIds: state.userIds,
                    labelIds: state.labelIds,
                    projectIds: state.projectIds,
                    stateIds: state.stateIds,
                    stateCategories: state.stateCategories,
                    priorities: state.priorities,
                    dateFrom: state.dateFrom,
                    dateTo: state.dateTo,
                    dateField: state.dateField,
                    cycleId: state.cycleId,
                    includeArchived: state.includeArchived,
                }),
            },
        ),
    );
}

export function useAnalyticsFiltersStore(workspaceSlug: string): AnalyticsFiltersStore {
    let store = storeCache.get(workspaceSlug);
    if (!store) {
        store = createAnalyticsFiltersStore(workspaceSlug);
        storeCache.set(workspaceSlug, store);
    }
    return store();
}

/**
 * Reads the current snapshot without subscribing (useful inside queryFn
 * or event handlers where we just need the latest filter state once).
 */
export function getAnalyticsFiltersSnapshot(workspaceSlug: string): AnalyticsFiltersState {
    let store = storeCache.get(workspaceSlug);
    if (!store) {
        store = createAnalyticsFiltersStore(workspaceSlug);
        storeCache.set(workspaceSlug, store);
    }
    return store.getState();
}

/**
 * Serializes a filter state to URLSearchParams compatible with the backend
 * AnalyticsFiltersQuery binder (CSV for arrays).
 */
export function filtersToQueryString(filters: AnalyticsFiltersState): string {
    const params = new URLSearchParams();
    if (filters.userIds.length > 0) params.set('userIds', filters.userIds.join(','));
    if (filters.labelIds.length > 0) params.set('labelIds', filters.labelIds.join(','));
    if (filters.projectIds.length > 0) params.set('projectIds', filters.projectIds.join(','));
    if (filters.stateIds.length > 0) params.set('stateIds', filters.stateIds.join(','));
    if (filters.stateCategories.length > 0)
        params.set('stateCategories', filters.stateCategories.join(','));
    if (filters.priorities.length > 0) params.set('priorities', filters.priorities.join(','));
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.set('dateTo', filters.dateTo);
    if (filters.dateField && filters.dateField !== 'createdAt')
        params.set('dateField', filters.dateField);
    if (filters.cycleId) params.set('cycleId', filters.cycleId);
    if (filters.includeArchived) params.set('includeArchived', 'true');
    return params.toString();
}

/**
 * Returns a stable serialization for use as part of a TanStack Query key.
 * Avoid JSON.stringify on the full object because key order is not guaranteed
 * across browsers; encode normalized values explicitly.
 */
export function filtersToQueryKey(filters: AnalyticsFiltersState): string {
    return [
        filters.userIds.slice().sort().join(','),
        filters.labelIds.slice().sort().join(','),
        filters.projectIds.slice().sort().join(','),
        filters.stateIds.slice().sort().join(','),
        filters.stateCategories.slice().sort().join(','),
        filters.priorities.slice().sort().join(','),
        filters.dateFrom ?? '',
        filters.dateTo ?? '',
        filters.dateField,
        filters.cycleId ?? '',
        filters.includeArchived ? '1' : '0',
    ].join('|');
}
