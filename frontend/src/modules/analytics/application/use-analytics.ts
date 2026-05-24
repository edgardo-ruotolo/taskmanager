import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { CreateAnalyticViewData, ReportRequestPayload } from '../domain/types';
import { analyticsRepository } from '../infrastructure/analytics-repository';
import {
    type AnalyticsFiltersState,
    filtersToQueryKey,
    filtersToQueryString,
} from './filters-store';

export const useAnalyticsOverview = (workspaceSlug: string) =>
    useQuery({
        queryKey: ['analytics', 'overview', workspaceSlug],
        queryFn: () => analyticsRepository.getOverview(workspaceSlug),
        enabled: !!workspaceSlug,
        staleTime: 60_000,
    });

// Distribution chart hooks. queryKey includes `workspaceSlug` so changing
// workspace in the sidebar triggers a refetch automatically.
export const useIssuesByState = (workspaceSlug: string) =>
    useQuery({
        queryKey: ['analytics', workspaceSlug, 'by-state'] as const,
        queryFn: () => analyticsRepository.getIssuesByState(workspaceSlug),
        enabled: !!workspaceSlug,
        staleTime: 60_000,
    });

export const useIssuesByPriority = (workspaceSlug: string) =>
    useQuery({
        queryKey: ['analytics', workspaceSlug, 'by-priority'] as const,
        queryFn: () => analyticsRepository.getIssuesByPriority(workspaceSlug),
        enabled: !!workspaceSlug,
        staleTime: 60_000,
    });

export const useCreatedVsResolved = (workspaceSlug: string) =>
    useQuery({
        queryKey: ['analytics', workspaceSlug, 'created-vs-resolved'] as const,
        queryFn: () => analyticsRepository.getCreatedVsResolved(workspaceSlug),
        enabled: !!workspaceSlug,
        staleTime: 60_000,
    });

export const useProjectActivity = (workspaceSlug: string, projectIdentifier: string) =>
    useQuery({
        queryKey: ['analytics', workspaceSlug, 'project-activity', projectIdentifier] as const,
        queryFn: () => analyticsRepository.getProjectActivity(workspaceSlug, projectIdentifier),
        enabled: !!workspaceSlug && !!projectIdentifier,
        staleTime: 60_000,
    });

// Analytic Views hooks
export const useAnalyticViews = (workspaceSlug: string) =>
    useQuery({
        queryKey: ['analytics', workspaceSlug, 'views'],
        queryFn: () => analyticsRepository.getViews(workspaceSlug),
        enabled: !!workspaceSlug,
    });

export const useCreateAnalyticView = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateAnalyticViewData) =>
            analyticsRepository.createView(workspaceSlug, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: ['analytics', workspaceSlug, 'views'] });
            toast.success('Vista guardada');
        },
        onError: (error: unknown) => { const e = error as { response?: { data?: { message?: string } } }; toast.error(e?.response?.data?.message ?? 'Error al guardar la vista'); },
    });
};

export const useDeleteAnalyticView = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (viewId: string) => analyticsRepository.deleteView(workspaceSlug, viewId),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: ['analytics', workspaceSlug, 'views'] });
            toast.success('Vista eliminada');
        },
        onError: (error: unknown) => { const e = error as { response?: { data?: { message?: string } } }; toast.error(e?.response?.data?.message ?? 'Error al eliminar la vista'); },
    });
};

// Export hooks
export const useExports = (workspaceSlug: string, refetchInterval: number | false = false) =>
    useQuery({
        queryKey: ['exports', workspaceSlug],
        queryFn: () => analyticsRepository.getExports(workspaceSlug),
        enabled: !!workspaceSlug,
        refetchInterval,
    });

export const useDeleteExport = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (exportId: string) => analyticsRepository.deleteExport(workspaceSlug, exportId),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: ['exports', workspaceSlug] });
            toast.success('Reporte eliminado');
        },
        onError: () => {
            toast.error('No se pudo eliminar el reporte');
        },
    });
};

export const useCreateExport = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ format, filters }: { format: string; filters?: string }) =>
            analyticsRepository.createExport(workspaceSlug, format, filters),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: ['exports', workspaceSlug] });
            toast.success('Exportación iniciada. Recibirás el archivo cuando esté listo.');
        },
        onError: (error: unknown) => { const e = error as { response?: { data?: { message?: string } } }; toast.error(e?.response?.data?.message ?? 'Error al iniciar la exportación'); },
    });
};

// ── Admin analytics (filtered) ───────────────────────────────────────────

export const useGantt = (workspaceSlug: string, filters: AnalyticsFiltersState) =>
    useQuery({
        queryKey: ['analytics', workspaceSlug, 'gantt', filtersToQueryKey(filters)] as const,
        queryFn: () => analyticsRepository.getGantt(workspaceSlug, filtersToQueryString(filters)),
        enabled: !!workspaceSlug,
        staleTime: 30_000,
    });

export const useBurndown = (workspaceSlug: string, filters: AnalyticsFiltersState) =>
    useQuery({
        queryKey: ['analytics', workspaceSlug, 'burndown', filtersToQueryKey(filters)] as const,
        queryFn: () => analyticsRepository.getBurndown(workspaceSlug, filtersToQueryString(filters)),
        enabled: !!workspaceSlug,
        staleTime: 30_000,
    });

export const useDrilldown = (
    workspaceSlug: string,
    filters: AnalyticsFiltersState,
    page: number,
    pageSize: number,
    sortBy?: string,
    sortDesc?: boolean,
) =>
    useQuery({
        queryKey: [
            'analytics',
            workspaceSlug,
            'drilldown',
            filtersToQueryKey(filters),
            page,
            pageSize,
            sortBy ?? '',
            sortDesc ?? true,
        ] as const,
        queryFn: () =>
            analyticsRepository.getDrilldown(
                workspaceSlug,
                filtersToQueryString(filters),
                page,
                pageSize,
                sortBy,
                sortDesc,
            ),
        enabled: !!workspaceSlug,
        staleTime: 15_000,
    });

export const useUsersRanking = (workspaceSlug: string, filters: AnalyticsFiltersState) =>
    useQuery({
        queryKey: ['analytics', workspaceSlug, 'users-ranking', filtersToQueryKey(filters)] as const,
        queryFn: () =>
            analyticsRepository.getUsersRanking(workspaceSlug, filtersToQueryString(filters)),
        enabled: !!workspaceSlug,
        staleTime: 30_000,
    });

export const useClientsComparison = (workspaceSlug: string, filters: AnalyticsFiltersState) =>
    useQuery({
        queryKey: ['analytics', workspaceSlug, 'clients', filtersToQueryKey(filters)] as const,
        queryFn: () =>
            analyticsRepository.getClientsComparison(workspaceSlug, filtersToQueryString(filters)),
        enabled: !!workspaceSlug,
        staleTime: 30_000,
    });

export const useCreateReport = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({
            format,
            payload,
        }: {
            format: 'pdf' | 'xlsx' | 'csv' | 'json';
            payload: ReportRequestPayload;
        }) => analyticsRepository.createReport(workspaceSlug, format, payload),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: ['exports', workspaceSlug] });
            toast.success('Reporte en cola. Lo encontrarás en el historial cuando esté listo.');
        },
        onError: (error: unknown) => {
            const e = error as { response?: { data?: { message?: string } } };
            toast.error(e?.response?.data?.message ?? 'Error al generar el reporte');
        },
    });
};
