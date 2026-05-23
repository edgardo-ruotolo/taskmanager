import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminRepository } from '../infrastructure/admin-repository';
import type {
    UpdateInstanceConfigData,
    CreateAdminUserData,
    UpdateAdminUserData,
    AdminAddWorkspaceMemberData,
    CreateAdminWorkspaceData,
    UpdateAdminWorkspaceData,
} from '../domain/types';

export const adminConfigKey = ['admin', 'config'] as const;
export const adminUsersKey = (page: number) => ['admin', 'users', page] as const;
export const adminWorkspacesKey = (page: number) => ['admin', 'workspaces', page] as const;
export const adminWorkspaceMembersKey = (workspaceId: string) =>
    ['admin', 'workspaces', workspaceId, 'members'] as const;
export const adminStateGroupsKey = ['admin', 'state-groups'] as const;

export const useInstanceConfig = () =>
    useQuery({
        queryKey: adminConfigKey,
        queryFn: adminRepository.getConfig,
    });

export const useUpdateInstanceConfig = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: UpdateInstanceConfigData) => adminRepository.updateConfig(data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: adminConfigKey });
            toast.success('Configuración guardada');
        },
        onError: (error: unknown) => { const e = error as { response?: { data?: { message?: string } } }; toast.error(e?.response?.data?.message ?? 'Error al guardar'); },
    });
};

export const useAdminUsers = (page = 1) =>
    useQuery({
        queryKey: adminUsersKey(page),
        queryFn: () => adminRepository.getUsers(page),
    });

export const useCreateAdminUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateAdminUserData) => adminRepository.createUser(data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
            toast.success('Usuario creado');
        },
        onError: (error: unknown) => { const e = error as { response?: { data?: { message?: string } } }; toast.error(e?.response?.data?.message ?? 'Error al crear usuario'); },
    });
};

export const useUpdateAdminUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateAdminUserData }) =>
            adminRepository.updateUser(id, data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
            void queryClient.invalidateQueries({ queryKey: ['workspace-members'] });
            void queryClient.invalidateQueries({ queryKey: ['admin', 'project-members'] });
            void queryClient.invalidateQueries({ queryKey: ['notifications'] });
            toast.success('Usuario actualizado');
        },
        onError: (error: unknown) => { const e = error as { response?: { data?: { message?: string } } }; toast.error(e?.response?.data?.message ?? 'Error al actualizar usuario'); },
    });
};

export const useDeleteAdminUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => adminRepository.deleteUser(id),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
            void queryClient.invalidateQueries({ queryKey: ['workspace-members'] });
            void queryClient.invalidateQueries({ queryKey: ['admin', 'project-members'] });
            void queryClient.invalidateQueries({ queryKey: ['notifications'] });
            void queryClient.invalidateQueries({ queryKey: ['issue-subscribers'] });
            void queryClient.invalidateQueries({ queryKey: ['comments'] });
            void queryClient.invalidateQueries({ queryKey: ['activities'] });
            toast.success('Usuario eliminado');
        },
        onError: (error: unknown) => { const e = error as { response?: { data?: { message?: string } } }; toast.error(e?.response?.data?.message ?? 'Error al eliminar usuario'); },
    });
};

// ─── Admin Workspaces ─────────────────────────────────────────────────────────

export const useAdminWorkspaces = (page = 1) =>
    useQuery({
        queryKey: adminWorkspacesKey(page),
        queryFn: () => adminRepository.getWorkspaces(page),
    });

export const useCreateAdminWorkspace = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateAdminWorkspaceData) => adminRepository.createWorkspace(data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['admin', 'workspaces'] });
            void queryClient.invalidateQueries({ queryKey: ['workspaces'] });
            toast.success('Workspace creado');
        },
        onError: (error: unknown) => {
            const e = error as { response?: { data?: { message?: string; error?: string } } };
            toast.error(e?.response?.data?.message ?? e?.response?.data?.error ?? 'Error al crear workspace');
        },
    });
};

export const useUpdateAdminWorkspace = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateAdminWorkspaceData }) =>
            adminRepository.updateWorkspace(id, data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['admin', 'workspaces'] });
            void queryClient.invalidateQueries({ queryKey: ['workspaces'] });
            toast.success('Workspace actualizado');
        },
        onError: (error: unknown) => {
            const e = error as { response?: { data?: { message?: string; error?: string } } };
            toast.error(e?.response?.data?.message ?? e?.response?.data?.error ?? 'Error al actualizar workspace');
        },
    });
};

export const useDeleteAdminWorkspace = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => adminRepository.deleteWorkspace(id),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['admin', 'workspaces'] });
            void queryClient.invalidateQueries({ queryKey: ['workspaces'] });
            toast.success('Workspace eliminado');
        },
        onError: (error: unknown) => {
            const e = error as { response?: { data?: { message?: string; error?: string } } };
            toast.error(e?.response?.data?.message ?? e?.response?.data?.error ?? 'Error al eliminar workspace');
        },
    });
};

export const useAdminWorkspaceMembers = (workspaceId: string | null) =>
    useQuery({
        queryKey: adminWorkspaceMembersKey(workspaceId ?? ''),
        queryFn: () => {
            if (workspaceId === null) return Promise.resolve([]);
            return adminRepository.getWorkspaceMembers(workspaceId);
        },
        enabled: workspaceId !== null,
    });

export const useAddWorkspaceMember = (workspaceId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: AdminAddWorkspaceMemberData) =>
            adminRepository.addWorkspaceMember(workspaceId, data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: adminWorkspaceMembersKey(workspaceId) });
            void queryClient.invalidateQueries({ queryKey: ['workspace-members'] });
            toast.success('Miembro agregado');
        },
        onError: (error: unknown) => {
            const e = error as { response?: { data?: { message?: string; error?: string } } };
            toast.error(e?.response?.data?.message ?? e?.response?.data?.error ?? 'Error al agregar miembro');
        },
    });
};

export const useRemoveWorkspaceMember = (workspaceId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userId: string) => adminRepository.removeWorkspaceMember(workspaceId, userId),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: adminWorkspaceMembersKey(workspaceId) });
            void queryClient.invalidateQueries({ queryKey: ['workspace-members'] });
            toast.success('Miembro removido');
        },
        onError: (error: unknown) => {
            const e = error as { response?: { data?: { message?: string; error?: string } } };
            toast.error(e?.response?.data?.message ?? e?.response?.data?.error ?? 'Error al remover miembro');
        },
    });
};
