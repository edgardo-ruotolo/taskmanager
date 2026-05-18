import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { importerRepository } from '../infrastructure/importer-repository';
import type { ImporterHistory } from '../domain/types';

export const useImporterHistory = (
    workspaceSlug: string,
    companyId: string,
): ReturnType<typeof useQuery<ImporterHistory[]>> =>
    useQuery({
        queryKey: ['importer-history', workspaceSlug, companyId],
        queryFn: () => importerRepository.getHistory(workspaceSlug, companyId),
        enabled: Boolean(workspaceSlug) && Boolean(companyId),
    });

export const useUploadCsv = (workspaceSlug: string, companyId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (file: File) =>
            importerRepository.uploadCsv(workspaceSlug, companyId, file),
        onSuccess: () => {
            toast.success('Archivo importado correctamente');
            void queryClient.invalidateQueries({
                queryKey: ['importer-history', workspaceSlug, companyId],
            });
        },
        onError: () => {
            toast.error('Error al importar el archivo CSV');
        },
    });
};
