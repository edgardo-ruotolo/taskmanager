import { apiClient } from '@/shared/lib/api-client';
import type { ArchivedCycle, ArchivedIssue, ArchivedModule } from '../domain/types';

const issueBase = (slug: string, companyId: string): string =>
    `/api/workspaces/${slug}/companies/${companyId}/issues`;

const cycleBase = (slug: string, companyId: string): string =>
    `/api/workspaces/${slug}/companies/${companyId}/cycles`;

const moduleBase = (slug: string, companyId: string): string =>
    `/api/workspaces/${slug}/companies/${companyId}/modules`;

export const archivesRepository = {
    getArchivedIssues: (workspaceSlug: string, companyId: string): Promise<ArchivedIssue[]> =>
        apiClient.get<ArchivedIssue[]>(`${issueBase(workspaceSlug, companyId)}/archived`).then(r => r.data),

    restoreIssue: (workspaceSlug: string, companyId: string, issueId: string): Promise<void> =>
        apiClient.post(`${issueBase(workspaceSlug, companyId)}/${issueId}/unarchive`).then(() => undefined),

    getArchivedCycles: (workspaceSlug: string, companyId: string): Promise<ArchivedCycle[]> =>
        apiClient.get<ArchivedCycle[]>(`${cycleBase(workspaceSlug, companyId)}/archived`).then(r => r.data),

    restoreCycle: (workspaceSlug: string, companyId: string, cycleId: string): Promise<void> =>
        apiClient.post(`${cycleBase(workspaceSlug, companyId)}/${cycleId}/unarchive`).then(() => undefined),

    getArchivedModules: (workspaceSlug: string, companyId: string): Promise<ArchivedModule[]> =>
        apiClient.get<ArchivedModule[]>(`${moduleBase(workspaceSlug, companyId)}/archived`).then(r => r.data),

    restoreModule: (workspaceSlug: string, companyId: string, moduleId: string): Promise<void> =>
        apiClient.post(`${moduleBase(workspaceSlug, companyId)}/${moduleId}/unarchive`).then(() => undefined),
};
