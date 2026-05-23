import { apiClient } from '@/shared/lib/api-client';
import type { IntakePage, IntakeIssue, CreateIntakeIssueData, ReviewIntakeIssueData, IntakeStatus } from '../domain/types';

const base = (workspaceSlug: string, projectId: string): string =>
    `/api/workspaces/${workspaceSlug}/projects/${projectId}/intake`;

export const intakeRepository = {
    getAll: (workspaceSlug: string, projectId: string, status?: IntakeStatus): Promise<IntakePage> =>
        apiClient
            .get<IntakePage>(base(workspaceSlug, projectId), { params: status ? { status } : {} })
            .then((r) => r.data),

    create: (workspaceSlug: string, projectId: string, data: CreateIntakeIssueData): Promise<IntakeIssue> =>
        apiClient.post<IntakeIssue>(base(workspaceSlug, projectId), data).then((r) => r.data),

    review: (workspaceSlug: string, projectId: string, id: string, data: ReviewIntakeIssueData): Promise<IntakeIssue> =>
        apiClient
            .patch<IntakeIssue>(`${base(workspaceSlug, projectId)}/${id}/review`, data)
            .then((r) => r.data),

    delete: (workspaceSlug: string, projectId: string, id: string): Promise<void> =>
        apiClient.delete(`${base(workspaceSlug, projectId)}/${id}`).then(() => undefined),
};
