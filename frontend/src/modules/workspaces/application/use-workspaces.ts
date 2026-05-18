import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { workspaceRepository } from '../infrastructure/workspace-repository';
import type { CreateWorkspaceData } from '../domain/types';
import type { UpdateWorkspaceThemeData } from '../domain/theme-types';

export const WORKSPACES_KEY = ['workspaces'] as const;

export const useWorkspaces = () =>
    useQuery({
        queryKey: WORKSPACES_KEY,
        queryFn: () => workspaceRepository.getAll(),
    });

export const workspaceMembersKey = (slug: string) =>
    ['workspace-members', slug] as const;

export const workspaceInvitationsKey = (slug: string) =>
    ['workspace-invitations', slug] as const;

export const useWorkspaceMembers = (slug: string) =>
    useQuery({
        queryKey: workspaceMembersKey(slug),
        queryFn: () => workspaceRepository.getMembers(slug),
        enabled: !!slug,
    });

export const useCreateWorkspace = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateWorkspaceData) => workspaceRepository.create(data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: WORKSPACES_KEY });
            toast.success('Espacio de trabajo creado');
        },
        onError: () => toast.error('Error al crear el espacio de trabajo'),
    });
};

export const useWorkspaceTheme = (workspaceSlug: string) =>
    useQuery({
        queryKey: ['workspace', workspaceSlug, 'theme'] as const,
        queryFn: () => workspaceRepository.getTheme(workspaceSlug),
        enabled: !!workspaceSlug,
    });

export const useUpdateWorkspaceTheme = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: UpdateWorkspaceThemeData) => workspaceRepository.updateTheme(workspaceSlug, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: ['workspace', workspaceSlug, 'theme'] });
            toast.success('Tema actualizado');
        },
        onError: () => toast.error('Error al actualizar el tema'),
    });
};
