import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { archivesRepository } from '../infrastructure/archives-repository';

export const useArchivedIssues = (workspaceSlug: string, projectId: string) =>
    useQuery({
        queryKey: ['archives', 'issues', workspaceSlug, projectId],
        queryFn: () => archivesRepository.getArchivedIssues(workspaceSlug, projectId),
        enabled: !!workspaceSlug && !!projectId,
    });

export const useRestoreIssue = (workspaceSlug: string, projectId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (issueId: string) => archivesRepository.restoreIssue(workspaceSlug, projectId, issueId),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: ['archives', 'issues', workspaceSlug, projectId] });
            toast.success('Tarea restaurada');
        },
        onError: (error: unknown) => { const e = error as { response?: { data?: { message?: string } } }; toast.error(e?.response?.data?.message ?? 'Error al restaurar la tarea'); },
    });
};

export const useArchivedCycles = (workspaceSlug: string, projectId: string) =>
    useQuery({
        queryKey: ['archives', 'cycles', workspaceSlug, projectId],
        queryFn: () => archivesRepository.getArchivedCycles(workspaceSlug, projectId),
        enabled: !!workspaceSlug && !!projectId,
    });

export const useRestoreCycle = (workspaceSlug: string, projectId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (cycleId: string) => archivesRepository.restoreCycle(workspaceSlug, projectId, cycleId),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: ['archives', 'cycles', workspaceSlug, projectId] });
            toast.success('Ciclo restaurado');
        },
        onError: (error: unknown) => { const e = error as { response?: { data?: { message?: string } } }; toast.error(e?.response?.data?.message ?? 'Error al restaurar el ciclo'); },
    });
};

export const useArchivedModules = (workspaceSlug: string, projectId: string) =>
    useQuery({
        queryKey: ['archives', 'modules', workspaceSlug, projectId],
        queryFn: () => archivesRepository.getArchivedModules(workspaceSlug, projectId),
        enabled: !!workspaceSlug && !!projectId,
    });

export const useRestoreModule = (workspaceSlug: string, projectId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (moduleId: string) => archivesRepository.restoreModule(workspaceSlug, projectId, moduleId),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: ['archives', 'modules', workspaceSlug, projectId] });
            toast.success('Módulo restaurado');
        },
        onError: (error: unknown) => { const e = error as { response?: { data?: { message?: string } } }; toast.error(e?.response?.data?.message ?? 'Error al restaurar el módulo'); },
    });
};
