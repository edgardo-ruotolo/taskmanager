import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { searchSimilarIssues } from '../infrastructure/issue-repository';
import type { Issue } from '../domain/types';

export const useSimilarIssues = (
    workspaceSlug: string,
    companyId: string,
    title: string,
    enabled = true,
): { data: Issue[]; isLoading: boolean } => {
    const debouncedTitle = useDebounce(title, 500);

    const query = useQuery({
        queryKey: ['similar-issues', workspaceSlug, companyId, debouncedTitle],
        queryFn: () => searchSimilarIssues(workspaceSlug, companyId, { title: debouncedTitle }),
        enabled: enabled && !!debouncedTitle && debouncedTitle.length >= 3,
        staleTime: 30_000,
    });

    return { data: query.data ?? [], isLoading: query.isFetching };
};
