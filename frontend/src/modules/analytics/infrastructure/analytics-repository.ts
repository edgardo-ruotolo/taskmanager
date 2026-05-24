import { apiClient } from '@/shared/lib/api-client';
import type { PagedResult } from '@/shared/types/pagination';
import type {
    AnalyticsOverview,
    AnalyticView,
    BurndownPoint,
    ClientComparisonDto,
    ProjectActivityPoint,
    CreateAnalyticViewData,
    CreatedVsResolvedPoint,
    IssueGanttDto,
    IssueRowDto,
    PriorityBucket,
    StateBucket,
    UpdateAnalyticViewData,
    UserRankingDto,
    ExporterHistory,
    ReportRequestPayload,
} from '../domain/types';

export const analyticsRepository = {
    getOverview: (workspaceSlug: string): Promise<AnalyticsOverview> =>
        apiClient
            .get<AnalyticsOverview>(`/api/workspaces/${workspaceSlug}/analytics/overview`)
            .then((r) => r.data),

    getIssuesByState: (workspaceSlug: string): Promise<StateBucket[]> =>
        apiClient
            .get<StateBucket[]>(`/api/workspaces/${workspaceSlug}/analytics/issues-by-state`)
            .then((r) => r.data),

    getIssuesByPriority: (workspaceSlug: string): Promise<PriorityBucket[]> =>
        apiClient
            .get<PriorityBucket[]>(`/api/workspaces/${workspaceSlug}/analytics/issues-by-priority`)
            .then((r) => r.data),

    getCreatedVsResolved: (workspaceSlug: string): Promise<CreatedVsResolvedPoint[]> =>
        apiClient
            .get<CreatedVsResolvedPoint[]>(`/api/workspaces/${workspaceSlug}/analytics/created-vs-resolved`)
            .then((r) => r.data),

    getProjectActivity: (
        workspaceSlug: string,
        projectIdentifier: string,
    ): Promise<ProjectActivityPoint[]> =>
        apiClient
            .get<ProjectActivityPoint[]>(
                `/api/workspaces/${workspaceSlug}/analytics/projects/${projectIdentifier}/activity`,
            )
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

    deleteExport: (workspaceSlug: string, exportId: string): Promise<void> =>
        apiClient
            .delete(`/api/workspaces/${workspaceSlug}/exports/${exportId}`)
            .then(() => undefined),

    // ── Admin analytics (filtered) ───────────────────────────────────────

    getGantt: (workspaceSlug: string, query: string): Promise<IssueGanttDto[]> =>
        apiClient
            .get<IssueGanttDto[]>(
                `/api/workspaces/${workspaceSlug}/analytics/gantt${query ? `?${query}` : ''}`,
            )
            .then((r) => r.data),

    getBurndown: (workspaceSlug: string, query: string): Promise<BurndownPoint[]> =>
        apiClient
            .get<BurndownPoint[]>(
                `/api/workspaces/${workspaceSlug}/analytics/burndown${query ? `?${query}` : ''}`,
            )
            .then((r) => r.data),

    getDrilldown: (
        workspaceSlug: string,
        query: string,
        page: number,
        pageSize: number,
        sortBy?: string,
        sortDesc?: boolean,
    ): Promise<PagedResult<IssueRowDto>> => {
        const params = new URLSearchParams(query);
        params.set('page', String(page));
        params.set('pageSize', String(pageSize));
        if (sortBy) params.set('sortBy', sortBy);
        if (typeof sortDesc === 'boolean') params.set('sortDesc', String(sortDesc));
        return apiClient
            .get<PagedResult<IssueRowDto>>(
                `/api/workspaces/${workspaceSlug}/analytics/drilldown?${params.toString()}`,
            )
            .then((r) => r.data);
    },

    getUsersRanking: (workspaceSlug: string, query: string): Promise<UserRankingDto[]> =>
        apiClient
            .get<UserRankingDto[]>(
                `/api/workspaces/${workspaceSlug}/analytics/users-ranking${query ? `?${query}` : ''}`,
            )
            .then((r) => r.data),

    getClientsComparison: (workspaceSlug: string, query: string): Promise<ClientComparisonDto[]> =>
        apiClient
            .get<ClientComparisonDto[]>(
                `/api/workspaces/${workspaceSlug}/analytics/clients${query ? `?${query}` : ''}`,
            )
            .then((r) => r.data),

    createReport: (
        workspaceSlug: string,
        format: 'pdf' | 'xlsx' | 'csv' | 'json',
        payload: ReportRequestPayload,
    ): Promise<ExporterHistory> =>
        apiClient
            .post<ExporterHistory>(`/api/workspaces/${workspaceSlug}/exports`, {
                format,
                filters: JSON.stringify(payload),
            })
            .then((r) => r.data),
};
