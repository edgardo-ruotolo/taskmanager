import { apiClient } from '@/shared/lib/api-client';
import type { Label, CreateLabelData } from '../domain/types';

export const labelRepository = {
    getAll: (workspaceSlug: string): Promise<Label[]> =>
        apiClient
            .get<Label[]>(`/api/workspaces/${workspaceSlug}/labels`)
            .then((r) => r.data),

    create: (workspaceSlug: string, data: CreateLabelData): Promise<Label> =>
        apiClient
            .post<Label>(`/api/workspaces/${workspaceSlug}/labels`, data)
            .then((r) => r.data),

    update: (
        workspaceSlug: string,
        labelId: string,
        data: CreateLabelData,
    ): Promise<Label> =>
        apiClient
            .patch<Label>(`/api/workspaces/${workspaceSlug}/labels/${labelId}`, data)
            .then((r) => r.data),

    delete: (workspaceSlug: string, labelId: string): Promise<void> =>
        apiClient
            .delete(`/api/workspaces/${workspaceSlug}/labels/${labelId}`)
            .then(() => undefined),
};
