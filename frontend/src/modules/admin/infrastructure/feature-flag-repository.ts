import { apiClient } from '@/shared/lib/api-client';
import type { FeatureFlag, UpdateFeatureFlagData } from '../domain/feature-flag-types';

export const featureFlagRepository = {
    getAll: (): Promise<FeatureFlag[]> =>
        apiClient.get<FeatureFlag[]>('/api/admin/feature-flags').then((r) => r.data),

    upsert: (key: string, data: UpdateFeatureFlagData): Promise<FeatureFlag> =>
        apiClient
            .patch<FeatureFlag>(`/api/admin/feature-flags/${encodeURIComponent(key)}`, data)
            .then((r) => r.data),
};
