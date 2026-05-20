import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getViews, createView, deleteView } from '../infrastructure/issue-repository';
import type { CreateIssueViewData } from '../domain/types';

export const issueViewsKey = (workspaceSlug: string) =>
    ['issue-views', workspaceSlug] as const;

export const useIssueViews = (workspaceSlug: string) =>
    useQuery({
        queryKey: issueViewsKey(workspaceSlug),
        queryFn: () => getViews(workspaceSlug),
        enabled: !!workspaceSlug,
    });

export const useCreateIssueView = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateIssueViewData) => createView(workspaceSlug, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: issueViewsKey(workspaceSlug) });
            toast.success('Vista creada');
        },
        onError: (error: unknown) => { const e = error as { response?: { data?: { message?: string } } }; toast.error(e?.response?.data?.message ?? 'Error al crear la vista'); },
    });
};

export const useDeleteIssueView = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (viewId: string) => deleteView(workspaceSlug, viewId),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: issueViewsKey(workspaceSlug) });
            toast.success('Vista eliminada');
        },
        onError: (error: unknown) => { const e = error as { response?: { data?: { message?: string } } }; toast.error(e?.response?.data?.message ?? 'Error al eliminar la vista'); },
    });
};
