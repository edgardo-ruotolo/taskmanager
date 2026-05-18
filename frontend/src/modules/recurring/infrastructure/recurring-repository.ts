import { apiClient } from '@/shared/lib/api-client';
import type {
    RecurringTemplate,
    RecurringRun,
    RecurringPreview,
    RecurringFromIssuePrefill,
    CreateRecurringTemplateData,
    UpdateRecurringTemplateData,
} from '../domain/types';

const base = (slug: string) => `/api/workspaces/${slug}/recurring`;

export const recurringRepository = {
    getAll: (workspaceSlug: string): Promise<RecurringTemplate[]> =>
        apiClient.get<RecurringTemplate[]>(base(workspaceSlug)).then((r) => r.data),

    getOne: (workspaceSlug: string, id: string): Promise<RecurringTemplate> =>
        apiClient.get<RecurringTemplate>(`${base(workspaceSlug)}/${id}`).then((r) => r.data),

    create: (workspaceSlug: string, data: CreateRecurringTemplateData): Promise<RecurringTemplate> =>
        apiClient.post<RecurringTemplate>(base(workspaceSlug), data).then((r) => r.data),

    update: (
        workspaceSlug: string,
        id: string,
        data: UpdateRecurringTemplateData,
    ): Promise<RecurringTemplate> =>
        apiClient.patch<RecurringTemplate>(`${base(workspaceSlug)}/${id}`, data).then((r) => r.data),

    delete: (workspaceSlug: string, id: string): Promise<void> =>
        apiClient.delete(`${base(workspaceSlug)}/${id}`).then(() => undefined),

    getRuns: (workspaceSlug: string, id: string): Promise<RecurringRun[]> =>
        apiClient.get<RecurringRun[]>(`${base(workspaceSlug)}/${id}/runs`).then((r) => r.data),

    preview: (workspaceSlug: string, id: string, count = 5): Promise<RecurringPreview> =>
        apiClient
            .get<RecurringPreview>(`${base(workspaceSlug)}/${id}/preview`, { params: { count } })
            .then((r) => r.data),

    pause: (workspaceSlug: string, id: string): Promise<void> =>
        apiClient.post(`${base(workspaceSlug)}/${id}/pause`).then(() => undefined),

    resume: (workspaceSlug: string, id: string): Promise<void> =>
        apiClient.post(`${base(workspaceSlug)}/${id}/resume`).then(() => undefined),

    skipNext: (workspaceSlug: string, id: string): Promise<void> =>
        apiClient.post(`${base(workspaceSlug)}/${id}/skip-next`).then(() => undefined),

    runNow: (workspaceSlug: string, id: string): Promise<void> =>
        apiClient.post(`${base(workspaceSlug)}/${id}/run-now`).then(() => undefined),

    fromIssue: (workspaceSlug: string, issueId: string): Promise<RecurringFromIssuePrefill> =>
        apiClient
            .post<RecurringFromIssuePrefill>(`${base(workspaceSlug)}/from-issue/${issueId}`)
            .then((r) => r.data),
};
