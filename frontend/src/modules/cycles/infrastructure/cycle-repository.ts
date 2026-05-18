import { apiClient } from '@/shared/lib/api-client';
import type { Cycle, CreateCycleData, CycleIssueRef } from '../domain/types';

export const cycleRepository = {
    getAll: (workspaceSlug: string, companyId: string): Promise<Cycle[]> =>
        apiClient
            .get<{ items: Cycle[] }>(`/api/workspaces/${workspaceSlug}/companies/${companyId}/cycles`)
            .then((r) => r.data.items),

    create: (
        workspaceSlug: string,
        companyId: string,
        data: CreateCycleData,
    ): Promise<Cycle> =>
        apiClient
            .post<Cycle>(
                `/api/workspaces/${workspaceSlug}/companies/${companyId}/cycles`,
                data,
            )
            .then((r) => r.data),

    delete: (
        workspaceSlug: string,
        companyId: string,
        cycleId: string,
    ): Promise<void> =>
        apiClient
            .delete(
                `/api/workspaces/${workspaceSlug}/companies/${companyId}/cycles/${cycleId}`,
            )
            .then(() => undefined),

    getIssues: (workspaceSlug: string, companyId: string, cycleId: string): Promise<CycleIssueRef[]> =>
        apiClient
            .get<CycleIssueRef[]>(
                `/api/workspaces/${workspaceSlug}/companies/${companyId}/cycles/${cycleId}/issues`,
            )
            .then((r) => r.data),

    addIssue: (workspaceSlug: string, companyId: string, cycleId: string, issueId: string): Promise<void> =>
        apiClient
            .post(
                `/api/workspaces/${workspaceSlug}/companies/${companyId}/cycles/${cycleId}/issues`,
                { issueId },
            )
            .then(() => undefined),

    removeIssue: (workspaceSlug: string, companyId: string, cycleId: string, issueId: string): Promise<void> =>
        apiClient
            .delete(
                `/api/workspaces/${workspaceSlug}/companies/${companyId}/cycles/${cycleId}/issues/${issueId}`,
            )
            .then(() => undefined),
};
