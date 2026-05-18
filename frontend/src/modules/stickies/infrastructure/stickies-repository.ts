import { apiClient } from '@/shared/lib/api-client';
import type { Sticky, CreateStickyData, UpdateStickyData } from '../domain/types';

const base = (slug: string) => `/api/workspaces/${slug}/stickies`;

export const stickiesRepository = {
    getAll: (workspaceSlug: string): Promise<Sticky[]> =>
        apiClient.get<Sticky[]>(base(workspaceSlug)).then((r) => r.data),

    getOne: (workspaceSlug: string, id: string): Promise<Sticky> =>
        apiClient.get<Sticky>(`${base(workspaceSlug)}/${id}`).then((r) => r.data),

    create: (workspaceSlug: string, data: CreateStickyData): Promise<Sticky> =>
        apiClient.post<Sticky>(base(workspaceSlug), data).then((r) => r.data),

    update: (workspaceSlug: string, id: string, data: UpdateStickyData): Promise<Sticky> =>
        apiClient.patch<Sticky>(`${base(workspaceSlug)}/${id}`, data).then((r) => r.data),

    delete: (workspaceSlug: string, id: string): Promise<void> =>
        apiClient.delete(`${base(workspaceSlug)}/${id}`).then(() => undefined),

    reorder: (workspaceSlug: string, orderedIds: string[]): Promise<void> =>
        apiClient
            .post(`${base(workspaceSlug)}/reorder`, { orderedIds })
            .then(() => undefined),
};
