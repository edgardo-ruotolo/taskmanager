import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { FieldValues, UseFormSetError } from 'react-hook-form';
import { useServerMutation } from '@/shared/hooks/useServerMutation';
import { trackEvent } from '@/shared/lib/posthog';
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

export const workspaceUsersSearchKey = (slug: string, query: string) =>
    ['workspace-users-search', slug, query] as const;

export const useWorkspaceMembers = (slug: string) =>
    useQuery({
        queryKey: workspaceMembersKey(slug),
        queryFn: () => workspaceRepository.getMembers(slug),
        enabled: !!slug,
    });

export const useSearchWorkspaceUsers = (slug: string, query: string, enabled = true) =>
    useQuery({
        queryKey: workspaceUsersSearchKey(slug, query),
        queryFn: () => workspaceRepository.searchUsers(slug, query),
        enabled: enabled && !!slug,
        staleTime: 30_000,
    });

export const useCreateWorkspace = <TFormValues extends FieldValues = FieldValues>(
    options?: { setError?: UseFormSetError<TFormValues> },
) => {
    const qc = useQueryClient();
    return useServerMutation<unknown, CreateWorkspaceData, TFormValues>({
        mutationFn: (data) => workspaceRepository.create(data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: WORKSPACES_KEY });
            trackEvent('workspace_created');
            toast.success('Espacio de trabajo creado');
        },
        setError: options?.setError,
        fallbackMessage: 'Error al crear el espacio de trabajo',
    });
};

export const useWorkspaceTheme = (workspaceSlug: string) =>
    useQuery({
        queryKey: ['workspace', workspaceSlug, 'theme'] as const,
        queryFn: () => workspaceRepository.getTheme(workspaceSlug),
        enabled: !!workspaceSlug,
    });

export const useUpdateWorkspaceTheme = <TFormValues extends FieldValues = FieldValues>(
    workspaceSlug: string,
    options?: { setError?: UseFormSetError<TFormValues> },
) => {
    const qc = useQueryClient();
    return useServerMutation<unknown, UpdateWorkspaceThemeData, TFormValues>({
        mutationFn: (data) => workspaceRepository.updateTheme(workspaceSlug, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: ['workspace', workspaceSlug, 'theme'] });
            toast.success('Tema actualizado');
        },
        setError: options?.setError,
        fallbackMessage: 'Error al actualizar el tema',
    });
};
