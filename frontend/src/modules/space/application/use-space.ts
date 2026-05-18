import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { spaceRepository } from '../infrastructure/space-repository';
import type { CreateDeployBoardData } from '../domain/types';

export const deployBoardsKey = (workspaceSlug: string, companyId: string) =>
    ['deploy-boards', workspaceSlug, companyId] as const;

export const publicSpaceKey = (token: string) =>
    ['public-space', token] as const;

export const useDeployBoards = (workspaceSlug: string, companyId: string) =>
    useQuery({
        queryKey: deployBoardsKey(workspaceSlug, companyId),
        queryFn: () => spaceRepository.getBoards(workspaceSlug, companyId),
        enabled: !!workspaceSlug && !!companyId,
    });

export const useCreateDeployBoard = (workspaceSlug: string, companyId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateDeployBoardData) =>
            spaceRepository.createBoard(workspaceSlug, companyId, data),
        onSuccess: () => {
            void qc.invalidateQueries({
                queryKey: deployBoardsKey(workspaceSlug, companyId),
            });
            toast.success('Tablero publicado correctamente');
        },
        onError: () => toast.error('Error al publicar el tablero'),
    });
};

export const useDeleteDeployBoard = (workspaceSlug: string, companyId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (boardId: string) =>
            spaceRepository.deleteBoard(workspaceSlug, companyId, boardId),
        onSuccess: () => {
            void qc.invalidateQueries({
                queryKey: deployBoardsKey(workspaceSlug, companyId),
            });
            toast.success('Tablero eliminado');
        },
        onError: () => toast.error('Error al eliminar el tablero'),
    });
};

export const usePublicSpace = (token: string) =>
    useQuery({
        queryKey: publicSpaceKey(token),
        queryFn: () => spaceRepository.getPublicSpace(token),
        enabled: !!token,
        retry: false,
    });
