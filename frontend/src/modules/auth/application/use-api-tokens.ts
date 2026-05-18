import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authRepository } from '../infrastructure/auth-repository';
import type { CreateApiTokenData } from '../domain/types';

export const apiTokensKey = ['api-tokens'] as const;

export const useApiTokens = () =>
    useQuery({
        queryKey: apiTokensKey,
        queryFn: () => authRepository.getTokens(),
    });

export const useCreateApiToken = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateApiTokenData) => authRepository.createToken(data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: apiTokensKey });
        },
        onError: () => toast.error('Error al crear el token'),
    });
};

export const useRevokeApiToken = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => authRepository.revokeToken(id),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: apiTokensKey });
            toast.success('Token revocado');
        },
        onError: () => toast.error('Error al revocar el token'),
    });
};
