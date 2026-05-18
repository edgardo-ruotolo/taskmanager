import { apiClient } from '@/shared/lib/api-client';
import type { SearchResults } from '../domain/types';

export const searchRepository = {
    search: (workspaceSlug: string, q: string): Promise<SearchResults> =>
        apiClient
            .get<SearchResults>(`/api/workspaces/${workspaceSlug}/search`, { params: { q } })
            .then((r) => r.data),
};
