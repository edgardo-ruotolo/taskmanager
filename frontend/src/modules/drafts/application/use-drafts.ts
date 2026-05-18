import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { draftsRepository } from '../infrastructure/drafts-repository';
import type { CreateDraftIssueData, UpdateDraftIssueData } from '../domain/types';

const listKey = (workspaceSlug: string): readonly ['drafts', string] =>
    ['drafts', workspaceSlug] as const;

export const useDrafts = (workspaceSlug: string) =>
    useQuery({
        queryKey: listKey(workspaceSlug),
        queryFn: () => draftsRepository.getAll(workspaceSlug),
        enabled: !!workspaceSlug,
    });

export const useCreateDraft = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateDraftIssueData) => draftsRepository.create(workspaceSlug, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: listKey(workspaceSlug) });
            toast.success('Borrador creado');
        },
        onError: () => toast.error('Error al crear el borrador'),
    });
};

export const useUpdateDraft = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateDraftIssueData }) =>
            draftsRepository.update(workspaceSlug, id, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: listKey(workspaceSlug) });
        },
        onError: () => toast.error('Error al actualizar el borrador'),
    });
};

export const useDeleteDraft = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => draftsRepository.delete(workspaceSlug, id),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: listKey(workspaceSlug) });
            toast.success('Borrador eliminado');
        },
        onError: () => toast.error('Error al eliminar el borrador'),
    });
};

export const usePublishDraft = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => draftsRepository.publish(workspaceSlug, id),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: listKey(workspaceSlug) });
            toast.success('Borrador publicado como tarea');
        },
        onError: () => toast.error('Error al publicar el borrador'),
    });
};
