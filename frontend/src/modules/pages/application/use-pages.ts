import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { pagesRepository } from '../infrastructure/pages-repository';
import type { CreatePageData, UpdatePageData } from '../domain/types';

const listKey = (workspaceSlug: string) => ['pages', workspaceSlug] as const;
const detailKey = (workspaceSlug: string, id: string) => ['pages', workspaceSlug, id] as const;
const versionsKey = (workspaceSlug: string, id: string) =>
    ['page-versions', workspaceSlug, id] as const;

export const usePages = (workspaceSlug: string, archived = false) =>
    useQuery({
        queryKey: [...listKey(workspaceSlug), { archived }],
        queryFn: () => pagesRepository.getAll(workspaceSlug, archived),
        enabled: !!workspaceSlug,
    });

export const usePage = (workspaceSlug: string, id: string) =>
    useQuery({
        queryKey: detailKey(workspaceSlug, id),
        queryFn: () => pagesRepository.getOne(workspaceSlug, id),
        enabled: !!workspaceSlug && !!id,
    });

export const usePageVersions = (workspaceSlug: string, id: string) =>
    useQuery({
        queryKey: versionsKey(workspaceSlug, id),
        queryFn: () => pagesRepository.getVersions(workspaceSlug, id),
        enabled: !!workspaceSlug && !!id,
    });

export const useCreatePage = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreatePageData) => pagesRepository.create(workspaceSlug, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: listKey(workspaceSlug) });
            toast.success('Página creada');
        },
        onError: () => toast.error('Error al crear la página'),
    });
};

export const useUpdatePage = (workspaceSlug: string, id: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: UpdatePageData) => pagesRepository.update(workspaceSlug, id, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: listKey(workspaceSlug) });
            void qc.invalidateQueries({ queryKey: detailKey(workspaceSlug, id) });
            void qc.invalidateQueries({ queryKey: versionsKey(workspaceSlug, id) });
        },
        onError: () => toast.error('Error al guardar la página'),
    });
};

export const useDeletePage = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => pagesRepository.delete(workspaceSlug, id),
        onSuccess: (_, id) => {
            void qc.invalidateQueries({ queryKey: listKey(workspaceSlug) });
            qc.removeQueries({ queryKey: detailKey(workspaceSlug, id) });
            toast.success('Página eliminada');
        },
        onError: () => toast.error('Error al eliminar la página'),
    });
};

export const useArchivePage = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => pagesRepository.archive(workspaceSlug, id),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: listKey(workspaceSlug) });
            toast.success('Página archivada');
        },
        onError: () => toast.error('Error al archivar la página'),
    });
};

export const useUnarchivePage = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => pagesRepository.unarchive(workspaceSlug, id),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: listKey(workspaceSlug) });
            toast.success('Página restaurada del archivo');
        },
        onError: () => toast.error('Error al restaurar la página'),
    });
};

export const useLockPage = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => pagesRepository.lock(workspaceSlug, id),
        onSuccess: (_, id) => {
            void qc.invalidateQueries({ queryKey: detailKey(workspaceSlug, id) });
            toast.success('Página bloqueada');
        },
        onError: () => toast.error('Error al bloquear la página'),
    });
};

export const useUnlockPage = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => pagesRepository.unlock(workspaceSlug, id),
        onSuccess: (_, id) => {
            void qc.invalidateQueries({ queryKey: detailKey(workspaceSlug, id) });
            toast.success('Página desbloqueada');
        },
        onError: () => toast.error('Error al desbloquear la página'),
    });
};

export const useDuplicatePage = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, title }: { id: string; title: string }) =>
            pagesRepository.duplicate(workspaceSlug, id, title),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: listKey(workspaceSlug) });
            toast.success('Página duplicada');
        },
        onError: () => toast.error('Error al duplicar la página'),
    });
};

export const useRestorePageVersion = (workspaceSlug: string, id: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (versionId: string) => pagesRepository.restoreVersion(workspaceSlug, id, versionId),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: detailKey(workspaceSlug, id) });
            void qc.invalidateQueries({ queryKey: versionsKey(workspaceSlug, id) });
            toast.success('Versión restaurada');
        },
        onError: () => toast.error('Error al restaurar la versión'),
    });
};
