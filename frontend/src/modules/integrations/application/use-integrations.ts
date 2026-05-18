import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { integrationsRepository } from '../infrastructure/integrations-repository';
import type { CreateGitHubRepoData } from '../domain/types';

// Query keys
export const githubStatusKey = (workspaceSlug: string) =>
    ['integrations', 'github', 'status', workspaceSlug] as const;

export const githubReposKey = (workspaceSlug: string) =>
    ['integrations', 'github', 'repos', workspaceSlug] as const;

export const slackStatusKey = (workspaceSlug: string) =>
    ['integrations', 'slack', 'status', workspaceSlug] as const;

// GitHub hooks
export const useGitHubStatus = (workspaceSlug: string) =>
    useQuery({
        queryKey: githubStatusKey(workspaceSlug),
        queryFn: () => integrationsRepository.getGitHubStatus(workspaceSlug),
        enabled: !!workspaceSlug,
        retry: false,
    });

export const useGitHubRepos = (workspaceSlug: string) =>
    useQuery({
        queryKey: githubReposKey(workspaceSlug),
        queryFn: () => integrationsRepository.getGitHubRepos(workspaceSlug),
        enabled: !!workspaceSlug,
        retry: false,
    });

export const useConnectGitHub = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (code: string) =>
            integrationsRepository.connectGitHub(workspaceSlug, code),
        onSuccess: (data) => {
            // Los endpoints de connect retornan { success: false, message: "..." }
            // Se muestra como toast informativo, no como error
            toast.info(data.message);
            void qc.invalidateQueries({ queryKey: githubStatusKey(workspaceSlug) });
        },
        onError: () => toast.error('Error al conectar con GitHub'),
    });
};

export const useDisconnectGitHub = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => integrationsRepository.disconnectGitHub(workspaceSlug),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: githubStatusKey(workspaceSlug) });
            toast.success('GitHub desconectado');
        },
        onError: () => toast.error('Error al desconectar GitHub'),
    });
};

export const useAddGitHubRepo = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateGitHubRepoData) =>
            integrationsRepository.addGitHubRepo(workspaceSlug, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: githubReposKey(workspaceSlug) });
            toast.success('Repositorio añadido');
        },
        onError: () => toast.error('Error al añadir el repositorio'),
    });
};

export const useRemoveGitHubRepo = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (repoId: string) =>
            integrationsRepository.removeGitHubRepo(workspaceSlug, repoId),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: githubReposKey(workspaceSlug) });
            toast.success('Repositorio eliminado');
        },
        onError: () => toast.error('Error al eliminar el repositorio'),
    });
};

// Slack hooks
export const useSlackStatus = (workspaceSlug: string) =>
    useQuery({
        queryKey: slackStatusKey(workspaceSlug),
        queryFn: () => integrationsRepository.getSlackStatus(workspaceSlug),
        enabled: !!workspaceSlug,
        retry: false,
    });

export const useConnectSlack = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (code: string) =>
            integrationsRepository.connectSlack(workspaceSlug, code),
        onSuccess: (data) => {
            toast.info(data.message);
            void qc.invalidateQueries({ queryKey: slackStatusKey(workspaceSlug) });
        },
        onError: () => toast.error('Error al conectar con Slack'),
    });
};

export const useDisconnectSlack = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => integrationsRepository.disconnectSlack(workspaceSlug),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: slackStatusKey(workspaceSlug) });
            toast.success('Slack desconectado');
        },
        onError: () => toast.error('Error al desconectar Slack'),
    });
};

export const useTestSlackMessage = (workspaceSlug: string) =>
    useMutation({
        mutationFn: () => integrationsRepository.testSlackMessage(workspaceSlug),
        onSuccess: (data) => {
            if (data.success) {
                toast.success(data.message);
            } else {
                toast.info(data.message);
            }
        },
        onError: () => toast.error('Error al enviar el mensaje de prueba'),
    });
