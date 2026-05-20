import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { homeRepository } from '../infrastructure/home-repository';
import type { CreateQuickLinkData, TrackVisitData } from '../domain/types';

export const useRecentVisits = (workspaceSlug: string, limit = 10) =>
    useQuery({
        queryKey: ['home', workspaceSlug, 'recent-visits'],
        queryFn: () => homeRepository.getRecentVisits(workspaceSlug, limit),
        enabled: !!workspaceSlug,
    });

export const useTrackVisit = (workspaceSlug: string) =>
    useMutation({
        mutationFn: (data: TrackVisitData) => homeRepository.trackVisit(workspaceSlug, data),
    });

export const useQuickLinks = (workspaceSlug: string) =>
    useQuery({
        queryKey: ['home', workspaceSlug, 'quick-links'],
        queryFn: () => homeRepository.getQuickLinks(workspaceSlug),
        enabled: !!workspaceSlug,
    });

export const useCreateQuickLink = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateQuickLinkData) => homeRepository.createQuickLink(workspaceSlug, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: ['home', workspaceSlug, 'quick-links'] });
            toast.success('Link agregado');
        },
        onError: (error: unknown) => { const e = error as { response?: { data?: { message?: string } } }; toast.error(e?.response?.data?.message ?? 'Error al agregar el link'); },
    });
};

export const useDeleteQuickLink = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (linkId: string) => homeRepository.deleteQuickLink(workspaceSlug, linkId),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: ['home', workspaceSlug, 'quick-links'] });
            toast.success('Link eliminado');
        },
        onError: (error: unknown) => { const e = error as { response?: { data?: { message?: string } } }; toast.error(e?.response?.data?.message ?? 'Error al eliminar el link'); },
    });
};
