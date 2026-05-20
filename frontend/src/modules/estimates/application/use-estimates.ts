import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { FieldValues, UseFormSetError } from 'react-hook-form';
import { useServerMutation } from '@/shared/hooks/useServerMutation';
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

export const useCreateEstimate = <TFormValues extends FieldValues = FieldValues>(
    workspaceSlug: string,
    companyId: string,
    options?: { setError?: UseFormSetError<TFormValues> },
) => {
    const qc = useQueryClient();
    return useServerMutation<unknown, CreateEstimateData, TFormValues>({
        mutationFn: (data) =>
            estimateRepository.create(workspaceSlug, companyId, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: estimatesKey(workspaceSlug, companyId) });
            toast.success('Estimación creada');
        },
        setError: options?.setError,
        fallbackMessage: 'Error al crear la estimación',
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

export const useAddEstimatePoint = <TFormValues extends FieldValues = FieldValues>(
    workspaceSlug: string,
    companyId: string,
    estimateId: string,
    options?: { setError?: UseFormSetError<TFormValues> },
) => {
    const qc = useQueryClient();
    return useServerMutation<unknown, CreateEstimatePointData, TFormValues>({
        mutationFn: (data) =>
            estimateRepository.addPoint(workspaceSlug, companyId, estimateId, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: estimatesKey(workspaceSlug, companyId) });
            toast.success('Punto agregado');
        },
        setError: options?.setError,
        fallbackMessage: 'Error al agregar el punto',
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
