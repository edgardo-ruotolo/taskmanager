import { useQuery } from '@tanstack/react-query';
import { unsplashRepository } from '../infrastructure/unsplash-repository';
import type { UnsplashPhoto } from '../domain/types';

export function useUnsplashSearch(query: string) {
    return useQuery<UnsplashPhoto[]>({
        queryKey: ['unsplash', 'search', query],
        queryFn: () => unsplashRepository.searchPhotos(query),
        enabled: query.length > 0,
        staleTime: 5 * 60 * 1000,
    });
}
