import { apiClient } from '@/shared/lib/api-client';
import type {
    AnalyticsOverview,
    AnalyticView,
    CreateAnalyticViewData,
    UpdateAnalyticViewData,
    ExporterHistory,
} from '../domain/types';

export const analyticsRepository = {
    getOverview: (workspaceSlug: string): Promise<AnalyticsOverview> =>
        apiClient
            .get<AnalyticsOverview>(`/api/workspaces/${workspaceSlug}/analytics/overview`)
            .then((r) => r.data),

    // Analytic Views
    getViews: (workspaceSlug: string): Promise<AnalyticView[]> =>
        apiClient
            .get<AnalyticView[]>(`/api/workspaces/${workspaceSlug}/analytics/views`)
            .then((r) => r.data),

    createView: (workspaceSlug: string, data: CreateAnalyticViewData): Promise<AnalyticView> =>
        apiClient
            .post<AnalyticView>(`/api/workspaces/${workspaceSlug}/analytics/views`, data)
            .then((r) => r.data),

    updateView: (
        workspaceSlug: string,
        viewId: string,
        data: UpdateAnalyticViewData,
    ): Promise<AnalyticView> =>
        apiClient
            .patch<AnalyticView>(
                `/api/workspaces/${workspaceSlug}/analytics/views/${viewId}`,
                data,
            )
            .then((r) => r.data),

    deleteView: (workspaceSlug: string, viewId: string): Promise<void> =>
        apiClient
            .delete(`/api/workspaces/${workspaceSlug}/analytics/views/${viewId}`)
            .then(() => undefined),

    // Exports
    getExports: (workspaceSlug: string): Promise<ExporterHistory[]> =>
        apiClient
            .get<ExporterHistory[]>(`/api/workspaces/${workspaceSlug}/exports`)
            .then((r) => r.data),

    createExport: (
        workspaceSlug: string,
        format: string,
        filters?: string,
    ): Promise<ExporterHistory> =>
        apiClient
            .post<ExporterHistory>(`/api/workspaces/${workspaceSlug}/exports`, { format, filters })
            .then((r) => r.data),

    getExportDownloadUrl: (workspaceSlug: string, exportId: string): string =>
        `/api/workspaces/${workspaceSlug}/exports/${exportId}/download`,
};
