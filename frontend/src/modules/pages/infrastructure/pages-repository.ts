import { apiClient } from '@/shared/lib/api-client';
import type { Page, PageVersion, CreatePageData, UpdatePageData } from '../domain/types';

const base = (slug: string) => `/api/workspaces/${slug}/pages`;

export const pagesRepository = {
    getAll: (workspaceSlug: string, archived = false): Promise<Page[]> =>
        apiClient
            .get<Page[]>(base(workspaceSlug), { params: { archived } })
            .then((r) => r.data),

    getOne: (workspaceSlug: string, id: string): Promise<Page> =>
        apiClient.get<Page>(`${base(workspaceSlug)}/${id}`).then((r) => r.data),

    create: (workspaceSlug: string, data: CreatePageData): Promise<Page> =>
        apiClient.post<Page>(base(workspaceSlug), data).then((r) => r.data),

    update: (workspaceSlug: string, id: string, data: UpdatePageData): Promise<Page> =>
        apiClient.patch<Page>(`${base(workspaceSlug)}/${id}`, data).then((r) => r.data),

    delete: (workspaceSlug: string, id: string): Promise<void> =>
        apiClient.delete(`${base(workspaceSlug)}/${id}`).then(() => undefined),

    archive: (workspaceSlug: string, id: string): Promise<void> =>
        apiClient.post(`${base(workspaceSlug)}/${id}/archive`).then(() => undefined),

    unarchive: (workspaceSlug: string, id: string): Promise<void> =>
        apiClient.post(`${base(workspaceSlug)}/${id}/unarchive`).then(() => undefined),

    lock: (workspaceSlug: string, id: string): Promise<void> =>
        apiClient.post(`${base(workspaceSlug)}/${id}/lock`).then(() => undefined),

    unlock: (workspaceSlug: string, id: string): Promise<void> =>
        apiClient.post(`${base(workspaceSlug)}/${id}/unlock`).then(() => undefined),

    duplicate: (workspaceSlug: string, id: string, title: string): Promise<Page> =>
        apiClient.post<Page>(`${base(workspaceSlug)}/${id}/duplicate`, { title }).then((r) => r.data),

    getVersions: (workspaceSlug: string, id: string): Promise<PageVersion[]> =>
        apiClient.get<PageVersion[]>(`${base(workspaceSlug)}/${id}/versions`).then((r) => r.data),

    restoreVersion: (workspaceSlug: string, id: string, versionId: string): Promise<Page> =>
        apiClient
            .post<Page>(`${base(workspaceSlug)}/${id}/restore-version/${versionId}`)
            .then((r) => r.data),
};
