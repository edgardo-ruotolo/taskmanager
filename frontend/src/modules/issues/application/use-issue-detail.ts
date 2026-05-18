import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as issueRepo from '@/modules/issues/infrastructure/issue-repository';
import type {
    CreateCommentData,
    CreateReactionData,
    CreateIssueLinkData,
    CreateIssueRelationData,
} from '@/modules/issues/domain/types';

export const commentsKey = (workspaceSlug: string, companyId: string, issueId: string) =>
    ['comments', workspaceSlug, companyId, issueId] as const;

export const reactionsKey = (workspaceSlug: string, companyId: string, issueId: string) =>
    ['reactions', workspaceSlug, companyId, issueId] as const;

export const activitiesKey = (workspaceSlug: string, companyId: string, issueId: string) =>
    ['activities', workspaceSlug, companyId, issueId] as const;

export const issueDetailKey = (workspaceSlug: string, companyId: string, issueId: string) =>
    ['issue', workspaceSlug, companyId, issueId] as const;

export const useIssueDetail = (workspaceSlug: string, companyId: string, issueId: string) =>
    useQuery({
        queryKey: issueDetailKey(workspaceSlug, companyId, issueId),
        queryFn: () => issueRepo.issueRepository.getById(workspaceSlug, companyId, issueId),
        enabled: !!workspaceSlug && !!companyId && !!issueId,
    });

export const useComments = (workspaceSlug: string, companyId: string, issueId: string) =>
    useQuery({
        queryKey: commentsKey(workspaceSlug, companyId, issueId),
        queryFn: () => issueRepo.getComments(workspaceSlug, companyId, issueId),
        enabled: !!workspaceSlug && !!companyId && !!issueId,
    });

export const useCreateComment = (workspaceSlug: string, companyId: string, issueId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateCommentData) =>
            issueRepo.createComment(workspaceSlug, companyId, issueId, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: commentsKey(workspaceSlug, companyId, issueId) });
            void qc.invalidateQueries({ queryKey: activitiesKey(workspaceSlug, companyId, issueId) });
            toast.success('Comentario agregado');
        },
        onError: () => toast.error('Error al agregar el comentario'),
    });
};

export const useDeleteComment = (workspaceSlug: string, companyId: string, issueId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (commentId: string) =>
            issueRepo.deleteComment(workspaceSlug, companyId, issueId, commentId),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: commentsKey(workspaceSlug, companyId, issueId) });
            void qc.invalidateQueries({ queryKey: activitiesKey(workspaceSlug, companyId, issueId) });
            toast.success('Comentario eliminado');
        },
        onError: () => toast.error('Error al eliminar el comentario'),
    });
};

export const useReactions = (workspaceSlug: string, companyId: string, issueId: string) =>
    useQuery({
        queryKey: reactionsKey(workspaceSlug, companyId, issueId),
        queryFn: () => issueRepo.getReactions(workspaceSlug, companyId, issueId),
        enabled: !!workspaceSlug && !!companyId && !!issueId,
    });

export const useAddReaction = (workspaceSlug: string, companyId: string, issueId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateReactionData) =>
            issueRepo.addReaction(workspaceSlug, companyId, issueId, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: reactionsKey(workspaceSlug, companyId, issueId) });
            void qc.invalidateQueries({ queryKey: activitiesKey(workspaceSlug, companyId, issueId) });
        },
        onError: () => toast.error('Error al agregar la reacción'),
    });
};

export const useRemoveReaction = (workspaceSlug: string, companyId: string, issueId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (emoji: string) =>
            issueRepo.removeReaction(workspaceSlug, companyId, issueId, emoji),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: reactionsKey(workspaceSlug, companyId, issueId) });
            void qc.invalidateQueries({ queryKey: activitiesKey(workspaceSlug, companyId, issueId) });
        },
        onError: () => toast.error('Error al quitar la reacción'),
    });
};

export const useActivities = (workspaceSlug: string, companyId: string, issueId: string) =>
    useQuery({
        queryKey: activitiesKey(workspaceSlug, companyId, issueId),
        queryFn: () => issueRepo.getActivities(workspaceSlug, companyId, issueId),
        enabled: !!workspaceSlug && !!companyId && !!issueId,
    });

// Subscribers
export const subscribersKey = (workspaceSlug: string, companyId: string, issueId: string) =>
    ['issue-subscribers', workspaceSlug, companyId, issueId] as const;

export const useSubscribers = (workspaceSlug: string, companyId: string, issueId: string) =>
    useQuery({
        queryKey: subscribersKey(workspaceSlug, companyId, issueId),
        queryFn: () => issueRepo.getSubscribers(workspaceSlug, companyId, issueId),
        enabled: !!workspaceSlug && !!companyId && !!issueId,
    });

export const useSubscribe = (workspaceSlug: string, companyId: string, issueId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => issueRepo.subscribe(workspaceSlug, companyId, issueId),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: subscribersKey(workspaceSlug, companyId, issueId) });
            void qc.invalidateQueries({ queryKey: issueDetailKey(workspaceSlug, companyId, issueId) });
            void qc.invalidateQueries({ queryKey: activitiesKey(workspaceSlug, companyId, issueId) });
            toast.success('Suscrito a la tarea');
        },
        onError: () => toast.error('Error al suscribirse'),
    });
};

export const useUnsubscribe = (workspaceSlug: string, companyId: string, issueId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => issueRepo.unsubscribe(workspaceSlug, companyId, issueId),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: subscribersKey(workspaceSlug, companyId, issueId) });
            void qc.invalidateQueries({ queryKey: issueDetailKey(workspaceSlug, companyId, issueId) });
            void qc.invalidateQueries({ queryKey: activitiesKey(workspaceSlug, companyId, issueId) });
            toast.success('Desuscrito de la tarea');
        },
        onError: () => toast.error('Error al desuscribirse'),
    });
};

// Links
export const linksKey = (workspaceSlug: string, companyId: string, issueId: string) =>
    ['issue-links', workspaceSlug, companyId, issueId] as const;

export const useIssueLinks = (workspaceSlug: string, companyId: string, issueId: string) =>
    useQuery({
        queryKey: linksKey(workspaceSlug, companyId, issueId),
        queryFn: () => issueRepo.getLinks(workspaceSlug, companyId, issueId),
        enabled: !!workspaceSlug && !!companyId && !!issueId,
    });

export const useCreateIssueLink = (workspaceSlug: string, companyId: string, issueId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateIssueLinkData) =>
            issueRepo.createLink(workspaceSlug, companyId, issueId, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: linksKey(workspaceSlug, companyId, issueId) });
            void qc.invalidateQueries({ queryKey: issueDetailKey(workspaceSlug, companyId, issueId) });
            void qc.invalidateQueries({ queryKey: activitiesKey(workspaceSlug, companyId, issueId) });
            toast.success('Enlace agregado');
        },
        onError: () => toast.error('Error al agregar el enlace'),
    });
};

export const useDeleteIssueLink = (workspaceSlug: string, companyId: string, issueId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (linkId: string) =>
            issueRepo.deleteLink(workspaceSlug, companyId, issueId, linkId),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: linksKey(workspaceSlug, companyId, issueId) });
            void qc.invalidateQueries({ queryKey: issueDetailKey(workspaceSlug, companyId, issueId) });
            void qc.invalidateQueries({ queryKey: activitiesKey(workspaceSlug, companyId, issueId) });
            toast.success('Enlace eliminado');
        },
        onError: () => toast.error('Error al eliminar el enlace'),
    });
};

// Relations
export const relationsKey = (workspaceSlug: string, companyId: string, issueId: string) =>
    ['issue-relations', workspaceSlug, companyId, issueId] as const;

export const useIssueRelations = (workspaceSlug: string, companyId: string, issueId: string) =>
    useQuery({
        queryKey: relationsKey(workspaceSlug, companyId, issueId),
        queryFn: () => issueRepo.getRelations(workspaceSlug, companyId, issueId),
        enabled: !!workspaceSlug && !!companyId && !!issueId,
    });

export const useCreateIssueRelation = (workspaceSlug: string, companyId: string, issueId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateIssueRelationData) =>
            issueRepo.createRelation(workspaceSlug, companyId, issueId, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: relationsKey(workspaceSlug, companyId, issueId) });
            void qc.invalidateQueries({ queryKey: issueDetailKey(workspaceSlug, companyId, issueId) });
            void qc.invalidateQueries({ queryKey: activitiesKey(workspaceSlug, companyId, issueId) });
            void qc.invalidateQueries({ queryKey: ['issue-relations'] });
            toast.success('Relación agregada');
        },
        onError: () => toast.error('Error al agregar la relación'),
    });
};

export const useDeleteIssueRelation = (workspaceSlug: string, companyId: string, issueId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (relationId: string) =>
            issueRepo.deleteRelation(workspaceSlug, companyId, issueId, relationId),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: relationsKey(workspaceSlug, companyId, issueId) });
            void qc.invalidateQueries({ queryKey: issueDetailKey(workspaceSlug, companyId, issueId) });
            void qc.invalidateQueries({ queryKey: activitiesKey(workspaceSlug, companyId, issueId) });
            void qc.invalidateQueries({ queryKey: ['issue-relations'] });
            toast.success('Relación eliminada');
        },
        onError: () => toast.error('Error al eliminar la relación'),
    });
};
