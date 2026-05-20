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

const base = (slug: string, companyId: string): string =>
    `/api/workspaces/${slug}/companies/${companyId}/cycles`;

export const useCycleProgress = (workspaceSlug: string, companyId: string, cycleId: string) =>
    useQuery({
        queryKey: ['cycles', workspaceSlug, companyId, cycleId, 'progress'] as const,
        queryFn: () =>
            apiClient
                .get<CycleProgress>(`${base(workspaceSlug, companyId)}/${cycleId}/progress`)
                .then((r) => r.data),
        enabled: !!workspaceSlug && !!companyId && !!cycleId,
    });

export const useCycleAnalytics = (workspaceSlug: string, companyId: string, cycleId: string) =>
    useQuery({
        queryKey: ['cycles', workspaceSlug, companyId, cycleId, 'analytics'] as const,
        queryFn: () =>
            apiClient
                .get<CycleAnalytics>(`${base(workspaceSlug, companyId)}/${cycleId}/analytics`)
                .then((r) => r.data),
        enabled: !!workspaceSlug && !!companyId && !!cycleId,
    });

export const useTransferCycleIssues = (workspaceSlug: string, companyId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ cycleId, targetCycleId }: { cycleId: string; targetCycleId: string }) =>
            apiClient
                .post(`${base(workspaceSlug, companyId)}/${cycleId}/transfer-issues`, { targetCycleId })
                .then(() => undefined),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: ['cycles', workspaceSlug, companyId] });
            toast.success('Issues transferidos');
        },
        onError: (error: unknown) => { const e = error as { response?: { data?: { message?: string } } }; toast.error(e?.response?.data?.message ?? 'Error al transferir issues'); },
    });
};
