import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/shared/lib/api-client';

interface CycleProgress {
    totalIssues: number;
    completedIssues: number;
    inProgressIssues: number;
    pendingIssues: number;
    completionPercentage: number;
}

interface CycleAnalytics {
    totalIssues: number;
    completedIssues: number;
    completionPercentage: number;
    issuesByPriority: Record<string, number>;
    issuesByState: Record<string, number>;
}

const base = (slug: string, projectId: string): string =>
    `/api/workspaces/${slug}/projects/${projectId}/cycles`;

export const useCycleProgress = (workspaceSlug: string, projectId: string, cycleId: string) =>
    useQuery({
        queryKey: ['cycles', workspaceSlug, projectId, cycleId, 'progress'] as const,
        queryFn: () =>
            apiClient
                .get<CycleProgress>(`${base(workspaceSlug, projectId)}/${cycleId}/progress`)
                .then((r) => r.data),
        enabled: !!workspaceSlug && !!projectId && !!cycleId,
    });

export const useCycleAnalytics = (workspaceSlug: string, projectId: string, cycleId: string) =>
    useQuery({
        queryKey: ['cycles', workspaceSlug, projectId, cycleId, 'analytics'] as const,
        queryFn: () =>
            apiClient
                .get<CycleAnalytics>(`${base(workspaceSlug, projectId)}/${cycleId}/analytics`)
                .then((r) => r.data),
        enabled: !!workspaceSlug && !!projectId && !!cycleId,
    });

export const useTransferCycleIssues = (workspaceSlug: string, projectId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ cycleId, targetCycleId }: { cycleId: string; targetCycleId: string }) =>
            apiClient
                .post(`${base(workspaceSlug, projectId)}/${cycleId}/transfer-issues`, { targetCycleId })
                .then(() => undefined),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: ['cycles', workspaceSlug, projectId] });
            toast.success('Issues transferidos');
        },
        onError: (error: unknown) => { const e = error as { response?: { data?: { message?: string } } }; toast.error(e?.response?.data?.message ?? 'Error al transferir issues'); },
    });
};
