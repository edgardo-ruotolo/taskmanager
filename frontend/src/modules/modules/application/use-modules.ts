import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { FieldValues, UseFormSetError } from 'react-hook-form';
import { useServerMutation } from '@/shared/hooks/useServerMutation';
import { moduleRepository } from '../infrastructure/module-repository';
import type { Module, CreateModuleData, UpdateModuleData, ModuleIssueRef } from '../domain/types';
import { issuesKey } from '@/modules/issues/application/use-issues';
import type { Issue } from '@/modules/issues/domain/types';
import type { PagedResult } from '@/shared/types/pagination';

export const modulesKey = (workspaceSlug: string, projectId: string) =>
    ['modules', workspaceSlug, projectId] as const;

export const useModules = (
    workspaceSlug: string,
    projectId: string,
    options?: Omit<UseQueryOptions<Module[]>, 'queryKey' | 'queryFn'>,
) =>
    useQuery({
        queryKey: modulesKey(workspaceSlug, projectId),
        queryFn: () => moduleRepository.getAll(workspaceSlug, projectId),
        enabled: !!workspaceSlug && !!projectId,
        ...options,
    });

export const useCreateModule = <TFormValues extends FieldValues = FieldValues>(
    workspaceSlug: string,
    projectId: string,
    options?: { setError?: UseFormSetError<TFormValues> },
) => {
    const qc = useQueryClient();
    return useServerMutation<unknown, CreateModuleData, TFormValues>({
        mutationFn: (data) =>
            moduleRepository.create(workspaceSlug, projectId, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: modulesKey(workspaceSlug, projectId) });
            toast.success('Módulo creado');
        },
        setError: options?.setError,
        fallbackMessage: 'Error al crear el módulo',
    });
};

export const useUpdateModule = <TFormValues extends FieldValues = FieldValues>(
    workspaceSlug: string,
    projectId: string,
    options?: { setError?: UseFormSetError<TFormValues> },
) => {
    const qc = useQueryClient();
    return useServerMutation<unknown, { moduleId: string; data: UpdateModuleData }, TFormValues>({
        mutationFn: ({ moduleId, data }) =>
            moduleRepository.update(workspaceSlug, projectId, moduleId, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: modulesKey(workspaceSlug, projectId) });
            toast.success('Módulo actualizado');
        },
        setError: options?.setError,
        fallbackMessage: 'Error al actualizar el módulo',
    });
};

export const useDeleteModule = (workspaceSlug: string, projectId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (moduleId: string) =>
            moduleRepository.delete(workspaceSlug, projectId, moduleId),
        onSuccess: (_, moduleId) => {
            void qc.invalidateQueries({ queryKey: modulesKey(workspaceSlug, projectId) });
            qc.removeQueries({ queryKey: ['module-issues', workspaceSlug, projectId, moduleId] });
            void qc.invalidateQueries({ queryKey: issuesKey(workspaceSlug, projectId) });
            void qc.invalidateQueries({ queryKey: ['analytics', 'overview', workspaceSlug] });
            toast.success('Módulo eliminado');
        },
        onError: () => toast.error('Error al eliminar el módulo'),
    });
};

export const moduleIssuesKey = (workspaceSlug: string, projectId: string, moduleId: string) =>
    ['module-issues', workspaceSlug, projectId, moduleId] as const;

export const useModuleIssues = (workspaceSlug: string, projectId: string, moduleId: string) =>
    useQuery({
        queryKey: moduleIssuesKey(workspaceSlug, projectId, moduleId),
        queryFn: () => moduleRepository.getIssues(workspaceSlug, projectId, moduleId),
        enabled: !!workspaceSlug && !!projectId && !!moduleId,
    });

interface ModuleMembershipContext {
    prevModuleIssues?: ModuleIssueRef[];
}

export const useAddModuleIssue = (workspaceSlug: string, projectId: string, moduleId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (issueId: string) =>
            moduleRepository.addIssue(workspaceSlug, projectId, moduleId, issueId),
        onMutate: async (issueId): Promise<ModuleMembershipContext> => {
            await qc.cancelQueries({ queryKey: moduleIssuesKey(workspaceSlug, projectId, moduleId) });
            const prevModuleIssues = qc.getQueryData<ModuleIssueRef[]>(
                moduleIssuesKey(workspaceSlug, projectId, moduleId),
            );
            const issuesData = qc.getQueryData<PagedResult<Issue> | Issue[]>(issuesKey(workspaceSlug, projectId));
            const issuesList = Array.isArray(issuesData) ? issuesData : issuesData?.items;
            const found = issuesList?.find((i) => i.id === issueId);
            if (prevModuleIssues && found && !prevModuleIssues.some((r) => r.issueId === issueId)) {
                qc.setQueryData<ModuleIssueRef[]>(
                    moduleIssuesKey(workspaceSlug, projectId, moduleId),
                    [
                        ...prevModuleIssues,
                        {
                            issueId: found.id,
                            issueTitle: found.title,
                            issueSequenceId: found.sequenceId,
                            stateName: found.stateName,
                            stateColor: found.stateColor,
                            priority: found.priority,
                        },
                    ],
                );
            }
            return { prevModuleIssues };
        },
        onError: (_err, _issueId, ctx) => {
            if (ctx?.prevModuleIssues) {
                qc.setQueryData(moduleIssuesKey(workspaceSlug, projectId, moduleId), ctx.prevModuleIssues);
            }
            toast.error('Error al agregar la tarea');
        },
        onSettled: () => {
            void qc.invalidateQueries({ queryKey: moduleIssuesKey(workspaceSlug, projectId, moduleId) });
            void qc.invalidateQueries({ queryKey: modulesKey(workspaceSlug, projectId) });
            void qc.invalidateQueries({ queryKey: issuesKey(workspaceSlug, projectId) });
            void qc.invalidateQueries({ queryKey: ['cycle-issues', workspaceSlug, projectId] });
        },
        onSuccess: () => toast.success('Tarea agregada al módulo'),
    });
};

export const useRemoveModuleIssue = (workspaceSlug: string, projectId: string, moduleId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (issueId: string) =>
            moduleRepository.removeIssue(workspaceSlug, projectId, moduleId, issueId),
        onMutate: async (issueId): Promise<ModuleMembershipContext> => {
            await qc.cancelQueries({ queryKey: moduleIssuesKey(workspaceSlug, projectId, moduleId) });
            const prevModuleIssues = qc.getQueryData<ModuleIssueRef[]>(
                moduleIssuesKey(workspaceSlug, projectId, moduleId),
            );
            if (prevModuleIssues) {
                qc.setQueryData<ModuleIssueRef[]>(
                    moduleIssuesKey(workspaceSlug, projectId, moduleId),
                    prevModuleIssues.filter((r) => r.issueId !== issueId),
                );
            }
            return { prevModuleIssues };
        },
        onError: (_err, _issueId, ctx) => {
            if (ctx?.prevModuleIssues) {
                qc.setQueryData(moduleIssuesKey(workspaceSlug, projectId, moduleId), ctx.prevModuleIssues);
            }
            toast.error('Error al quitar la tarea');
        },
        onSettled: () => {
            void qc.invalidateQueries({ queryKey: moduleIssuesKey(workspaceSlug, projectId, moduleId) });
            void qc.invalidateQueries({ queryKey: modulesKey(workspaceSlug, projectId) });
            void qc.invalidateQueries({ queryKey: issuesKey(workspaceSlug, projectId) });
            void qc.invalidateQueries({ queryKey: ['cycle-issues', workspaceSlug, projectId] });
        },
        onSuccess: () => toast.success('Tarea quitada del módulo'),
    });
};
