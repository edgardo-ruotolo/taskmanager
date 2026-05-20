import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getIssueTypes, createIssueType, deleteIssueType } from '../infrastructure/issue-repository';
import type { CreateIssueTypeData } from '../domain/types';

export const issueTypesKey = (workspaceSlug: string) =>
    ['issue-types', workspaceSlug] as const;

export const useIssueTypes = (workspaceSlug: string) =>
    useQuery({
        queryKey: issueTypesKey(workspaceSlug),
        queryFn: () => getIssueTypes(workspaceSlug),
        enabled: !!workspaceSlug,
    });

export const useCreateIssueType = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateIssueTypeData) => createIssueType(workspaceSlug, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: issueTypesKey(workspaceSlug) });
            toast.success('Tipo de tarea creado');
        },
        onError: (error: unknown) => { const e = error as { response?: { data?: { message?: string } } }; toast.error(e?.response?.data?.message ?? 'Error al crear el tipo de tarea'); },
    });
};

export const useDeleteIssueType = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteIssueType(workspaceSlug, id),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: issueTypesKey(workspaceSlug) });
            void qc.invalidateQueries({ queryKey: ['issues', workspaceSlug] });
            void qc.invalidateQueries({ queryKey: ['issue'] });
            toast.success('Tipo de tarea eliminado');
        },
        onError: (error: unknown) => { const e = error as { response?: { data?: { message?: string } } }; toast.error(e?.response?.data?.message ?? 'Error al eliminar el tipo de tarea'); },
    });
};
