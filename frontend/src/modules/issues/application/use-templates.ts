import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    getTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
} from '../infrastructure/issue-repository';
import type { CreateIssueTemplateData } from '../domain/types';

export const templatesKey = (workspaceSlug: string) =>
    ['issue-templates', workspaceSlug] as const;

export const useTemplates = (workspaceSlug: string) =>
    useQuery({
        queryKey: templatesKey(workspaceSlug),
        queryFn: () => getTemplates(workspaceSlug),
        enabled: !!workspaceSlug,
    });

export const useCreateTemplate = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateIssueTemplateData) => createTemplate(workspaceSlug, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: templatesKey(workspaceSlug) });
            toast.success('Plantilla creada');
        },
        onError: (error: unknown) => { const e = error as { response?: { data?: { message?: string } } }; toast.error(e?.response?.data?.message ?? 'Error al crear la plantilla'); },
    });
};

export const useUpdateTemplate = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: CreateIssueTemplateData }) =>
            updateTemplate(workspaceSlug, id, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: templatesKey(workspaceSlug) });
            toast.success('Plantilla actualizada');
        },
        onError: (error: unknown) => { const e = error as { response?: { data?: { message?: string } } }; toast.error(e?.response?.data?.message ?? 'Error al actualizar la plantilla'); },
    });
};

export const useDeleteTemplate = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteTemplate(workspaceSlug, id),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: templatesKey(workspaceSlug) });
            toast.success('Plantilla eliminada');
        },
        onError: (error: unknown) => { const e = error as { response?: { data?: { message?: string } } }; toast.error(e?.response?.data?.message ?? 'Error al eliminar la plantilla'); },
    });
};
