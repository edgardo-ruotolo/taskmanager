import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { FieldValues, UseFormSetError } from 'react-hook-form';
import { useServerMutation } from '@/shared/hooks/useServerMutation';
import { cycleRepository } from '../infrastructure/cycle-repository';
import type { CreateCycleData, CycleIssueRef } from '../domain/types';
import { issuesKey } from '@/modules/issues/application/use-issues';
import type { Issue } from '@/modules/issues/domain/types';
import type { PagedResult } from '@/shared/types/pagination';

export const cyclesKey = (workspaceSlug: string, companyId: string) =>
    ['cycles', workspaceSlug, companyId] as const;

export const useCycles = (workspaceSlug: string, companyId: string) =>
    useQuery({
        queryKey: cyclesKey(workspaceSlug, companyId),
        queryFn: () => cycleRepository.getAll(workspaceSlug, companyId),
        enabled: !!workspaceSlug && !!companyId,
    });

export const useCreateCycle = <TFormValues extends FieldValues = FieldValues>(
    workspaceSlug: string,
    companyId: string,
    options?: { setError?: UseFormSetError<TFormValues> },
) => {
    const qc = useQueryClient();
    return useServerMutation<unknown, CreateCycleData, TFormValues>({
        mutationFn: (data) =>
            cycleRepository.create(workspaceSlug, companyId, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: cyclesKey(workspaceSlug, companyId) });
            toast.success('Ciclo creado');
        },
        setError: options?.setError,
        fallbackMessage: 'Error al crear el ciclo',
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

interface CycleMembershipContext {
    prevCycleIssues?: CycleIssueRef[];
}

export const useAddCycleIssue = (workspaceSlug: string, companyId: string, cycleId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (issueId: string) =>
            cycleRepository.addIssue(workspaceSlug, companyId, cycleId, issueId),
        onMutate: async (issueId): Promise<CycleMembershipContext> => {
            await qc.cancelQueries({ queryKey: cycleIssuesKey(workspaceSlug, companyId, cycleId) });
            const prevCycleIssues = qc.getQueryData<CycleIssueRef[]>(
                cycleIssuesKey(workspaceSlug, companyId, cycleId),
            );

            // Synthesize a CycleIssueRef from the global issues list.
            const issuesData = qc.getQueryData<PagedResult<Issue> | Issue[]>(issuesKey(workspaceSlug, companyId));
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
                        cycleIssuesKey(workspaceSlug, companyId, cycleId),
                        [...prevCycleIssues, optimisticRef],
                    );
                }
            }
            return { prevCycleIssues };
        },
        onError: (_err, _issueId, ctx) => {
            if (ctx?.prevCycleIssues) {
                qc.setQueryData(cycleIssuesKey(workspaceSlug, companyId, cycleId), ctx.prevCycleIssues);
            }
            toast.error('Error al agregar la tarea');
        },
        onSettled: () => {
            void qc.invalidateQueries({ queryKey: cycleIssuesKey(workspaceSlug, companyId, cycleId) });
            void qc.invalidateQueries({ queryKey: cyclesKey(workspaceSlug, companyId) });
            void qc.invalidateQueries({ queryKey: issuesKey(workspaceSlug, companyId) });
            void qc.invalidateQueries({ queryKey: ['module-issues', workspaceSlug, companyId] });
        },
        onSuccess: () => toast.success('Tarea agregada al ciclo'),
    });
};

export const useRemoveCycleIssue = (workspaceSlug: string, companyId: string, cycleId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (issueId: string) =>
            cycleRepository.removeIssue(workspaceSlug, companyId, cycleId, issueId),
        onMutate: async (issueId): Promise<CycleMembershipContext> => {
            await qc.cancelQueries({ queryKey: cycleIssuesKey(workspaceSlug, companyId, cycleId) });
            const prevCycleIssues = qc.getQueryData<CycleIssueRef[]>(
                cycleIssuesKey(workspaceSlug, companyId, cycleId),
            );
            if (prevCycleIssues) {
                qc.setQueryData<CycleIssueRef[]>(
                    cycleIssuesKey(workspaceSlug, companyId, cycleId),
                    prevCycleIssues.filter((r) => r.issueId !== issueId),
                );
            }
            return { prevCycleIssues };
        },
        onError: (_err, _issueId, ctx) => {
            if (ctx?.prevCycleIssues) {
                qc.setQueryData(cycleIssuesKey(workspaceSlug, companyId, cycleId), ctx.prevCycleIssues);
            }
            toast.error('Error al quitar la tarea');
        },
        onSettled: () => {
            void qc.invalidateQueries({ queryKey: cycleIssuesKey(workspaceSlug, companyId, cycleId) });
            void qc.invalidateQueries({ queryKey: cyclesKey(workspaceSlug, companyId) });
            void qc.invalidateQueries({ queryKey: issuesKey(workspaceSlug, companyId) });
            void qc.invalidateQueries({ queryKey: ['module-issues', workspaceSlug, companyId] });
        },
        onSuccess: () => toast.success('Tarea quitada del ciclo'),
    });
};
