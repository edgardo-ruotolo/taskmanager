import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cycleRepository } from '../infrastructure/cycle-repository';
import type { CreateCycleData } from '../domain/types';
import { issuesKey } from '@/modules/issues/application/use-issues';

export const cyclesKey = (workspaceSlug: string, companyId: string) =>
    ['cycles', workspaceSlug, companyId] as const;

export const useCycles = (workspaceSlug: string, companyId: string) =>
    useQuery({
        queryKey: cyclesKey(workspaceSlug, companyId),
        queryFn: () => cycleRepository.getAll(workspaceSlug, companyId),
        enabled: !!workspaceSlug && !!companyId,
    });

export const useCreateCycle = (workspaceSlug: string, companyId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateCycleData) =>
            cycleRepository.create(workspaceSlug, companyId, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: cyclesKey(workspaceSlug, companyId) });
            toast.success('Ciclo creado');
        },
        onError: () => toast.error('Error al crear el ciclo'),
    });
};

export const useDeleteCycle = (workspaceSlug: string, companyId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (cycleId: string) =>
            cycleRepository.delete(workspaceSlug, companyId, cycleId),
        onSuccess: (_, cycleId) => {
            void qc.invalidateQueries({ queryKey: cyclesKey(workspaceSlug, companyId) });
            qc.removeQueries({ queryKey: ['cycle-issues', workspaceSlug, companyId, cycleId] });
            void qc.invalidateQueries({ queryKey: issuesKey(workspaceSlug, companyId) });
            void qc.invalidateQueries({ queryKey: ['analytics', 'overview', workspaceSlug] });
            toast.success('Ciclo eliminado');
        },
        onError: () => toast.error('Error al eliminar el ciclo'),
    });
};

export const cycleIssuesKey = (workspaceSlug: string, companyId: string, cycleId: string) =>
    ['cycle-issues', workspaceSlug, companyId, cycleId] as const;

export const useCycleIssues = (workspaceSlug: string, companyId: string, cycleId: string) =>
    useQuery({
        queryKey: cycleIssuesKey(workspaceSlug, companyId, cycleId),
        queryFn: () => cycleRepository.getIssues(workspaceSlug, companyId, cycleId),
        enabled: !!workspaceSlug && !!companyId && !!cycleId,
    });

export const useAddCycleIssue = (workspaceSlug: string, companyId: string, cycleId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (issueId: string) =>
            cycleRepository.addIssue(workspaceSlug, companyId, cycleId, issueId),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: cycleIssuesKey(workspaceSlug, companyId, cycleId) });
            void qc.invalidateQueries({ queryKey: cyclesKey(workspaceSlug, companyId) });
            void qc.invalidateQueries({ queryKey: issuesKey(workspaceSlug, companyId) });
            void qc.invalidateQueries({ queryKey: ['module-issues', workspaceSlug, companyId] });
            toast.success('Tarea agregada al ciclo');
        },
        onError: () => toast.error('Error al agregar la tarea'),
    });
};

export const useRemoveCycleIssue = (workspaceSlug: string, companyId: string, cycleId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (issueId: string) =>
            cycleRepository.removeIssue(workspaceSlug, companyId, cycleId, issueId),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: cycleIssuesKey(workspaceSlug, companyId, cycleId) });
            void qc.invalidateQueries({ queryKey: cyclesKey(workspaceSlug, companyId) });
            void qc.invalidateQueries({ queryKey: issuesKey(workspaceSlug, companyId) });
            void qc.invalidateQueries({ queryKey: ['module-issues', workspaceSlug, companyId] });
            toast.success('Tarea quitada del ciclo');
        },
        onError: () => toast.error('Error al quitar la tarea'),
    });
};
