import { apiClient } from '@/shared/lib/api-client';
import type { AnalyticsOverview } from '../domain/types';

export const analyticsRepository = {
    getOverview: (workspaceSlug: string): Promise<AnalyticsOverview> =>
        apiClient
            .get<AnalyticsOverview>(`/api/workspaces/${workspaceSlug}/analytics/overview`)
            .then((r) => r.data),
};
