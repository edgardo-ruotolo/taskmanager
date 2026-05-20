/**
 * Centralized TanStack Query keys.
 *
 * Each domain exposes hierarchical keys so that callers can invalidate at the
 * right granularity (`queryKeys.issues.all` invalidates everything, `.detail(id)`
 * only that record). Always spread the parent key — never duplicate literals.
 */
export const queryKeys = {
    auth: {
        all: ['auth'] as const,
        me: () => [...queryKeys.auth.all, 'me'] as const,
    },
    workspaces: {
        all: ['workspaces'] as const,
        lists: () => [...queryKeys.workspaces.all, 'list'] as const,
        list: () => [...queryKeys.workspaces.lists()] as const,
        details: () => [...queryKeys.workspaces.all, 'detail'] as const,
        detail: (slug: string) => [...queryKeys.workspaces.details(), slug] as const,
        members: (slug: string) => [...queryKeys.workspaces.detail(slug), 'members'] as const,
        activity: (slug: string) => [...queryKeys.workspaces.detail(slug), 'activity'] as const,
    },
    companies: {
        all: ['companies'] as const,
        lists: () => [...queryKeys.companies.all, 'list'] as const,
        list: (workspaceSlug: string) => [...queryKeys.companies.lists(), workspaceSlug] as const,
        details: () => [...queryKeys.companies.all, 'detail'] as const,
        detail: (workspaceSlug: string, companyId: string) =>
            [...queryKeys.companies.details(), workspaceSlug, companyId] as const,
        members: (workspaceSlug: string, companyId: string) =>
            [...queryKeys.companies.detail(workspaceSlug, companyId), 'members'] as const,
    },
    states: {
        all: ['states'] as const,
        list: () => [...queryKeys.states.all, 'list'] as const,
        groups: () => [...queryKeys.states.all, 'groups'] as const,
    },
    issues: {
        all: ['issues'] as const,
        lists: () => [...queryKeys.issues.all, 'list'] as const,
        list: (workspaceSlug: string, companyId: string) =>
            [...queryKeys.issues.lists(), workspaceSlug, companyId] as const,
        details: () => [...queryKeys.issues.all, 'detail'] as const,
        detail: (workspaceSlug: string, companyId: string, issueId: string) =>
            [...queryKeys.issues.details(), workspaceSlug, companyId, issueId] as const,
        archived: (workspaceSlug: string, companyId: string) =>
            [...queryKeys.issues.all, 'archived', workspaceSlug, companyId] as const,
        activity: (issueId: string) => [...queryKeys.issues.all, 'activity', issueId] as const,
        subscribers: (issueId: string) => [...queryKeys.issues.all, 'subscribers', issueId] as const,
        relations: (issueId: string) => [...queryKeys.issues.all, 'relations', issueId] as const,
        links: (issueId: string) => [...queryKeys.issues.all, 'links', issueId] as const,
        versions: (issueId: string) => [...queryKeys.issues.all, 'versions', issueId] as const,
        types: (workspaceSlug: string, companyId: string) =>
            [...queryKeys.issues.all, 'types', workspaceSlug, companyId] as const,
        views: (workspaceSlug: string, companyId: string) =>
            [...queryKeys.issues.all, 'views', workspaceSlug, companyId] as const,
        search: (workspaceSlug: string, companyId: string, query: string) =>
            [...queryKeys.issues.all, 'search', workspaceSlug, companyId, query] as const,
    },
    comments: {
        all: ['comments'] as const,
        list: (issueId: string) => [...queryKeys.comments.all, issueId] as const,
    },
    reactions: {
        all: ['reactions'] as const,
        list: (issueId: string) => [...queryKeys.reactions.all, issueId] as const,
    },
    cycles: {
        all: ['cycles'] as const,
        lists: () => [...queryKeys.cycles.all, 'list'] as const,
        list: (workspaceSlug: string, companyId: string) =>
            [...queryKeys.cycles.lists(), workspaceSlug, companyId] as const,
        details: () => [...queryKeys.cycles.all, 'detail'] as const,
        detail: (workspaceSlug: string, companyId: string, cycleId: string) =>
            [...queryKeys.cycles.details(), workspaceSlug, companyId, cycleId] as const,
        issues: (workspaceSlug: string, companyId: string, cycleId: string) =>
            [...queryKeys.cycles.detail(workspaceSlug, companyId, cycleId), 'issues'] as const,
    },
    modules: {
        all: ['modules'] as const,
        lists: () => [...queryKeys.modules.all, 'list'] as const,
        list: (workspaceSlug: string, companyId: string) =>
            [...queryKeys.modules.lists(), workspaceSlug, companyId] as const,
        details: () => [...queryKeys.modules.all, 'detail'] as const,
        detail: (workspaceSlug: string, companyId: string, moduleId: string) =>
            [...queryKeys.modules.details(), workspaceSlug, companyId, moduleId] as const,
        issues: (workspaceSlug: string, companyId: string, moduleId: string) =>
            [...queryKeys.modules.detail(workspaceSlug, companyId, moduleId), 'issues'] as const,
    },
    labels: {
        all: ['labels'] as const,
        list: (workspaceSlug: string, companyId: string) =>
            [...queryKeys.labels.all, workspaceSlug, companyId] as const,
    },
    notifications: {
        all: ['notifications'] as const,
        list: () => [...queryKeys.notifications.all, 'list'] as const,
        unreadCount: () => [...queryKeys.notifications.all, 'unread-count'] as const,
        preferences: () => [...queryKeys.notifications.all, 'preferences'] as const,
    },
} as const;
