import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { FieldValues, UseFormSetError } from 'react-hook-form';
import { useServerMutation } from '@/shared/hooks/useServerMutation';
import { moduleRepository } from '../infrastructure/module-repository';
import type { CreateModuleData, ModuleIssueRef } from '../domain/types';
import { issuesKey } from '@/modules/issues/application/use-issues';
import type { Issue } from '@/modules/issues/domain/types';
import type { PagedResult } from '@/shared/types/pagination';

export const modulesKey = (workspaceSlug: string, companyId: string) =>
    ['modules', workspaceSlug, companyId] as const;

export const useModules = (workspaceSlug: string, companyId: string) =>
    useQuery({
        queryKey: modulesKey(workspaceSlug, companyId),
        queryFn: () => moduleRepository.getAll(workspaceSlug, companyId),
        enabled: !!workspaceSlug && !!companyId,
    });

export const useCreateModule = <TFormValues extends FieldValues = FieldValues>(
    workspaceSlug: string,
    companyId: string,
    options?: { setError?: UseFormSetError<TFormValues> },
) => {
    const qc = useQueryClient();
    return useServerMutation<unknown, CreateModuleData, TFormValues>({
        mutationFn: (data) =>
            moduleRepository.create(workspaceSlug, companyId, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: modulesKey(workspaceSlug, companyId) });
            toast.success('Módulo creado');
        },
        setError: options?.setError,
        fallbackMessage: 'Error al crear el módulo',
    });
};

export const useDeleteModule = (workspaceSlug: string, companyId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (moduleId: string) =>
            moduleRepository.delete(workspaceSlug, companyId, moduleId),
        onSuccess: (_, moduleId) => {
            void qc.invalidateQueries({ queryKey: modulesKey(workspaceSlug, companyId) });
            qc.removeQueries({ queryKey: ['module-issues', workspaceSlug, companyId, moduleId] });
            void qc.invalidateQueries({ queryKey: issuesKey(workspaceSlug, companyId) });
            void qc.invalidateQueries({ queryKey: ['analytics', 'overview', workspaceSlug] });
            toast.success('Módulo eliminado');
        },
        onError: () => toast.error('Error al eliminar el módulo'),
    });
};

export const moduleIssuesKey = (workspaceSlug: string, companyId: string, moduleId: string) =>
    ['module-issues', workspaceSlug, companyId, moduleId] as const;

export const useModuleIssues = (workspaceSlug: string, companyId: string, moduleId: string) =>
    useQuery({
        queryKey: moduleIssuesKey(workspaceSlug, companyId, moduleId),
        queryFn: () => moduleRepository.getIssues(workspaceSlug, companyId, moduleId),
        enabled: !!workspaceSlug && !!companyId && !!moduleId,
    });

interface ModuleMembershipContext {
    prevModuleIssues?: ModuleIssueRef[];
}

export const useAddModuleIssue = (workspaceSlug: string, companyId: string, moduleId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (issueId: string) =>
            moduleRepository.addIssue(workspaceSlug, companyId, moduleId, issueId),
        onMutate: async (issueId): Promise<ModuleMembershipContext> => {
            await qc.cancelQueries({ queryKey: moduleIssuesKey(workspaceSlug, companyId, moduleId) });
            const prevModuleIssues = qc.getQueryData<ModuleIssueRef[]>(
                moduleIssuesKey(workspaceSlug, companyId, moduleId),
            );
            const issuesData = qc.getQueryData<PagedResult<Issue> | Issue[]>(issuesKey(workspaceSlug, companyId));
            const issuesList = Array.isArray(issuesData) ? issuesData : issuesData?.items;
            const found = issuesList?.find((i) => i.id === issueId);
            if (prevModuleIssues && found && !prevModuleIssues.some((r) => r.issueId === issueId)) {
                qc.setQueryData<ModuleIssueRef[]>(
                    moduleIssuesKey(workspaceSlug, companyId, moduleId),
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
                qc.setQueryData(moduleIssuesKey(workspaceSlug, companyId, moduleId), ctx.prevModuleIssues);
            }
            toast.error('Error al agregar la tarea');
        },
        onSettled: () => {
            void qc.invalidateQueries({ queryKey: moduleIssuesKey(workspaceSlug, companyId, moduleId) });
            void qc.invalidateQueries({ queryKey: modulesKey(workspaceSlug, companyId) });
            void qc.invalidateQueries({ queryKey: issuesKey(workspaceSlug, companyId) });
            void qc.invalidateQueries({ queryKey: ['cycle-issues', workspaceSlug, companyId] });
        },
        onSuccess: () => toast.success('Tarea agregada al módulo'),
    });
};

export const useRemoveModuleIssue = (workspaceSlug: string, companyId: string, moduleId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (issueId: string) =>
            moduleRepository.removeIssue(workspaceSlug, companyId, moduleId, issueId),
        onMutate: async (issueId): Promise<ModuleMembershipContext> => {
            await qc.cancelQueries({ queryKey: moduleIssuesKey(workspaceSlug, companyId, moduleId) });
            const prevModuleIssues = qc.getQueryData<ModuleIssueRef[]>(
                moduleIssuesKey(workspaceSlug, companyId, moduleId),
            );
            if (prevModuleIssues) {
                qc.setQueryData<ModuleIssueRef[]>(
                    moduleIssuesKey(workspaceSlug, companyId, moduleId),
                    prevModuleIssues.filter((r) => r.issueId !== issueId),
                );
            }
            return { prevModuleIssues };
        },
        onError: (_err, _issueId, ctx) => {
            if (ctx?.prevModuleIssues) {
                qc.setQueryData(moduleIssuesKey(workspaceSlug, companyId, moduleId), ctx.prevModuleIssues);
            }
            toast.error('Error al quitar la tarea');
        },
        onSettled: () => {
            void qc.invalidateQueries({ queryKey: moduleIssuesKey(workspaceSlug, companyId, moduleId) });
            void qc.invalidateQueries({ queryKey: modulesKey(workspaceSlug, companyId) });
            void qc.invalidateQueries({ queryKey: issuesKey(workspaceSlug, companyId) });
            void qc.invalidateQueries({ queryKey: ['cycle-issues', workspaceSlug, companyId] });
        },
        onSuccess: () => toast.success('Tarea quitada del módulo'),
    });
};
