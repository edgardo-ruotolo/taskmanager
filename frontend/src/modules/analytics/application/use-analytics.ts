import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { CreateAnalyticViewData } from '../domain/types';
import { analyticsRepository } from '../infrastructure/analytics-repository';

export const useAnalyticsOverview = (workspaceSlug: string) =>
    useQuery({
        queryKey: ['analytics', 'overview', workspaceSlug],
        queryFn: () => analyticsRepository.getOverview(workspaceSlug),
        enabled: !!workspaceSlug,
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
        onError: () => toast.error('Error al guardar la vista'),
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
        onError: () => toast.error('Error al eliminar la vista'),
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
        onError: () => toast.error('Error al iniciar la exportación'),
    });
};
