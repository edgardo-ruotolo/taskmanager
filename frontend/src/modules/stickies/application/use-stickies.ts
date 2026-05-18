import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { stickiesRepository } from '../infrastructure/stickies-repository';
import type { CreateStickyData, UpdateStickyData } from '../domain/types';

const listKey = (workspaceSlug: string) => ['stickies', workspaceSlug] as const;

export const useStickies = (workspaceSlug: string) =>
    useQuery({
        queryKey: listKey(workspaceSlug),
        queryFn: () => stickiesRepository.getAll(workspaceSlug),
        enabled: !!workspaceSlug,
    });

export const useCreateSticky = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateStickyData) => stickiesRepository.create(workspaceSlug, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: listKey(workspaceSlug) });
        },
        onError: () => toast.error('Error al crear la nota'),
    });
};

export const useUpdateSticky = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateStickyData }) =>
            stickiesRepository.update(workspaceSlug, id, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: listKey(workspaceSlug) });
        },
        onError: () => toast.error('Error al actualizar la nota'),
    });
};

export const useDeleteSticky = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => stickiesRepository.delete(workspaceSlug, id),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: listKey(workspaceSlug) });
            toast.success('Nota eliminada');
        },
        onError: () => toast.error('Error al eliminar la nota'),
    });
};

export const useReorderStickies = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (orderedIds: string[]) => stickiesRepository.reorder(workspaceSlug, orderedIds),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: listKey(workspaceSlug) });
        },
        onError: () => toast.error('Error al reordenar las notas'),
    });
};
