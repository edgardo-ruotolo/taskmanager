import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { favoritesRepository } from '../infrastructure/favorites-repository';
import type { CreateFavoriteData } from '../domain/types';

export const useFavorites = (workspaceSlug: string) =>
    useQuery({
        queryKey: ['favorites', workspaceSlug],
        queryFn: () => favoritesRepository.getAll(workspaceSlug),
        enabled: !!workspaceSlug,
    });

export const useToggleFavorite = (workspaceSlug: string) => {
    const queryClient = useQueryClient();
    const { data: favorites } = useFavorites(workspaceSlug);

    const createMutation = useMutation({
        mutationFn: (data: CreateFavoriteData) => favoritesRepository.create(workspaceSlug, data),
        onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['favorites', workspaceSlug] }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => favoritesRepository.delete(workspaceSlug, id),
        onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['favorites', workspaceSlug] }),
    });

    const toggle = (entityType: string, entityId: string): void => {
        const existing = favorites?.find((f) => f.entityType === entityType && f.entityId === entityId);
        if (existing) deleteMutation.mutate(existing.id);
        else createMutation.mutate({ entityType, entityId });
    };

    const isFavorite = (entityType: string, entityId: string): boolean =>
        !!favorites?.find((f) => f.entityType === entityType && f.entityId === entityId);

    return { toggle, isFavorite, isPending: createMutation.isPending || deleteMutation.isPending };
};
