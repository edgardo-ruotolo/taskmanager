import { apiClient } from '@/shared/lib/api-client';
import type { PagedResult } from '@/shared/types/pagination';
import type { WorkspaceActivity } from '../domain/activity-types';

export const activityRepository = {
    getAll: (workspaceSlug: string, page = 1, pageSize = 30): Promise<PagedResult<WorkspaceActivity>> =>
        apiClient
            .get<PagedResult<WorkspaceActivity>>(
                `/api/workspaces/${workspaceSlug}/activity?page=${page}&pageSize=${pageSize}`,
            )
            .then((r) => r.data),
};
