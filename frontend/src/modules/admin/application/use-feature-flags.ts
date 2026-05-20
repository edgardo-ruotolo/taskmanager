import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { featureFlagRepository } from '../infrastructure/feature-flag-repository';
import type { UpdateFeatureFlagData } from '../domain/feature-flag-types';

export const featureFlagsKey = ['admin', 'feature-flags'] as const;

export const useFeatureFlags = () =>
    useQuery({
        queryKey: featureFlagsKey,
        queryFn: () => featureFlagRepository.getAll(),
        staleTime: 60_000,
    });

export const useUpdateFeatureFlag = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ key, data }: { key: string; data: UpdateFeatureFlagData }) =>
            featureFlagRepository.upsert(key, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: featureFlagsKey });
            toast.success('Feature flag actualizado');
        },
        onError: () => toast.error('Error al actualizar el feature flag'),
    });
};
