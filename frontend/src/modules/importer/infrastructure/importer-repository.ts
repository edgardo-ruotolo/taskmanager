import { apiClient } from '@/shared/lib/api-client';
import type { ImporterHistory } from '../domain/types';

export const importerRepository = {
    uploadCsv: (workspaceSlug: string, projectId: string, file: File): Promise<ImporterHistory> => {
        const formData = new FormData();
        formData.append('file', file);
        return apiClient
            .post<ImporterHistory>(
                `/api/workspaces/${workspaceSlug}/projects/${projectId}/importer/upload-csv`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } },
            )
            .then((r) => r.data);
    },
    getHistory: (workspaceSlug: string, projectId: string): Promise<ImporterHistory[]> =>
        apiClient
            .get<ImporterHistory[]>(
                `/api/workspaces/${workspaceSlug}/projects/${projectId}/importer/`,
            )
            .then((r) => r.data),
};
