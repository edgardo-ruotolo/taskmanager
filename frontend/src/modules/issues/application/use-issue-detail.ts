import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as issueRepo from '@/modules/issues/infrastructure/issue-repository';
import type {
    CreateCommentData,
    CreateReactionData,
    CreateIssueLinkData,
    CreateIssueRelationData,
} from '@/modules/issues/domain/types';
import { realtimeQueryOptions } from './query-options';

export const commentsKey = (workspaceSlug: string, projectId: string, issueId: string) =>
    ['comments', workspaceSlug, projectId, issueId] as const;

export const reactionsKey = (workspaceSlug: string, projectId: string, issueId: string) =>
    ['reactions', workspaceSlug, projectId, issueId] as const;

export const activitiesKey = (workspaceSlug: string, projectId: string, issueId: string) =>
    ['activities', workspaceSlug, projectId, issueId] as const;

export const issueDetailKey = (workspaceSlug: string, projectId: string, issueId: string) =>
    ['issue', workspaceSlug, projectId, issueId] as const;

export const useIssueDetail = (workspaceSlug: string, projectId: string, issueId: string) =>
    useQuery({
        queryKey: issueDetailKey(workspaceSlug, projectId, issueId),
        queryFn: () => issueRepo.issueRepository.getById(workspaceSlug, projectId, issueId),
        enabled: !!workspaceSlug && !!projectId && !!issueId,
        ...realtimeQueryOptions,
    });

export const useComments = (workspaceSlug: string, projectId: string, issueId: string) =>
    useQuery({
        queryKey: commentsKey(workspaceSlug, projectId, issueId),
        queryFn: () => issueRepo.getComments(workspaceSlug, projectId, issueId),
        enabled: !!workspaceSlug && !!projectId && !!issueId,
        ...realtimeQueryOptions,
    });

export const useCreateComment = (workspaceSlug: string, projectId: string, issueId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateCommentData) =>
            issueRepo.createComment(workspaceSlug, projectId, issueId, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: commentsKey(workspaceSlug, projectId, issueId) });
            void qc.invalidateQueries({ queryKey: activitiesKey(workspaceSlug, projectId, issueId) });
            toast.success('Comentario agregado');
        },
        onError: (error: unknown) => { const axiosErr = error as { response?: { data?: { message?: string } } }; toast.error(axiosErr?.response?.data?.message ?? 'Error al agregar el comentario'); },
    });
};

export const useUpdateComment = (workspaceSlug: string, projectId: string, issueId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ commentId, body }: { commentId: string; body: string }) =>
            issueRepo.updateComment(workspaceSlug, projectId, issueId, commentId, { body }),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: commentsKey(workspaceSlug, projectId, issueId) });
            toast.success('Comentario actualizado');
        },
        onError: (err: unknown) => { const e = err as { response?: { data?: { message?: string } } }; toast.error(e?.response?.data?.message ?? 'Error al actualizar el comentario'); },
    });
};

export const useDeleteComment = (workspaceSlug: string, projectId: string, issueId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (commentId: string) =>
            issueRepo.deleteComment(workspaceSlug, projectId, issueId, commentId),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: commentsKey(workspaceSlug, projectId, issueId) });
            void qc.invalidateQueries({ queryKey: activitiesKey(workspaceSlug, projectId, issueId) });
            toast.success('Comentario eliminado');
        },
        onError: (error: unknown) => { const axiosErr = error as { response?: { data?: { message?: string } } }; toast.error(axiosErr?.response?.data?.message ?? 'Error al eliminar el comentario'); },
    });
};

export const useReactions = (workspaceSlug: string, projectId: string, issueId: string) =>
    useQuery({
        queryKey: reactionsKey(workspaceSlug, projectId, issueId),
        queryFn: () => issueRepo.getReactions(workspaceSlug, projectId, issueId),
        enabled: !!workspaceSlug && !!projectId && !!issueId,
        ...realtimeQueryOptions,
    });

export const useAddReaction = (workspaceSlug: string, projectId: string, issueId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateReactionData) =>
            issueRepo.addReaction(workspaceSlug, projectId, issueId, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: reactionsKey(workspaceSlug, projectId, issueId) });
            void qc.invalidateQueries({ queryKey: activitiesKey(workspaceSlug, projectId, issueId) });
        },
        onError: (error: unknown) => { const axiosErr = error as { response?: { data?: { message?: string } } }; toast.error(axiosErr?.response?.data?.message ?? 'Error al agregar la reacción'); },
    });
};

export const useRemoveReaction = (workspaceSlug: string, projectId: string, issueId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (emoji: string) =>
            issueRepo.removeReaction(workspaceSlug, projectId, issueId, emoji),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: reactionsKey(workspaceSlug, projectId, issueId) });
            void qc.invalidateQueries({ queryKey: activitiesKey(workspaceSlug, projectId, issueId) });
        },
        onError: (error: unknown) => { const axiosErr = error as { response?: { data?: { message?: string } } }; toast.error(axiosErr?.response?.data?.message ?? 'Error al quitar la reacción'); },
    });
};

export const useActivities = (workspaceSlug: string, projectId: string, issueId: string) =>
    useQuery({
        queryKey: activitiesKey(workspaceSlug, projectId, issueId),
        queryFn: () => issueRepo.getActivities(workspaceSlug, projectId, issueId),
        enabled: !!workspaceSlug && !!projectId && !!issueId,
        ...realtimeQueryOptions,
    });

// Subscribers
export const subscribersKey = (workspaceSlug: string, projectId: string, issueId: string) =>
    ['issue-subscribers', workspaceSlug, projectId, issueId] as const;

export const useSubscribers = (workspaceSlug: string, projectId: string, issueId: string) =>
    useQuery({
        queryKey: subscribersKey(workspaceSlug, projectId, issueId),
        queryFn: () => issueRepo.getSubscribers(workspaceSlug, projectId, issueId),
        enabled: !!workspaceSlug && !!projectId && !!issueId,
        ...realtimeQueryOptions,
    });

export const useSubscribe = (workspaceSlug: string, projectId: string, issueId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => issueRepo.subscribe(workspaceSlug, projectId, issueId),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: subscribersKey(workspaceSlug, projectId, issueId) });
            void qc.invalidateQueries({ queryKey: issueDetailKey(workspaceSlug, projectId, issueId) });
            void qc.invalidateQueries({ queryKey: activitiesKey(workspaceSlug, projectId, issueId) });
            toast.success('Suscrito a la tarea');
        },
        onError: (error: unknown) => { const axiosErr = error as { response?: { data?: { message?: string } } }; toast.error(axiosErr?.response?.data?.message ?? 'Error al suscribirse'); },
    });
};

export const useUnsubscribe = (workspaceSlug: string, projectId: string, issueId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => issueRepo.unsubscribe(workspaceSlug, projectId, issueId),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: subscribersKey(workspaceSlug, projectId, issueId) });
            void qc.invalidateQueries({ queryKey: issueDetailKey(workspaceSlug, projectId, issueId) });
            void qc.invalidateQueries({ queryKey: activitiesKey(workspaceSlug, projectId, issueId) });
            toast.success('Desuscrito de la tarea');
        },
        onError: (error: unknown) => { const axiosErr = error as { response?: { data?: { message?: string } } }; toast.error(axiosErr?.response?.data?.message ?? 'Error al desuscribirse'); },
    });
};

// Links
export const linksKey = (workspaceSlug: string, projectId: string, issueId: string) =>
    ['issue-links', workspaceSlug, projectId, issueId] as const;

export const useIssueLinks = (workspaceSlug: string, projectId: string, issueId: string) =>
    useQuery({
        queryKey: linksKey(workspaceSlug, projectId, issueId),
        queryFn: () => issueRepo.getLinks(workspaceSlug, projectId, issueId),
        enabled: !!workspaceSlug && !!projectId && !!issueId,
        ...realtimeQueryOptions,
    });

export const useCreateIssueLink = (workspaceSlug: string, projectId: string, issueId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateIssueLinkData) =>
            issueRepo.createLink(workspaceSlug, projectId, issueId, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: linksKey(workspaceSlug, projectId, issueId) });
            void qc.invalidateQueries({ queryKey: issueDetailKey(workspaceSlug, projectId, issueId) });
            void qc.invalidateQueries({ queryKey: activitiesKey(workspaceSlug, projectId, issueId) });
            toast.success('Enlace agregado');
        },
        onError: (error: unknown) => { const axiosErr = error as { response?: { data?: { message?: string } } }; toast.error(axiosErr?.response?.data?.message ?? 'Error al agregar el enlace'); },
    });
};

export const useDeleteIssueLink = (workspaceSlug: string, projectId: string, issueId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (linkId: string) =>
            issueRepo.deleteLink(workspaceSlug, projectId, issueId, linkId),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: linksKey(workspaceSlug, projectId, issueId) });
            void qc.invalidateQueries({ queryKey: issueDetailKey(workspaceSlug, projectId, issueId) });
            void qc.invalidateQueries({ queryKey: activitiesKey(workspaceSlug, projectId, issueId) });
            toast.success('Enlace eliminado');
        },
        onError: (error: unknown) => { const axiosErr = error as { response?: { data?: { message?: string } } }; toast.error(axiosErr?.response?.data?.message ?? 'Error al eliminar el enlace'); },
    });
};

// Relations
export const relationsKey = (workspaceSlug: string, projectId: string, issueId: string) =>
    ['issue-relations', workspaceSlug, projectId, issueId] as const;

export const useIssueRelations = (workspaceSlug: string, projectId: string, issueId: string) =>
    useQuery({
        queryKey: relationsKey(workspaceSlug, projectId, issueId),
        queryFn: () => issueRepo.getRelations(workspaceSlug, projectId, issueId),
        enabled: !!workspaceSlug && !!projectId && !!issueId,
        ...realtimeQueryOptions,
    });

export const useCreateIssueRelation = (workspaceSlug: string, projectId: string, issueId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateIssueRelationData) =>
            issueRepo.createRelation(workspaceSlug, projectId, issueId, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: relationsKey(workspaceSlug, projectId, issueId) });
            void qc.invalidateQueries({ queryKey: issueDetailKey(workspaceSlug, projectId, issueId) });
            void qc.invalidateQueries({ queryKey: activitiesKey(workspaceSlug, projectId, issueId) });
            void qc.invalidateQueries({ queryKey: ['issue-relations'] });
            toast.success('Relación agregada');
        },
        onError: (error: unknown) => { const axiosErr = error as { response?: { data?: { message?: string } } }; toast.error(axiosErr?.response?.data?.message ?? 'Error al agregar la relación'); },
    });
};

export const useDeleteIssueRelation = (workspaceSlug: string, projectId: string, issueId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (relationId: string) =>
            issueRepo.deleteRelation(workspaceSlug, projectId, issueId, relationId),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: relationsKey(workspaceSlug, projectId, issueId) });
            void qc.invalidateQueries({ queryKey: issueDetailKey(workspaceSlug, projectId, issueId) });
            void qc.invalidateQueries({ queryKey: activitiesKey(workspaceSlug, projectId, issueId) });
            void qc.invalidateQueries({ queryKey: ['issue-relations'] });
            toast.success('Relación eliminada');
        },
        onError: (error: unknown) => { const axiosErr = error as { response?: { data?: { message?: string } } }; toast.error(axiosErr?.response?.data?.message ?? 'Error al eliminar la relación'); },
    });
};
