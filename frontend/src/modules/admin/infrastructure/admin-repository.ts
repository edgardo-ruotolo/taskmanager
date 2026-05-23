import { apiClient } from '@/shared/lib/api-client';
import type { PagedResult } from '@/shared/types/pagination';
import type {
    AdminUserDto,
    InstanceConfig,
    UpdateInstanceConfigData,
    CreateAdminUserData,
    UpdateAdminUserData,
    AdminWorkspaceDto,
    AdminWorkspaceMemberDto,
    AdminAddWorkspaceMemberData,
    CreateAdminWorkspaceData,
    UpdateAdminWorkspaceData,
} from '../domain/types';

export const adminRepository = {
    getConfig: (): Promise<InstanceConfig> =>
        apiClient.get<InstanceConfig>('/api/admin/config').then((r) => r.data),
    updateConfig: (data: UpdateInstanceConfigData): Promise<InstanceConfig> =>
        apiClient.patch<InstanceConfig>('/api/admin/config', data).then((r) => r.data),
    getUsers: (page = 1): Promise<PagedResult<AdminUserDto>> =>
        apiClient.get<PagedResult<AdminUserDto>>(`/api/admin/users?page=${page}`).then((r) => r.data),
    createUser: (data: CreateAdminUserData): Promise<AdminUserDto> =>
        apiClient.post<AdminUserDto>('/api/admin/users', data).then((r) => r.data),
    updateUser: (id: string, data: UpdateAdminUserData): Promise<AdminUserDto> =>
        apiClient.put<AdminUserDto>(`/api/admin/users/${id}`, data).then((r) => r.data),
    deleteUser: (id: string): Promise<void> =>
        apiClient.delete(`/api/admin/users/${id}`).then(() => undefined),
    getWorkspaces: (page = 1): Promise<PagedResult<AdminWorkspaceDto>> =>
        apiClient.get<PagedResult<AdminWorkspaceDto>>(`/api/admin/workspaces?page=${page}`).then((r) => r.data),
    createWorkspace: (data: CreateAdminWorkspaceData): Promise<AdminWorkspaceDto> =>
        apiClient.post<AdminWorkspaceDto>('/api/admin/workspaces', data).then((r) => r.data),
    updateWorkspace: (id: string, data: UpdateAdminWorkspaceData): Promise<AdminWorkspaceDto> =>
        apiClient.put<AdminWorkspaceDto>(`/api/admin/workspaces/${id}`, data).then((r) => r.data),
    deleteWorkspace: (id: string): Promise<void> =>
        apiClient.delete(`/api/admin/workspaces/${id}`).then(() => undefined),
    getWorkspaceMembers: (workspaceId: string): Promise<AdminWorkspaceMemberDto[]> =>
        apiClient.get<AdminWorkspaceMemberDto[]>(`/api/admin/workspaces/${workspaceId}/members`).then((r) => r.data),
    addWorkspaceMember: (workspaceId: string, data: AdminAddWorkspaceMemberData): Promise<AdminWorkspaceMemberDto> =>
        apiClient.post<AdminWorkspaceMemberDto>(`/api/admin/workspaces/${workspaceId}/members`, data).then((r) => r.data),
    removeWorkspaceMember: (workspaceId: string, userId: string): Promise<void> =>
        apiClient.delete(`/api/admin/workspaces/${workspaceId}/members/${userId}`).then(() => undefined),
};
