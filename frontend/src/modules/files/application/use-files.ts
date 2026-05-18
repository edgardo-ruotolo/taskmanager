import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { filesRepository } from '../infrastructure/files-repository';

const listKey = (workspaceSlug: string, entityType: string, entityId: string) =>
    ['files', workspaceSlug, entityType, entityId] as const;

export const useFileAssets = (
    workspaceSlug: string,
    entityType: string,
    entityId: string,
) =>
    useQuery({
        queryKey: listKey(workspaceSlug, entityType, entityId),
        queryFn: () => filesRepository.getAll(workspaceSlug, entityType, entityId),
        enabled: !!workspaceSlug && !!entityType && !!entityId,
    });

export const useUploadFile = (
    workspaceSlug: string,
    entityType: string,
    entityId: string,
) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (file: File) =>
            filesRepository.upload(workspaceSlug, file, entityType, entityId),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: listKey(workspaceSlug, entityType, entityId) });
            toast.success('Archivo subido');
        },
        onError: () => toast.error('Error al subir el archivo'),
    });
};

export const useDeleteFile = (
    workspaceSlug: string,
    entityType: string,
    entityId: string,
) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (assetId: string) => filesRepository.delete(workspaceSlug, assetId),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: listKey(workspaceSlug, entityType, entityId) });
            toast.success('Archivo eliminado');
        },
        onError: () => toast.error('Error al eliminar el archivo'),
    });
};
