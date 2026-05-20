import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { CreateAnalyticViewData } from '../domain/types';
import { analyticsRepository } from '../infrastructure/analytics-repository';

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

export const useCompanyActivity = (workspaceSlug: string, companyIdentifier: string) =>
    useQuery({
        queryKey: ['analytics', workspaceSlug, 'company-activity', companyIdentifier] as const,
        queryFn: () => analyticsRepository.getCompanyActivity(workspaceSlug, companyIdentifier),
        enabled: !!workspaceSlug && !!companyIdentifier,
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
export const useExports = (workspaceSlug: string) =>
    useQuery({
        queryKey: ['exports', workspaceSlug],
        queryFn: () => analyticsRepository.getExports(workspaceSlug),
        enabled: !!workspaceSlug,
    });

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
