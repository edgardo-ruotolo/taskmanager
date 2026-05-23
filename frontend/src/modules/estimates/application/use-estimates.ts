import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { FieldValues, UseFormSetError } from 'react-hook-form';
import { useServerMutation } from '@/shared/hooks/useServerMutation';
import { estimateRepository } from '../infrastructure/estimate-repository';
import type { CreateEstimateData, CreateEstimatePointData } from '../domain/types';

export const estimatesKey = (workspaceSlug: string, projectId: string) =>
    ['estimates', workspaceSlug, projectId] as const;

export const useEstimates = (workspaceSlug: string, projectId: string) =>
    useQuery({
        queryKey: estimatesKey(workspaceSlug, projectId),
        queryFn: () => estimateRepository.getAll(workspaceSlug, projectId),
        enabled: !!workspaceSlug && !!projectId,
    });

export const useCreateEstimate = <TFormValues extends FieldValues = FieldValues>(
    workspaceSlug: string,
    projectId: string,
    options?: { setError?: UseFormSetError<TFormValues> },
) => {
    const qc = useQueryClient();
    return useServerMutation<unknown, CreateEstimateData, TFormValues>({
        mutationFn: (data) =>
            estimateRepository.create(workspaceSlug, projectId, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: estimatesKey(workspaceSlug, projectId) });
            toast.success('Estimación creada');
        },
        setError: options?.setError,
        fallbackMessage: 'Error al crear la estimación',
    });
};

export const useDeleteEstimate = (workspaceSlug: string, projectId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (estimateId: string) =>
            estimateRepository.delete(workspaceSlug, projectId, estimateId),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: estimatesKey(workspaceSlug, projectId) });
            void qc.invalidateQueries({ queryKey: ['issues', workspaceSlug, projectId] });
            void qc.invalidateQueries({ queryKey: ['issue'] });
            toast.success('Estimación eliminada');
        },
        onError: () => toast.error('Error al eliminar la estimación'),
    });
};

export const useAddEstimatePoint = <TFormValues extends FieldValues = FieldValues>(
    workspaceSlug: string,
    projectId: string,
    estimateId: string,
    options?: { setError?: UseFormSetError<TFormValues> },
) => {
    const qc = useQueryClient();
    return useServerMutation<unknown, CreateEstimatePointData, TFormValues>({
        mutationFn: (data) =>
            estimateRepository.addPoint(workspaceSlug, projectId, estimateId, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: estimatesKey(workspaceSlug, projectId) });
            toast.success('Punto agregado');
        },
        setError: options?.setError,
        fallbackMessage: 'Error al agregar el punto',
    });
};

export const useDeleteEstimatePoint = (workspaceSlug: string, projectId: string, estimateId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (pointId: string) =>
            estimateRepository.deletePoint(workspaceSlug, projectId, estimateId, pointId),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: estimatesKey(workspaceSlug, projectId) });
            void qc.invalidateQueries({ queryKey: ['issues', workspaceSlug, projectId] });
            void qc.invalidateQueries({ queryKey: ['issue'] });
            toast.success('Punto eliminado');
        },
        onError: () => toast.error('Error al eliminar el punto'),
    });
};
