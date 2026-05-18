import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { labelRepository } from '../infrastructure/label-repository';
import type { CreateLabelData } from '../domain/types';

export const labelsKey = (workspaceSlug: string) =>
    ['labels', workspaceSlug] as const;

export const useLabels = (workspaceSlug: string) =>
    useQuery({
        queryKey: labelsKey(workspaceSlug),
        queryFn: () => labelRepository.getAll(workspaceSlug),
        enabled: !!workspaceSlug,
    });

export const useCreateLabel = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateLabelData) =>
            labelRepository.create(workspaceSlug, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: labelsKey(workspaceSlug) });
            toast.success('Etiqueta creada');
        },
        onError: () => toast.error('Error al crear la etiqueta'),
    });
};

export const useDeleteLabel = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (labelId: string) =>
            labelRepository.delete(workspaceSlug, labelId),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: labelsKey(workspaceSlug) });
            void qc.invalidateQueries({ queryKey: ['issues'] });
            void qc.invalidateQueries({ queryKey: ['cycle-issues'] });
            void qc.invalidateQueries({ queryKey: ['module-issues'] });
            void qc.invalidateQueries({ queryKey: ['issue'] });
            toast.success('Etiqueta eliminada');
        },
        onError: () => toast.error('Error al eliminar la etiqueta'),
    });
};
