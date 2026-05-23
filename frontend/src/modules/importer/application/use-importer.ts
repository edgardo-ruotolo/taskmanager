import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { importerRepository } from '../infrastructure/importer-repository';
import type { ImporterHistory } from '../domain/types';

export const useImporterHistory = (
    workspaceSlug: string,
    projectId: string,
): ReturnType<typeof useQuery<ImporterHistory[]>> =>
    useQuery({
        queryKey: ['importer-history', workspaceSlug, projectId],
        queryFn: () => importerRepository.getHistory(workspaceSlug, projectId),
        enabled: Boolean(workspaceSlug) && Boolean(projectId),
    });

export const useUploadCsv = (workspaceSlug: string, projectId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (file: File) =>
            importerRepository.uploadCsv(workspaceSlug, projectId, file),
        onSuccess: () => {
            toast.success('Archivo importado correctamente');
            void queryClient.invalidateQueries({
                queryKey: ['importer-history', workspaceSlug, projectId],
            });
        },
        onError: () => {
            toast.error('Error al importar el archivo CSV');
        },
    });
};
