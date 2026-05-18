import { useMutation } from '@tanstack/react-query';
import { aiRepository } from '../infrastructure/ai-repository';

export function useImproveText(workspaceSlug: string) {
    return useMutation({
        mutationFn: (text: string) => aiRepository.improveText(workspaceSlug, text),
    });
}

export function useSuggestLabels(workspaceSlug: string) {
    return useMutation({
        mutationFn: ({ title, description }: { title: string; description: string }) =>
            aiRepository.suggestLabels(workspaceSlug, title, description),
    });
}

export function useGenerateSubIssues(workspaceSlug: string) {
    return useMutation({
        mutationFn: ({
            title,
            description,
            count,
        }: {
            title: string;
            description: string;
            count?: number;
        }) => aiRepository.generateSubIssues(workspaceSlug, title, description, count),
    });
}
