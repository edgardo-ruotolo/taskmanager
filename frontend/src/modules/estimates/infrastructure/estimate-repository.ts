import { apiClient } from '@/shared/lib/api-client';
import type { Estimate, CreateEstimateData, EstimatePoint, CreateEstimatePointData } from '../domain/types';

export const estimateRepository = {
    getAll: (workspaceSlug: string, projectId: string): Promise<Estimate[]> =>
        apiClient
            .get<Estimate[]>(`/api/workspaces/${workspaceSlug}/projects/${projectId}/estimates`)
            .then((r) => r.data),

    getById: (workspaceSlug: string, projectId: string, estimateId: string): Promise<Estimate> =>
        apiClient
            .get<Estimate>(`/api/workspaces/${workspaceSlug}/projects/${projectId}/estimates/${estimateId}`)
            .then((r) => r.data),

    create: (workspaceSlug: string, projectId: string, data: CreateEstimateData): Promise<Estimate> =>
        apiClient
            .post<Estimate>(`/api/workspaces/${workspaceSlug}/projects/${projectId}/estimates`, data)
            .then((r) => r.data),

    delete: (workspaceSlug: string, projectId: string, estimateId: string): Promise<void> =>
        apiClient
            .delete(`/api/workspaces/${workspaceSlug}/projects/${projectId}/estimates/${estimateId}`)
            .then(() => undefined),

    addPoint: (
        workspaceSlug: string,
        projectId: string,
        estimateId: string,
        data: CreateEstimatePointData,
    ): Promise<EstimatePoint> =>
        apiClient
            .post<EstimatePoint>(
                `/api/workspaces/${workspaceSlug}/projects/${projectId}/estimates/${estimateId}/points`,
                data,
            )
            .then((r) => r.data),

    deletePoint: (
        workspaceSlug: string,
        projectId: string,
        estimateId: string,
        pointId: string,
    ): Promise<void> =>
        apiClient
            .delete(
                `/api/workspaces/${workspaceSlug}/projects/${projectId}/estimates/${estimateId}/points/${pointId}`,
            )
            .then(() => undefined),
};
