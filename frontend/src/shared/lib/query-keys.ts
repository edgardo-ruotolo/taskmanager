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
    projects: {
        all: ['projects'] as const,
        lists: () => [...queryKeys.projects.all, 'list'] as const,
        list: (workspaceSlug: string) => [...queryKeys.projects.lists(), workspaceSlug] as const,
        details: () => [...queryKeys.projects.all, 'detail'] as const,
        detail: (workspaceSlug: string, projectId: string) =>
            [...queryKeys.projects.details(), workspaceSlug, projectId] as const,
        members: (workspaceSlug: string, projectId: string) =>
            [...queryKeys.projects.detail(workspaceSlug, projectId), 'members'] as const,
    },
    states: {
        all: ['states'] as const,
        list: () => [...queryKeys.states.all, 'list'] as const,
        groups: () => [...queryKeys.states.all, 'groups'] as const,
    },
    issues: {
        all: ['issues'] as const,
        lists: () => [...queryKeys.issues.all, 'list'] as const,
        list: (workspaceSlug: string, projectId: string) =>
            [...queryKeys.issues.lists(), workspaceSlug, projectId] as const,
        details: () => [...queryKeys.issues.all, 'detail'] as const,
        detail: (workspaceSlug: string, projectId: string, issueId: string) =>
            [...queryKeys.issues.details(), workspaceSlug, projectId, issueId] as const,
        archived: (workspaceSlug: string, projectId: string) =>
            [...queryKeys.issues.all, 'archived', workspaceSlug, projectId] as const,
        activity: (issueId: string) => [...queryKeys.issues.all, 'activity', issueId] as const,
        subscribers: (issueId: string) => [...queryKeys.issues.all, 'subscribers', issueId] as const,
        relations: (issueId: string) => [...queryKeys.issues.all, 'relations', issueId] as const,
        links: (issueId: string) => [...queryKeys.issues.all, 'links', issueId] as const,
        versions: (issueId: string) => [...queryKeys.issues.all, 'versions', issueId] as const,
        types: (workspaceSlug: string, projectId: string) =>
            [...queryKeys.issues.all, 'types', workspaceSlug, projectId] as const,
        views: (workspaceSlug: string, projectId: string) =>
            [...queryKeys.issues.all, 'views', workspaceSlug, projectId] as const,
        search: (workspaceSlug: string, projectId: string, query: string) =>
            [...queryKeys.issues.all, 'search', workspaceSlug, projectId, query] as const,
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
        list: (workspaceSlug: string, projectId: string) =>
            [...queryKeys.cycles.lists(), workspaceSlug, projectId] as const,
        details: () => [...queryKeys.cycles.all, 'detail'] as const,
        detail: (workspaceSlug: string, projectId: string, cycleId: string) =>
            [...queryKeys.cycles.details(), workspaceSlug, projectId, cycleId] as const,
        issues: (workspaceSlug: string, projectId: string, cycleId: string) =>
            [...queryKeys.cycles.detail(workspaceSlug, projectId, cycleId), 'issues'] as const,
    },
    modules: {
        all: ['modules'] as const,
        lists: () => [...queryKeys.modules.all, 'list'] as const,
        list: (workspaceSlug: string, projectId: string) =>
            [...queryKeys.modules.lists(), workspaceSlug, projectId] as const,
        details: () => [...queryKeys.modules.all, 'detail'] as const,
        detail: (workspaceSlug: string, projectId: string, moduleId: string) =>
            [...queryKeys.modules.details(), workspaceSlug, projectId, moduleId] as const,
        issues: (workspaceSlug: string, projectId: string, moduleId: string) =>
            [...queryKeys.modules.detail(workspaceSlug, projectId, moduleId), 'issues'] as const,
    },
    labels: {
        all: ['labels'] as const,
        list: (workspaceSlug: string, projectId: string) =>
            [...queryKeys.labels.all, workspaceSlug, projectId] as const,
    },
    notifications: {
        all: ['notifications'] as const,
        list: () => [...queryKeys.notifications.all, 'list'] as const,
        unreadCount: () => [...queryKeys.notifications.all, 'unread-count'] as const,
        preferences: () => [...queryKeys.notifications.all, 'preferences'] as const,
    },
} as const;
