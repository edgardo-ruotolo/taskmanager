import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { spaceRepository } from '../infrastructure/space-repository';
import type { CreateDeployBoardData } from '../domain/types';

export const deployBoardsKey = (workspaceSlug: string, projectId: string) =>
    ['deploy-boards', workspaceSlug, projectId] as const;

export const publicSpaceKey = (token: string) =>
    ['public-space', token] as const;

export const useDeployBoards = (workspaceSlug: string, projectId: string) =>
    useQuery({
        queryKey: deployBoardsKey(workspaceSlug, projectId),
        queryFn: () => spaceRepository.getBoards(workspaceSlug, projectId),
        enabled: !!workspaceSlug && !!projectId,
    });

export const useCreateDeployBoard = (workspaceSlug: string, projectId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateDeployBoardData) =>
            spaceRepository.createBoard(workspaceSlug, projectId, data),
        onSuccess: () => {
            void qc.invalidateQueries({
                queryKey: deployBoardsKey(workspaceSlug, projectId),
            });
            toast.success('Tablero publicado correctamente');
        },
        onError: (error: unknown) => { const e = error as { response?: { data?: { message?: string } } }; toast.error(e?.response?.data?.message ?? 'Error al publicar el tablero'); },
    });
};

export const useDeleteDeployBoard = (workspaceSlug: string, projectId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (boardId: string) =>
            spaceRepository.deleteBoard(workspaceSlug, projectId, boardId),
        onSuccess: () => {
            void qc.invalidateQueries({
                queryKey: deployBoardsKey(workspaceSlug, projectId),
            });
            toast.success('Tablero eliminado');
        },
        onError: (error: unknown) => { const e = error as { response?: { data?: { message?: string } } }; toast.error(e?.response?.data?.message ?? 'Error al eliminar el tablero'); },
    });
};

export const usePublicSpace = (token: string) =>
    useQuery({
        queryKey: publicSpaceKey(token),
        queryFn: () => spaceRepository.getPublicSpace(token),
        enabled: !!token,
        retry: false,
    });
