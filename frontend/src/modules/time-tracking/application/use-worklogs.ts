import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { worklogsRepository } from '../infrastructure/worklogs-repository';
import type { CreateWorklogData, UpdateWorklogData, Worklog, WorklogSummary } from '../domain/types';

const queryKey = (workspaceSlug: string, issueId: string): string[] => [
    'worklogs',
    workspaceSlug,
    issueId,
];

export const useWorklogs = (
    workspaceSlug: string,
    issueId: string,
): ReturnType<typeof useQuery<Worklog[]>> =>
    useQuery({
        queryKey: queryKey(workspaceSlug, issueId),
        queryFn: () => worklogsRepository.getWorklogs(workspaceSlug, issueId),
        enabled: Boolean(workspaceSlug) && Boolean(issueId),
    });

export const useWorklogSummary = (
    workspaceSlug: string,
    issueId: string,
): ReturnType<typeof useQuery<WorklogSummary>> =>
    useQuery({
        queryKey: ['worklogs-summary', workspaceSlug, issueId],
        queryFn: () => worklogsRepository.getWorklogSummary(workspaceSlug, issueId),
        enabled: Boolean(workspaceSlug) && Boolean(issueId),
    });

export const useCreateWorklog = (workspaceSlug: string, issueId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateWorklogData) =>
            worklogsRepository.createWorklog(workspaceSlug, issueId, data),
        onSuccess: () => {
            toast.success('Tiempo registrado correctamente');
            void queryClient.invalidateQueries({ queryKey: queryKey(workspaceSlug, issueId) });
            void queryClient.invalidateQueries({
                queryKey: ['worklogs-summary', workspaceSlug, issueId],
            });
        },
        onError: () => {
            toast.error('Error al registrar el tiempo');
        },
    });
};

export const useUpdateWorklog = (workspaceSlug: string, issueId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            worklogId,
            data,
        }: {
            worklogId: string;
            data: UpdateWorklogData;
        }) => worklogsRepository.updateWorklog(workspaceSlug, issueId, worklogId, data),
        onSuccess: () => {
            toast.success('Tiempo actualizado');
            void queryClient.invalidateQueries({ queryKey: queryKey(workspaceSlug, issueId) });
            void queryClient.invalidateQueries({
                queryKey: ['worklogs-summary', workspaceSlug, issueId],
            });
        },
        onError: () => {
            toast.error('Error al actualizar el tiempo');
        },
    });
};

export const useDeleteWorklog = (workspaceSlug: string, issueId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (worklogId: string) =>
            worklogsRepository.deleteWorklog(workspaceSlug, issueId, worklogId),
        onSuccess: () => {
            toast.success('Registro eliminado');
            void queryClient.invalidateQueries({ queryKey: queryKey(workspaceSlug, issueId) });
            void queryClient.invalidateQueries({
                queryKey: ['worklogs-summary', workspaceSlug, issueId],
            });
        },
        onError: () => {
            toast.error('Error al eliminar el registro');
        },
    });
};
