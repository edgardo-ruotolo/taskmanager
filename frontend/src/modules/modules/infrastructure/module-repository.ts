import { apiClient } from '@/shared/lib/api-client';
import type { Module, CreateModuleData, ModuleIssueRef } from '../domain/types';

export const moduleRepository = {
    getAll: (workspaceSlug: string, projectId: string): Promise<Module[]> =>
        apiClient
            .get<{ items: Module[] }>(
                `/api/workspaces/${workspaceSlug}/projects/${projectId}/modules`,
            )
            .then((r) => r.data.items),

    create: (
        workspaceSlug: string,
        projectId: string,
        data: CreateModuleData,
    ): Promise<Module> =>
        apiClient
            .post<Module>(
                `/api/workspaces/${workspaceSlug}/projects/${projectId}/modules`,
                data,
            )
            .then((r) => r.data),

    delete: (
        workspaceSlug: string,
        projectId: string,
        moduleId: string,
    ): Promise<void> =>
        apiClient
            .delete(
                `/api/workspaces/${workspaceSlug}/projects/${projectId}/modules/${moduleId}`,
            )
            .then(() => undefined),

    getIssues: (workspaceSlug: string, projectId: string, moduleId: string): Promise<ModuleIssueRef[]> =>
        apiClient
            .get<ModuleIssueRef[]>(
                `/api/workspaces/${workspaceSlug}/projects/${projectId}/modules/${moduleId}/issues`,
            )
            .then((r) => r.data),

    addIssue: (workspaceSlug: string, projectId: string, moduleId: string, issueId: string): Promise<void> =>
        apiClient
            .post(
                `/api/workspaces/${workspaceSlug}/projects/${projectId}/modules/${moduleId}/issues`,
                { issueId },
            )
            .then(() => undefined),

    removeIssue: (workspaceSlug: string, projectId: string, moduleId: string, issueId: string): Promise<void> =>
        apiClient
            .delete(
                `/api/workspaces/${workspaceSlug}/projects/${projectId}/modules/${moduleId}/issues/${issueId}`,
            )
            .then(() => undefined),
};
