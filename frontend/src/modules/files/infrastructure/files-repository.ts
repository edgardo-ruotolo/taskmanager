import type { AxiosProgressEvent } from 'axios';
import { apiClient } from '@/shared/lib/api-client';
import type { FileAsset } from '../domain/types';

const base = (slug: string): string => `/api/workspaces/${slug}/files`;

export const filesRepository = {
    getAll: (workspaceSlug: string, entityType: string, entityId: string): Promise<FileAsset[]> =>
        apiClient
            .get<FileAsset[]>(base(workspaceSlug), { params: { entityType, entityId } })
            .then((r) => r.data),

    upload: (
        workspaceSlug: string,
        file: File,
        entityType: string,
        entityId: string,
        onProgress?: (pct: number) => void,
    ): Promise<FileAsset> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('entityType', entityType);
        formData.append('entityId', entityId);
        return apiClient
            .post<FileAsset>(`${base(workspaceSlug)}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: onProgress
                    ? (e: AxiosProgressEvent) => {
                          if (e.total) onProgress(Math.round((e.loaded * 100) / e.total));
                      }
                    : undefined,
            })
            .then((r) => r.data);
    },

    delete: (workspaceSlug: string, assetId: string): Promise<void> =>
        apiClient.delete(`${base(workspaceSlug)}/${assetId}`).then(() => undefined),
};
