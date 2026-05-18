import { apiClient } from '@/shared/lib/api-client';
import type { IntakePage, IntakeIssue, CreateIntakeIssueData, ReviewIntakeIssueData, IntakeStatus } from '../domain/types';

const base = (workspaceSlug: string, companyId: string): string =>
    `/api/workspaces/${workspaceSlug}/companies/${companyId}/intake`;

export const intakeRepository = {
    getAll: (workspaceSlug: string, companyId: string, status?: IntakeStatus): Promise<IntakePage> =>
        apiClient
            .get<IntakePage>(base(workspaceSlug, companyId), { params: status ? { status } : {} })
            .then((r) => r.data),

    create: (workspaceSlug: string, companyId: string, data: CreateIntakeIssueData): Promise<IntakeIssue> =>
        apiClient.post<IntakeIssue>(base(workspaceSlug, companyId), data).then((r) => r.data),

    review: (workspaceSlug: string, companyId: string, id: string, data: ReviewIntakeIssueData): Promise<IntakeIssue> =>
        apiClient
            .patch<IntakeIssue>(`${base(workspaceSlug, companyId)}/${id}/review`, data)
            .then((r) => r.data),

    delete: (workspaceSlug: string, companyId: string, id: string): Promise<void> =>
        apiClient.delete(`${base(workspaceSlug, companyId)}/${id}`).then(() => undefined),
};
