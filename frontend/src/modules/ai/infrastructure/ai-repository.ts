import { apiClient } from '@/shared/lib/api-client';
import type { AiCompletionResult, AiLabelSuggestion, AiSubIssuesResult } from '../domain/types';

export const aiRepository = {
    async completeText(workspaceSlug: string, prompt: string): Promise<string> {
        const { data } = await apiClient.post<AiCompletionResult>(
            `/api/workspaces/${workspaceSlug}/ai/complete`,
            { prompt },
        );
        return data.result;
    },

    async suggestLabels(
        workspaceSlug: string,
        title: string,
        description: string,
    ): Promise<string[]> {
        const { data } = await apiClient.post<AiLabelSuggestion>(
            `/api/workspaces/${workspaceSlug}/ai/suggest-labels`,
            { title, description },
        );
        return data.labels;
    },

    async improveText(workspaceSlug: string, text: string): Promise<string> {
        const { data } = await apiClient.post<AiCompletionResult>(
            `/api/workspaces/${workspaceSlug}/ai/improve-text`,
            { text },
        );
        return data.result;
    },

    async generateSubIssues(
        workspaceSlug: string,
        title: string,
        description: string,
        count?: number,
    ): Promise<string[]> {
        const { data } = await apiClient.post<AiSubIssuesResult>(
            `/api/workspaces/${workspaceSlug}/ai/generate-sub-issues`,
            { title, description, count },
        );
        return data.subIssues;
    },
};
