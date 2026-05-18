import { apiClient } from '@/shared/lib/api-client';
import type { CreateDraftIssueData, DraftIssue, UpdateDraftIssueData } from '../domain/types';

const base = (slug: string): string => `/api/workspaces/${slug}/drafts`;

export const draftsRepository = {
    getAll: (workspaceSlug: string): Promise<DraftIssue[]> =>
        apiClient.get<DraftIssue[]>(base(workspaceSlug)).then(r => r.data),

    getOne: (workspaceSlug: string, id: string): Promise<DraftIssue> =>
        apiClient.get<DraftIssue>(`${base(workspaceSlug)}/${id}`).then(r => r.data),

    create: (workspaceSlug: string, data: CreateDraftIssueData): Promise<DraftIssue> =>
        apiClient.post<DraftIssue>(base(workspaceSlug), data).then(r => r.data),

    update: (workspaceSlug: string, id: string, data: UpdateDraftIssueData): Promise<DraftIssue> =>
        apiClient.patch<DraftIssue>(`${base(workspaceSlug)}/${id}`, data).then(r => r.data),

    delete: (workspaceSlug: string, id: string): Promise<void> =>
        apiClient.delete(`${base(workspaceSlug)}/${id}`).then(() => undefined),

    publish: (workspaceSlug: string, id: string): Promise<unknown> =>
        apiClient.post(`${base(workspaceSlug)}/${id}/publish`).then(r => r.data),
};
