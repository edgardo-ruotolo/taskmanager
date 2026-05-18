import { apiClient } from '@/shared/lib/api-client';
import type { Estimate, CreateEstimateData, EstimatePoint, CreateEstimatePointData } from '../domain/types';

export const estimateRepository = {
    getAll: (workspaceSlug: string, companyId: string): Promise<Estimate[]> =>
        apiClient
            .get<Estimate[]>(`/api/workspaces/${workspaceSlug}/companies/${companyId}/estimates`)
            .then((r) => r.data),

    getById: (workspaceSlug: string, companyId: string, estimateId: string): Promise<Estimate> =>
        apiClient
            .get<Estimate>(`/api/workspaces/${workspaceSlug}/companies/${companyId}/estimates/${estimateId}`)
            .then((r) => r.data),

    create: (workspaceSlug: string, companyId: string, data: CreateEstimateData): Promise<Estimate> =>
        apiClient
            .post<Estimate>(`/api/workspaces/${workspaceSlug}/companies/${companyId}/estimates`, data)
            .then((r) => r.data),

    delete: (workspaceSlug: string, companyId: string, estimateId: string): Promise<void> =>
        apiClient
            .delete(`/api/workspaces/${workspaceSlug}/companies/${companyId}/estimates/${estimateId}`)
            .then(() => undefined),

    addPoint: (
        workspaceSlug: string,
        companyId: string,
        estimateId: string,
        data: CreateEstimatePointData,
    ): Promise<EstimatePoint> =>
        apiClient
            .post<EstimatePoint>(
                `/api/workspaces/${workspaceSlug}/companies/${companyId}/estimates/${estimateId}/points`,
                data,
            )
            .then((r) => r.data),

    deletePoint: (
        workspaceSlug: string,
        companyId: string,
        estimateId: string,
        pointId: string,
    ): Promise<void> =>
        apiClient
            .delete(
                `/api/workspaces/${workspaceSlug}/companies/${companyId}/estimates/${estimateId}/points/${pointId}`,
            )
            .then(() => undefined),
};
