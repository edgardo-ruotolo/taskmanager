import { apiClient } from '@/shared/lib/api-client';
import type { RecentVisit, QuickLink, CreateQuickLinkData, TrackVisitData } from '../domain/types';

const base = (slug: string): string => `/api/workspaces/${slug}/home`;

export const homeRepository = {
    getRecentVisits: (workspaceSlug: string, limit = 20): Promise<RecentVisit[]> =>
        apiClient.get<RecentVisit[]>(`${base(workspaceSlug)}/recent-visits`, { params: { limit } }).then(r => r.data),

    trackVisit: (workspaceSlug: string, data: TrackVisitData): Promise<void> =>
        apiClient.post(`${base(workspaceSlug)}/track-visit`, data).then(() => undefined),

    getQuickLinks: (workspaceSlug: string): Promise<QuickLink[]> =>
        apiClient.get<QuickLink[]>(`${base(workspaceSlug)}/quick-links`).then(r => r.data),

    createQuickLink: (workspaceSlug: string, data: CreateQuickLinkData): Promise<QuickLink> =>
        apiClient.post<QuickLink>(`${base(workspaceSlug)}/quick-links`, data).then(r => r.data),

    deleteQuickLink: (workspaceSlug: string, linkId: string): Promise<void> =>
        apiClient.delete(`${base(workspaceSlug)}/quick-links/${linkId}`).then(() => undefined),
};
