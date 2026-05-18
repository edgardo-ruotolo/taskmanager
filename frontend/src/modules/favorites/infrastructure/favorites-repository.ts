import { apiClient } from '@/shared/lib/api-client';
import type { Favorite, CreateFavoriteData } from '../domain/types';

export const favoritesRepository = {
    getAll: (workspaceSlug: string): Promise<Favorite[]> =>
        apiClient.get<Favorite[]>(`/api/workspaces/${workspaceSlug}/favorites`).then((r) => r.data),
    create: (workspaceSlug: string, data: CreateFavoriteData): Promise<Favorite> =>
        apiClient.post<Favorite>(`/api/workspaces/${workspaceSlug}/favorites`, data).then((r) => r.data),
    delete: (workspaceSlug: string, id: string): Promise<void> =>
        apiClient.delete(`/api/workspaces/${workspaceSlug}/favorites/${id}`).then(() => undefined),
};
