import { apiClient } from '@/shared/lib/api-client';
import type { ArchivedCycle, ArchivedIssue, ArchivedModule } from '../domain/types';

const issueBase = (slug: string, projectId: string): string =>
    `/api/workspaces/${slug}/projects/${projectId}/issues`;

const cycleBase = (slug: string, projectId: string): string =>
    `/api/workspaces/${slug}/projects/${projectId}/cycles`;

const moduleBase = (slug: string, projectId: string): string =>
    `/api/workspaces/${slug}/projects/${projectId}/modules`;

export const archivesRepository = {
    getArchivedIssues: (workspaceSlug: string, projectId: string): Promise<ArchivedIssue[]> =>
        apiClient.get<ArchivedIssue[]>(`${issueBase(workspaceSlug, projectId)}/archived`).then(r => r.data),

    restoreIssue: (workspaceSlug: string, projectId: string, issueId: string): Promise<void> =>
        apiClient.post(`${issueBase(workspaceSlug, projectId)}/${issueId}/unarchive`).then(() => undefined),

    getArchivedCycles: (workspaceSlug: string, projectId: string): Promise<ArchivedCycle[]> =>
        apiClient.get<ArchivedCycle[]>(`${cycleBase(workspaceSlug, projectId)}/archived`).then(r => r.data),

    restoreCycle: (workspaceSlug: string, projectId: string, cycleId: string): Promise<void> =>
        apiClient.post(`${cycleBase(workspaceSlug, projectId)}/${cycleId}/unarchive`).then(() => undefined),

    getArchivedModules: (workspaceSlug: string, projectId: string): Promise<ArchivedModule[]> =>
        apiClient.get<ArchivedModule[]>(`${moduleBase(workspaceSlug, projectId)}/archived`).then(r => r.data),

    restoreModule: (workspaceSlug: string, projectId: string, moduleId: string): Promise<void> =>
        apiClient.post(`${moduleBase(workspaceSlug, projectId)}/${moduleId}/unarchive`).then(() => undefined),
};
