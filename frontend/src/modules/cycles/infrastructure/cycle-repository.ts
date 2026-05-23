import { apiClient } from '@/shared/lib/api-client';
import type { Cycle, CreateCycleData, CycleIssueRef } from '../domain/types';

export const cycleRepository = {
    getAll: (workspaceSlug: string, projectId: string): Promise<Cycle[]> =>
        apiClient
            .get<{ items: Cycle[] }>(`/api/workspaces/${workspaceSlug}/projects/${projectId}/cycles`)
            .then((r) => r.data.items),

    create: (
        workspaceSlug: string,
        projectId: string,
        data: CreateCycleData,
    ): Promise<Cycle> =>
        apiClient
            .post<Cycle>(
                `/api/workspaces/${workspaceSlug}/projects/${projectId}/cycles`,
                data,
            )
            .then((r) => r.data),

    delete: (
        workspaceSlug: string,
        projectId: string,
        cycleId: string,
    ): Promise<void> =>
        apiClient
            .delete(
                `/api/workspaces/${workspaceSlug}/projects/${projectId}/cycles/${cycleId}`,
            )
            .then(() => undefined),

    getIssues: (workspaceSlug: string, projectId: string, cycleId: string): Promise<CycleIssueRef[]> =>
        apiClient
            .get<CycleIssueRef[]>(
                `/api/workspaces/${workspaceSlug}/projects/${projectId}/cycles/${cycleId}/issues`,
            )
            .then((r) => r.data),

    addIssue: (workspaceSlug: string, projectId: string, cycleId: string, issueId: string): Promise<void> =>
        apiClient
            .post(
                `/api/workspaces/${workspaceSlug}/projects/${projectId}/cycles/${cycleId}/issues`,
                { issueId },
            )
            .then(() => undefined),

    removeIssue: (workspaceSlug: string, projectId: string, cycleId: string, issueId: string): Promise<void> =>
        apiClient
            .delete(
                `/api/workspaces/${workspaceSlug}/projects/${projectId}/cycles/${cycleId}/issues/${issueId}`,
            )
            .then(() => undefined),
};
