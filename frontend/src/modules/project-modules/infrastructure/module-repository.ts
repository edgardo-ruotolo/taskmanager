import { apiClient } from '@/shared/lib/api-client';
import type { ProjectModule, CreateModuleData, ModuleIssueRef } from '../domain/types';

export const moduleRepository = {
    getAll: (workspaceSlug: string, companyId: string): Promise<ProjectModule[]> =>
        apiClient
            .get<ProjectModule[]>(
                `/api/workspaces/${workspaceSlug}/companies/${companyId}/modules`,
            )
            .then((r) => r.data),

    create: (
        workspaceSlug: string,
        companyId: string,
        data: CreateModuleData,
    ): Promise<ProjectModule> =>
        apiClient
            .post<ProjectModule>(
                `/api/workspaces/${workspaceSlug}/companies/${companyId}/modules`,
                data,
            )
            .then((r) => r.data),

    delete: (
        workspaceSlug: string,
        companyId: string,
        moduleId: string,
    ): Promise<void> =>
        apiClient
            .delete(
                `/api/workspaces/${workspaceSlug}/companies/${companyId}/modules/${moduleId}`,
            )
            .then(() => undefined),

    getIssues: (workspaceSlug: string, companyId: string, moduleId: string): Promise<ModuleIssueRef[]> =>
        apiClient
            .get<ModuleIssueRef[]>(
                `/api/workspaces/${workspaceSlug}/companies/${companyId}/modules/${moduleId}/issues`,
            )
            .then((r) => r.data),

    addIssue: (workspaceSlug: string, companyId: string, moduleId: string, issueId: string): Promise<void> =>
        apiClient
            .post(
                `/api/workspaces/${workspaceSlug}/companies/${companyId}/modules/${moduleId}/issues`,
                { issueId },
            )
            .then(() => undefined),

    removeIssue: (workspaceSlug: string, companyId: string, moduleId: string, issueId: string): Promise<void> =>
        apiClient
            .delete(
                `/api/workspaces/${workspaceSlug}/companies/${companyId}/modules/${moduleId}/issues/${issueId}`,
            )
            .then(() => undefined),
};
