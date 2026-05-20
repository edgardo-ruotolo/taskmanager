import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { issueRepository } from '../infrastructure/issue-repository';
import type { Issue } from '../domain/types';
import { issuesKey } from './use-issues';
import { issueDetailKey } from './use-issue-detail';

interface ApproveIssueVars {
    issueId: string;
    targetStateId: string;
}

export const useApproveIssue = (workspaceSlug: string, companyId: string) => {
    const qc = useQueryClient();
    return useMutation<Issue, unknown, ApproveIssueVars>({
        mutationFn: ({ issueId, targetStateId }) =>
            issueRepository.approve(workspaceSlug, companyId, issueId, targetStateId),
        onSuccess: (_data, { issueId }) => {
            void qc.invalidateQueries({ queryKey: issuesKey(workspaceSlug, companyId) });
            void qc.invalidateQueries({ queryKey: issueDetailKey(workspaceSlug, companyId, issueId) });
            toast.success('Tarea aprobada y movida');
        },
        onError: () => {
            toast.error('Error al aprobar la tarea');
        },
    });
};
