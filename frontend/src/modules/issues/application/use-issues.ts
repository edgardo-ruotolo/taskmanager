import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { FieldValues, UseFormSetError } from 'react-hook-form';
import { useServerMutation } from '@/shared/hooks/useServerMutation';
import { trackEvent } from '@/shared/lib/posthog';
import type { PagedResult } from '@/shared/types/pagination';
import { issueRepository } from '../infrastructure/issue-repository';
import type { CreateIssueData, Issue, UpdateIssueData } from '../domain/types';
import {
    issueDetailKey,
    activitiesKey,
    commentsKey,
    reactionsKey,
    linksKey,
    relationsKey,
} from './use-issue-detail';
import { realtimeQueryOptions } from './query-options';

export const issuesKey = (workspaceSlug: string, projectId: string) =>
    ['issues', workspaceSlug, projectId] as const;

export const useIssues = (workspaceSlug: string, projectId: string) =>
    useQuery({
        queryKey: issuesKey(workspaceSlug, projectId),
        queryFn: () => issueRepository.getAll(workspaceSlug, projectId),
        enabled: !!workspaceSlug && !!projectId,
        ...realtimeQueryOptions,
    });

export const useCreateIssue = <TFormValues extends FieldValues = FieldValues>(
    workspaceSlug: string,
    projectId: string,
    options?: { setError?: UseFormSetError<TFormValues> },
) => {
    const qc = useQueryClient();
    return useServerMutation<unknown, CreateIssueData, TFormValues>({
        mutationFn: (data) =>
            issueRepository.create(workspaceSlug, projectId, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: issuesKey(workspaceSlug, projectId) });
            void qc.invalidateQueries({ queryKey: ['cycle-issues', workspaceSlug, projectId] });
            void qc.invalidateQueries({ queryKey: ['module-issues', workspaceSlug, projectId] });
            void qc.invalidateQueries({ queryKey: ['workspace-activity', workspaceSlug] });
            void qc.invalidateQueries({ queryKey: ['analytics', 'overview', workspaceSlug] });
            trackEvent('issue_created', { projectId });
            toast.success('Tarea creada');
        },
        setError: options?.setError,
        fallbackMessage: 'Error al crear la tarea',
    });
};

interface UpdateIssueContext {
    prevList?: PagedResult<Issue> | Issue[];
    prevDetail?: Issue;
}

type UpdateIssueVars = { issueId: string; data: UpdateIssueData };

export const useUpdateIssue = <TFormValues extends FieldValues = FieldValues>(
    workspaceSlug: string,
    projectId: string,
    options?: { setError?: UseFormSetError<TFormValues> },
) => {
    const qc = useQueryClient();
    return useServerMutation<unknown, UpdateIssueVars, TFormValues>({
        mutationFn: ({ issueId, data }) =>
            issueRepository.update(workspaceSlug, projectId, issueId, data),
        onMutate: async ({ issueId, data }): Promise<UpdateIssueContext> => {
            await qc.cancelQueries({ queryKey: issuesKey(workspaceSlug, projectId) });
            await qc.cancelQueries({ queryKey: issueDetailKey(workspaceSlug, projectId, issueId) });

            const prevList = qc.getQueryData<PagedResult<Issue> | Issue[]>(issuesKey(workspaceSlug, projectId));
            const prevDetail = qc.getQueryData<Issue>(issueDetailKey(workspaceSlug, projectId, issueId));

            if (prevList) {
                qc.setQueryData<PagedResult<Issue> | Issue[]>(
                    issuesKey(workspaceSlug, projectId),
                    Array.isArray(prevList)
                        ? prevList.map((i) => (i.id === issueId ? { ...i, ...data } : i))
                        : {
                              ...prevList,
                              items: prevList.items.map((i) =>
                                  i.id === issueId ? { ...i, ...data } : i,
                              ),
                          },
                );
            }
            if (prevDetail) {
                qc.setQueryData<Issue>(
                    issueDetailKey(workspaceSlug, projectId, issueId),
                    { ...prevDetail, ...data },
                );
            }

            return { prevList, prevDetail };
        },
        onError: (_err, { issueId }, ctx) => {
            const context = ctx as UpdateIssueContext | undefined;
            if (context?.prevList) {
                qc.setQueryData(issuesKey(workspaceSlug, projectId), context.prevList);
            }
            if (context?.prevDetail) {
                qc.setQueryData(
                    issueDetailKey(workspaceSlug, projectId, issueId),
                    context.prevDetail,
                );
            }
        },
        onSettled: (_data, _err, { issueId }) => {
            // Re-sync with the server, but lazily — UI already shows optimistic state.
            void qc.invalidateQueries({ queryKey: issuesKey(workspaceSlug, projectId) });
            void qc.invalidateQueries({ queryKey: issueDetailKey(workspaceSlug, projectId, issueId) });
            void qc.invalidateQueries({ queryKey: activitiesKey(workspaceSlug, projectId, issueId) });
            void qc.invalidateQueries({ queryKey: ['cycle-issues', workspaceSlug, projectId] });
            void qc.invalidateQueries({ queryKey: ['module-issues', workspaceSlug, projectId] });
            void qc.invalidateQueries({ queryKey: ['workspace-activity', workspaceSlug] });
            void qc.invalidateQueries({ queryKey: ['analytics', 'overview', workspaceSlug] });
            void qc.invalidateQueries({ queryKey: ['intake', workspaceSlug, projectId] });
            void qc.invalidateQueries({ queryKey: ['notifications'] });
        },
        onSuccess: () => {
            toast.success('Tarea actualizada');
        },
        setError: options?.setError,
        fallbackMessage: 'Error al actualizar la tarea',
    });
};

export const useArchiveIssue = (workspaceSlug: string, projectId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (issueId: string) =>
            issueRepository.archive(workspaceSlug, projectId, issueId),
        onSuccess: (_data, issueId) => {
            qc.removeQueries({ queryKey: issueDetailKey(workspaceSlug, projectId, issueId) });
            void qc.invalidateQueries({ queryKey: issuesKey(workspaceSlug, projectId) });
            void qc.invalidateQueries({ queryKey: ['cycle-issues', workspaceSlug, projectId] });
            void qc.invalidateQueries({ queryKey: ['module-issues', workspaceSlug, projectId] });
            toast.success('Tarea archivada');
        },
        onError: () => toast.error('Error al archivar la tarea'),
    });
};

export const useDuplicateIssue = (workspaceSlug: string, projectId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (issueId: string) =>
            issueRepository.duplicate(workspaceSlug, projectId, issueId),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: issuesKey(workspaceSlug, projectId) });
            toast.success('Tarea duplicada');
        },
        onError: () => toast.error('Error al duplicar la tarea'),
    });
};

export const useDeleteIssue = (workspaceSlug: string, projectId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (issueId: string) =>
            issueRepository.delete(workspaceSlug, projectId, issueId),
        onMutate: async (issueId): Promise<{ prevList?: PagedResult<Issue> | Issue[] }> => {
            await qc.cancelQueries({ queryKey: issuesKey(workspaceSlug, projectId) });
            const prevList = qc.getQueryData<PagedResult<Issue> | Issue[]>(issuesKey(workspaceSlug, projectId));
            if (prevList) {
                qc.setQueryData<PagedResult<Issue> | Issue[]>(
                    issuesKey(workspaceSlug, projectId),
                    Array.isArray(prevList)
                        ? prevList.filter((i) => i.id !== issueId)
                        : {
                              ...prevList,
                              items: prevList.items.filter((i) => i.id !== issueId),
                          },
                );
            }
            return { prevList };
        },
        onError: (_err, _issueId, ctx) => {
            if (ctx?.prevList) {
                qc.setQueryData(issuesKey(workspaceSlug, projectId), ctx.prevList);
            }
            toast.error('Error al eliminar la tarea');
        },
        onSuccess: (_data, issueId) => {
            // Granular invalidation: the optimistic remove already updated the list.
            // We only purge the detail and its sub-queries, and refresh the cycle/module
            // membership caches where the issue might appear.
            qc.removeQueries({ queryKey: issueDetailKey(workspaceSlug, projectId, issueId) });
            qc.removeQueries({ queryKey: activitiesKey(workspaceSlug, projectId, issueId) });
            qc.removeQueries({ queryKey: commentsKey(workspaceSlug, projectId, issueId) });
            qc.removeQueries({ queryKey: reactionsKey(workspaceSlug, projectId, issueId) });
            qc.removeQueries({ queryKey: linksKey(workspaceSlug, projectId, issueId) });
            qc.removeQueries({ queryKey: relationsKey(workspaceSlug, projectId, issueId) });
            void qc.invalidateQueries({ queryKey: ['cycle-issues', workspaceSlug, projectId] });
            void qc.invalidateQueries({ queryKey: ['module-issues', workspaceSlug, projectId] });
            toast.success('Tarea eliminada');
        },
    });
};
