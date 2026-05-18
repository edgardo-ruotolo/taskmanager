import { apiClient } from '@/shared/lib/api-client';
import type { UnsplashPhoto } from '../domain/types';

interface UnsplashSearchResponse {
    photos: UnsplashPhoto[];
}

export const unsplashRepository = {
    async searchPhotos(query: string): Promise<UnsplashPhoto[]> {
        const { data } = await apiClient.get<UnsplashSearchResponse>('/api/unsplash/search', {
            params: { query },
        });
        return data.photos;
    },
};
