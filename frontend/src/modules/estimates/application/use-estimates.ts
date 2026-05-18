import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { estimateRepository } from '../infrastructure/estimate-repository';
import type { CreateEstimateData, CreateEstimatePointData } from '../domain/types';

export const estimatesKey = (workspaceSlug: string, companyId: string) =>
    ['estimates', workspaceSlug, companyId] as const;

export const useEstimates = (workspaceSlug: string, companyId: string) =>
    useQuery({
        queryKey: estimatesKey(workspaceSlug, companyId),
        queryFn: () => estimateRepository.getAll(workspaceSlug, companyId),
        enabled: !!workspaceSlug && !!companyId,
    });

export const useCreateEstimate = (workspaceSlug: string, companyId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateEstimateData) =>
            estimateRepository.create(workspaceSlug, companyId, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: estimatesKey(workspaceSlug, companyId) });
            toast.success('Estimación creada');
        },
        onError: () => toast.error('Error al crear la estimación'),
    });
};

export const useDeleteEstimate = (workspaceSlug: string, companyId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (estimateId: string) =>
            estimateRepository.delete(workspaceSlug, companyId, estimateId),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: estimatesKey(workspaceSlug, companyId) });
            void qc.invalidateQueries({ queryKey: ['issues', workspaceSlug, companyId] });
            void qc.invalidateQueries({ queryKey: ['issue'] });
            toast.success('Estimación eliminada');
        },
        onError: () => toast.error('Error al eliminar la estimación'),
    });
};

export const useAddEstimatePoint = (workspaceSlug: string, companyId: string, estimateId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateEstimatePointData) =>
            estimateRepository.addPoint(workspaceSlug, companyId, estimateId, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: estimatesKey(workspaceSlug, companyId) });
            toast.success('Punto agregado');
        },
        onError: () => toast.error('Error al agregar el punto'),
    });
};

export const useDeleteEstimatePoint = (workspaceSlug: string, companyId: string, estimateId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (pointId: string) =>
            estimateRepository.deletePoint(workspaceSlug, companyId, estimateId, pointId),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: estimatesKey(workspaceSlug, companyId) });
            void qc.invalidateQueries({ queryKey: ['issues', workspaceSlug, companyId] });
            void qc.invalidateQueries({ queryKey: ['issue'] });
            toast.success('Punto eliminado');
        },
        onError: () => toast.error('Error al eliminar el punto'),
    });
};
