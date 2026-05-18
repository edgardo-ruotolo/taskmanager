import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { issueRepository } from '../infrastructure/issue-repository';
import type { CreateIssueData, UpdateIssueData } from '../domain/types';
import {
    issueDetailKey,
    activitiesKey,
    commentsKey,
    reactionsKey,
    linksKey,
    relationsKey,
} from './use-issue-detail';

export const issuesKey = (workspaceSlug: string, companyId: string) =>
    ['issues', workspaceSlug, companyId] as const;

export const useIssues = (workspaceSlug: string, companyId: string) =>
    useQuery({
        queryKey: issuesKey(workspaceSlug, companyId),
        queryFn: () => issueRepository.getAll(workspaceSlug, companyId),
        enabled: !!workspaceSlug && !!companyId,
    });

export const useCreateIssue = (workspaceSlug: string, companyId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateIssueData) =>
            issueRepository.create(workspaceSlug, companyId, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: issuesKey(workspaceSlug, companyId) });
            void qc.invalidateQueries({ queryKey: ['cycle-issues', workspaceSlug, companyId] });
            void qc.invalidateQueries({ queryKey: ['module-issues', workspaceSlug, companyId] });
            void qc.invalidateQueries({ queryKey: ['workspace-activity', workspaceSlug] });
            void qc.invalidateQueries({ queryKey: ['analytics', 'overview', workspaceSlug] });
            toast.success('Tarea creada');
        },
        onError: () => toast.error('Error al crear la tarea'),
    });
};

export const useUpdateIssue = (workspaceSlug: string, companyId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ issueId, data }: { issueId: string; data: UpdateIssueData }) =>
            issueRepository.update(workspaceSlug, companyId, issueId, data),
        onSuccess: (_, { issueId }) => {
            void qc.invalidateQueries({ queryKey: issuesKey(workspaceSlug, companyId) });
            void qc.invalidateQueries({ queryKey: issueDetailKey(workspaceSlug, companyId, issueId) });
            void qc.invalidateQueries({ queryKey: activitiesKey(workspaceSlug, companyId, issueId) });
            void qc.invalidateQueries({ queryKey: ['cycle-issues', workspaceSlug, companyId] });
            void qc.invalidateQueries({ queryKey: ['module-issues', workspaceSlug, companyId] });
            void qc.invalidateQueries({ queryKey: ['workspace-activity', workspaceSlug] });
            void qc.invalidateQueries({ queryKey: ['analytics', 'overview', workspaceSlug] });
            void qc.invalidateQueries({ queryKey: ['favorites', workspaceSlug] });
            void qc.invalidateQueries({ queryKey: ['notifications'] });
            void qc.invalidateQueries({ queryKey: ['intake', workspaceSlug, companyId] });
            toast.success('Tarea actualizada');
        },
        onError: () => toast.error('Error al actualizar la tarea'),
    });
};

export const useDeleteIssue = (workspaceSlug: string, companyId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (issueId: string) =>
            issueRepository.delete(workspaceSlug, companyId, issueId),
        onSuccess: (_, issueId) => {
            void qc.invalidateQueries({ queryKey: issuesKey(workspaceSlug, companyId) });
            void qc.invalidateQueries({ queryKey: ['cycle-issues', workspaceSlug, companyId] });
            void qc.invalidateQueries({ queryKey: ['module-issues', workspaceSlug, companyId] });
            qc.removeQueries({ queryKey: issueDetailKey(workspaceSlug, companyId, issueId) });
            void qc.invalidateQueries({ queryKey: activitiesKey(workspaceSlug, companyId, issueId) });
            void qc.invalidateQueries({ queryKey: commentsKey(workspaceSlug, companyId, issueId) });
            void qc.invalidateQueries({ queryKey: reactionsKey(workspaceSlug, companyId, issueId) });
            void qc.invalidateQueries({ queryKey: ['issue-subscribers', workspaceSlug, companyId, issueId] });
            void qc.invalidateQueries({ queryKey: linksKey(workspaceSlug, companyId, issueId) });
            void qc.invalidateQueries({ queryKey: relationsKey(workspaceSlug, companyId, issueId) });
            void qc.invalidateQueries({ queryKey: ['workspace-activity', workspaceSlug] });
            void qc.invalidateQueries({ queryKey: ['analytics', 'overview', workspaceSlug] });
            void qc.invalidateQueries({ queryKey: ['favorites', workspaceSlug] });
            void qc.invalidateQueries({ queryKey: ['intake', workspaceSlug, companyId] });
            void qc.invalidateQueries({ queryKey: ['notifications'] });
            toast.success('Tarea eliminada');
        },
        onError: () => toast.error('Error al eliminar la tarea'),
    });
};
