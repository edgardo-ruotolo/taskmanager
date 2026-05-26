import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { FieldValues, UseFormSetError } from 'react-hook-form';
import { useServerMutation } from '@/shared/hooks/useServerMutation';
import { cycleRepository } from '../infrastructure/cycle-repository';
import type { Cycle, CreateCycleData, UpdateCycleData, CycleIssueRef } from '../domain/types';
import { issuesKey } from '@/modules/issues/application/use-issues';
import type { Issue } from '@/modules/issues/domain/types';
import type { PagedResult } from '@/shared/types/pagination';

export const cyclesKey = (workspaceSlug: string, projectId: string) =>
    ['cycles', workspaceSlug, projectId] as const;

export const useCycles = (
    workspaceSlug: string,
    projectId: string,
    options?: Omit<UseQueryOptions<Cycle[]>, 'queryKey' | 'queryFn'>,
) =>
    useQuery({
        queryKey: cyclesKey(workspaceSlug, projectId),
        queryFn: () => cycleRepository.getAll(workspaceSlug, projectId),
        enabled: !!workspaceSlug && !!projectId,
        ...options,
    });

export const useCreateCycle = <TFormValues extends FieldValues = FieldValues>(
    workspaceSlug: string,
    projectId: string,
    options?: { setError?: UseFormSetError<TFormValues> },
) => {
    const qc = useQueryClient();
    return useServerMutation<unknown, CreateCycleData, TFormValues>({
        mutationFn: (data) =>
            cycleRepository.create(workspaceSlug, projectId, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: cyclesKey(workspaceSlug, projectId) });
            toast.success('Ciclo creado');
        },
        setError: options?.setError,
        fallbackMessage: 'Error al crear el ciclo',
    });
};

export const useUpdateCycle = <TFormValues extends FieldValues = FieldValues>(
    workspaceSlug: string,
    projectId: string,
    options?: { setError?: UseFormSetError<TFormValues> },
) => {
    const qc = useQueryClient();
    return useServerMutation<unknown, { cycleId: string; data: UpdateCycleData }, TFormValues>({
        mutationFn: ({ cycleId, data }) =>
            cycleRepository.update(workspaceSlug, projectId, cycleId, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: cyclesKey(workspaceSlug, projectId) });
            toast.success('Ciclo actualizado');
        },
        setError: options?.setError,
        fallbackMessage: 'Error al actualizar el ciclo',
    });
};

export const useDeleteCycle = (workspaceSlug: string, projectId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (cycleId: string) =>
            cycleRepository.delete(workspaceSlug, projectId, cycleId),
        onSuccess: (_, cycleId) => {
            void qc.invalidateQueries({ queryKey: cyclesKey(workspaceSlug, projectId) });
            qc.removeQueries({ queryKey: ['cycle-issues', workspaceSlug, projectId, cycleId] });
            void qc.invalidateQueries({ queryKey: issuesKey(workspaceSlug, projectId) });
            void qc.invalidateQueries({ queryKey: ['analytics', 'overview', workspaceSlug] });
            toast.success('Ciclo eliminado');
        },
        onError: () => toast.error('Error al eliminar el ciclo'),
    });
};

export const cycleIssuesKey = (workspaceSlug: string, projectId: string, cycleId: string) =>
    ['cycle-issues', workspaceSlug, projectId, cycleId] as const;

export const useCycleIssues = (workspaceSlug: string, projectId: string, cycleId: string) =>
    useQuery({
        queryKey: cycleIssuesKey(workspaceSlug, projectId, cycleId),
        queryFn: () => cycleRepository.getIssues(workspaceSlug, projectId, cycleId),
        enabled: !!workspaceSlug && !!projectId && !!cycleId,
    });

interface CycleMembershipContext {
    prevCycleIssues?: CycleIssueRef[];
}

export const useAddCycleIssue = (workspaceSlug: string, projectId: string, cycleId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (issueId: string) =>
            cycleRepository.addIssue(workspaceSlug, projectId, cycleId, issueId),
        onMutate: async (issueId): Promise<CycleMembershipContext> => {
            await qc.cancelQueries({ queryKey: cycleIssuesKey(workspaceSlug, projectId, cycleId) });
            const prevCycleIssues = qc.getQueryData<CycleIssueRef[]>(
                cycleIssuesKey(workspaceSlug, projectId, cycleId),
            );

            // Synthesize a CycleIssueRef from the global issues list.
            const issuesData = qc.getQueryData<PagedResult<Issue> | Issue[]>(issuesKey(workspaceSlug, projectId));
            const issuesList = Array.isArray(issuesData) ? issuesData : issuesData?.items;
            const found = issuesList?.find((i) => i.id === issueId);
            if (prevCycleIssues && found) {
                const optimisticRef: CycleIssueRef = {
                    issueId: found.id,
                    issueTitle: found.title,
                    issueSequenceId: found.sequenceId,
                    stateName: found.stateName,
                    stateColor: found.stateColor,
                    priority: found.priority,
                };
                if (!prevCycleIssues.some((r) => r.issueId === issueId)) {
                    qc.setQueryData<CycleIssueRef[]>(
                        cycleIssuesKey(workspaceSlug, projectId, cycleId),
                        [...prevCycleIssues, optimisticRef],
                    );
                }
            }
            return { prevCycleIssues };
        },
        onError: (_err, _issueId, ctx) => {
            if (ctx?.prevCycleIssues) {
                qc.setQueryData(cycleIssuesKey(workspaceSlug, projectId, cycleId), ctx.prevCycleIssues);
            }
            toast.error('Error al agregar la tarea');
        },
        onSettled: () => {
            void qc.invalidateQueries({ queryKey: cycleIssuesKey(workspaceSlug, projectId, cycleId) });
            void qc.invalidateQueries({ queryKey: cyclesKey(workspaceSlug, projectId) });
            void qc.invalidateQueries({ queryKey: issuesKey(workspaceSlug, projectId) });
            void qc.invalidateQueries({ queryKey: ['module-issues', workspaceSlug, projectId] });
        },
        onSuccess: () => toast.success('Tarea agregada al ciclo'),
    });
};

export const useRemoveCycleIssue = (workspaceSlug: string, projectId: string, cycleId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (issueId: string) =>
            cycleRepository.removeIssue(workspaceSlug, projectId, cycleId, issueId),
        onMutate: async (issueId): Promise<CycleMembershipContext> => {
            await qc.cancelQueries({ queryKey: cycleIssuesKey(workspaceSlug, projectId, cycleId) });
            const prevCycleIssues = qc.getQueryData<CycleIssueRef[]>(
                cycleIssuesKey(workspaceSlug, projectId, cycleId),
            );
            if (prevCycleIssues) {
                qc.setQueryData<CycleIssueRef[]>(
                    cycleIssuesKey(workspaceSlug, projectId, cycleId),
                    prevCycleIssues.filter((r) => r.issueId !== issueId),
                );
            }
            return { prevCycleIssues };
        },
        onError: (_err, _issueId, ctx) => {
            if (ctx?.prevCycleIssues) {
                qc.setQueryData(cycleIssuesKey(workspaceSlug, projectId, cycleId), ctx.prevCycleIssues);
            }
            toast.error('Error al quitar la tarea');
        },
        onSettled: () => {
            void qc.invalidateQueries({ queryKey: cycleIssuesKey(workspaceSlug, projectId, cycleId) });
            void qc.invalidateQueries({ queryKey: cyclesKey(workspaceSlug, projectId) });
            void qc.invalidateQueries({ queryKey: issuesKey(workspaceSlug, projectId) });
            void qc.invalidateQueries({ queryKey: ['module-issues', workspaceSlug, projectId] });
        },
        onSuccess: () => toast.success('Tarea quitada del ciclo'),
    });
};
