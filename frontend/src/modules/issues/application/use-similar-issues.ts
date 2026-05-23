import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { searchSimilarIssues } from '../infrastructure/issue-repository';
import type { Issue } from '../domain/types';

export const useSimilarIssues = (
    workspaceSlug: string,
    projectId: string,
    title: string,
    enabled = true,
): { data: Issue[]; isLoading: boolean } => {
    const debouncedTitle = useDebounce(title, 500);

    const query = useQuery({
        queryKey: ['similar-issues', workspaceSlug, projectId, debouncedTitle],
        queryFn: () => searchSimilarIssues(workspaceSlug, projectId, { title: debouncedTitle }),
        enabled: enabled && !!debouncedTitle && debouncedTitle.length >= 3,
        staleTime: 30_000,
    });

    return { data: query.data ?? [], isLoading: query.isFetching };
};
