import { apiClient } from '@/shared/lib/api-client';
import type { Worklog, WorklogSummary, CreateWorklogData, UpdateWorklogData } from '../domain/types';

const base = (workspaceSlug: string, issueId: string): string =>
    `/api/workspaces/${workspaceSlug}/issues/${issueId}/worklogs`;

export const worklogsRepository = {
    getWorklogs: (workspaceSlug: string, issueId: string): Promise<Worklog[]> =>
        apiClient.get<Worklog[]>(base(workspaceSlug, issueId)).then((r) => r.data),

    createWorklog: (
        workspaceSlug: string,
        issueId: string,
        data: CreateWorklogData,
    ): Promise<Worklog> =>
        apiClient.post<Worklog>(base(workspaceSlug, issueId), data).then((r) => r.data),

    updateWorklog: (
        workspaceSlug: string,
        issueId: string,
        worklogId: string,
        data: UpdateWorklogData,
    ): Promise<Worklog> =>
        apiClient
            .patch<Worklog>(`${base(workspaceSlug, issueId)}/${worklogId}`, data)
            .then((r) => r.data),

    deleteWorklog: (
        workspaceSlug: string,
        issueId: string,
        worklogId: string,
    ): Promise<void> =>
        apiClient
            .delete(`${base(workspaceSlug, issueId)}/${worklogId}`)
            .then(() => undefined),

    getWorklogSummary: (workspaceSlug: string, issueId: string): Promise<WorklogSummary> =>
        apiClient
            .get<WorklogSummary>(`${base(workspaceSlug, issueId)}/summary`)
            .then((r) => r.data),
};
