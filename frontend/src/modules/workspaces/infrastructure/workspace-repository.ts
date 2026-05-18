import { apiClient } from '@/shared/lib/api-client';
import type { PagedResult } from '@/shared/types/pagination';
import type {
    Workspace,
    CreateWorkspaceData,
    UpdateWorkspaceData,
    WorkspaceMember,
    WorkspaceInvitation,
    CreateInvitationData,
} from '../domain/types';
import type { WorkspaceTheme, UpdateWorkspaceThemeData } from '../domain/theme-types';

export const workspaceRepository = {
    getAll: (): Promise<PagedResult<Workspace>> =>
        apiClient.get<PagedResult<Workspace>>('/api/workspaces').then((r) => r.data),
    getBySlug: (slug: string): Promise<Workspace> =>
        apiClient.get<Workspace>(`/api/workspaces/${slug}`).then((r) => r.data),
    create: (data: CreateWorkspaceData): Promise<Workspace> =>
        apiClient.post<Workspace>('/api/workspaces', data).then((r) => r.data),
    update: (slug: string, data: UpdateWorkspaceData): Promise<Workspace> =>
        apiClient.patch<Workspace>(`/api/workspaces/${slug}`, data).then((r) => r.data),
    delete: (slug: string): Promise<void> =>
        apiClient.delete(`/api/workspaces/${slug}`).then(() => undefined),
    getMembers: (slug: string): Promise<WorkspaceMember[]> =>
        apiClient.get<WorkspaceMember[]>(`/api/workspaces/${slug}/members`).then((r) => r.data),
    removeMember: (slug: string, userId: string): Promise<void> =>
        apiClient.delete(`/api/workspaces/${slug}/members/${userId}`).then(() => undefined),
    updateMemberRole: (slug: string, userId: string, role: string): Promise<WorkspaceMember> =>
        apiClient
            .patch<WorkspaceMember>(`/api/workspaces/${slug}/members/${userId}/role`, { role })
            .then((r) => r.data),
    getInvitations: (slug: string): Promise<WorkspaceInvitation[]> =>
        apiClient.get<WorkspaceInvitation[]>(`/api/workspaces/${slug}/invitations`).then((r) => r.data),
    invite: (slug: string, data: CreateInvitationData): Promise<WorkspaceInvitation> =>
        apiClient.post<WorkspaceInvitation>(`/api/workspaces/${slug}/invitations`, data).then((r) => r.data),
    revokeInvitation: (slug: string, id: string): Promise<void> =>
        apiClient.delete(`/api/workspaces/${slug}/invitations/${id}`).then(() => undefined),
    acceptInvitation: (slug: string, token: string): Promise<void> =>
        apiClient.post(`/api/workspaces/${slug}/invitations/${token}/accept`).then(() => undefined),
    getTheme: (workspaceSlug: string): Promise<WorkspaceTheme> =>
        apiClient.get<WorkspaceTheme>(`/api/workspaces/${workspaceSlug}/theme`).then((r) => r.data),
    updateTheme: (workspaceSlug: string, data: UpdateWorkspaceThemeData): Promise<WorkspaceTheme> =>
        apiClient.patch<WorkspaceTheme>(`/api/workspaces/${workspaceSlug}/theme`, data).then((r) => r.data),
};
