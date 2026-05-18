import { useQuery } from '@tanstack/react-query';
import { searchRepository } from '../infrastructure/search-repository';

export const useSearch = (workspaceSlug: string, q: string) =>
    useQuery({
        queryKey: ['search', workspaceSlug, q],
        queryFn: () => searchRepository.search(workspaceSlug, q),
        enabled: !!workspaceSlug && q.trim().length >= 2,
        staleTime: 0,
    });
