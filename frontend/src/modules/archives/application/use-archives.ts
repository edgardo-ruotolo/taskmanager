import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { archivesRepository } from '../infrastructure/archives-repository';

export const useArchivedIssues = (workspaceSlug: string, companyId: string) =>
    useQuery({
        queryKey: ['archives', 'issues', workspaceSlug, companyId],
        queryFn: () => archivesRepository.getArchivedIssues(workspaceSlug, companyId),
        enabled: !!workspaceSlug && !!companyId,
    });

export const useRestoreIssue = (workspaceSlug: string, companyId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (issueId: string) => archivesRepository.restoreIssue(workspaceSlug, companyId, issueId),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: ['archives', 'issues', workspaceSlug, companyId] });
            toast.success('Tarea restaurada');
        },
        onError: () => toast.error('Error al restaurar la tarea'),
    });
};

export const useArchivedCycles = (workspaceSlug: string, companyId: string) =>
    useQuery({
        queryKey: ['archives', 'cycles', workspaceSlug, companyId],
        queryFn: () => archivesRepository.getArchivedCycles(workspaceSlug, companyId),
        enabled: !!workspaceSlug && !!companyId,
    });

export const useRestoreCycle = (workspaceSlug: string, companyId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (cycleId: string) => archivesRepository.restoreCycle(workspaceSlug, companyId, cycleId),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: ['archives', 'cycles', workspaceSlug, companyId] });
            toast.success('Ciclo restaurado');
        },
        onError: () => toast.error('Error al restaurar el ciclo'),
    });
};

export const useArchivedModules = (workspaceSlug: string, companyId: string) =>
    useQuery({
        queryKey: ['archives', 'modules', workspaceSlug, companyId],
        queryFn: () => archivesRepository.getArchivedModules(workspaceSlug, companyId),
        enabled: !!workspaceSlug && !!companyId,
    });

export const useRestoreModule = (workspaceSlug: string, companyId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (moduleId: string) => archivesRepository.restoreModule(workspaceSlug, companyId, moduleId),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: ['archives', 'modules', workspaceSlug, companyId] });
            toast.success('Módulo restaurado');
        },
        onError: () => toast.error('Error al restaurar el módulo'),
    });
};
