import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { moduleRepository } from '../infrastructure/module-repository';
import type { CreateModuleData } from '../domain/types';
import { issuesKey } from '@/modules/issues/application/use-issues';

export const modulesKey = (workspaceSlug: string, companyId: string) =>
    ['modules', workspaceSlug, companyId] as const;

export const useModules = (workspaceSlug: string, companyId: string) =>
    useQuery({
        queryKey: modulesKey(workspaceSlug, companyId),
        queryFn: () => moduleRepository.getAll(workspaceSlug, companyId),
        enabled: !!workspaceSlug && !!companyId,
    });

export const useCreateModule = (workspaceSlug: string, companyId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateModuleData) =>
            moduleRepository.create(workspaceSlug, companyId, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: modulesKey(workspaceSlug, companyId) });
            toast.success('Módulo creado');
        },
        onError: () => toast.error('Error al crear el módulo'),
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

export const useAddModuleIssue = (workspaceSlug: string, companyId: string, moduleId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (issueId: string) =>
            moduleRepository.addIssue(workspaceSlug, companyId, moduleId, issueId),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: moduleIssuesKey(workspaceSlug, companyId, moduleId) });
            void qc.invalidateQueries({ queryKey: modulesKey(workspaceSlug, companyId) });
            void qc.invalidateQueries({ queryKey: issuesKey(workspaceSlug, companyId) });
            void qc.invalidateQueries({ queryKey: ['cycle-issues', workspaceSlug, companyId] });
            toast.success('Tarea agregada al módulo');
        },
        onError: () => toast.error('Error al agregar la tarea'),
    });
};

export const useRemoveModuleIssue = (workspaceSlug: string, companyId: string, moduleId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (issueId: string) =>
            moduleRepository.removeIssue(workspaceSlug, companyId, moduleId, issueId),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: moduleIssuesKey(workspaceSlug, companyId, moduleId) });
            void qc.invalidateQueries({ queryKey: modulesKey(workspaceSlug, companyId) });
            void qc.invalidateQueries({ queryKey: issuesKey(workspaceSlug, companyId) });
            void qc.invalidateQueries({ queryKey: ['cycle-issues', workspaceSlug, companyId] });
            toast.success('Tarea quitada del módulo');
        },
        onError: () => toast.error('Error al quitar la tarea'),
    });
};
