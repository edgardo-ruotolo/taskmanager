import { apiClient } from '@/shared/lib/api-client';
import type { PagedResult } from '@/shared/types/pagination';
import type {
    Workspace,
    CreateWorkspaceData,
    UpdateWorkspaceData,
    WorkspaceMember,
    WorkspaceRole,
    WorkspaceUserSearchResult,
    AddMemberData,
    CreateUserAndAddMemberData,
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
    updateMemberRole: (slug: string, userId: string, role: WorkspaceRole): Promise<WorkspaceMember> =>
        apiClient
            .patch<WorkspaceMember>(`/api/workspaces/${slug}/members/${userId}/role`, { role })
            .then((r) => r.data),
    searchUsers: (slug: string, query: string, limit = 10): Promise<WorkspaceUserSearchResult[]> =>
        apiClient
            .get<WorkspaceUserSearchResult[]>(`/api/workspaces/${slug}/users/search`, {
                params: { q: query, limit },
            })
            .then((r) => r.data),
    addMember: (slug: string, data: AddMemberData): Promise<WorkspaceMember> =>
        apiClient
            .post<WorkspaceMember>(`/api/workspaces/${slug}/members`, data)
            .then((r) => r.data),
    createUserAndAddMember: (
        slug: string,
        data: CreateUserAndAddMemberData,
    ): Promise<WorkspaceMember> =>
        apiClient
            .post<WorkspaceMember>(`/api/workspaces/${slug}/members/create-user`, data)
            .then((r) => r.data),
    getTheme: (workspaceSlug: string): Promise<WorkspaceTheme> =>
        apiClient.get<WorkspaceTheme>(`/api/workspaces/${workspaceSlug}/theme`).then((r) => r.data),
    updateTheme: (workspaceSlug: string, data: UpdateWorkspaceThemeData): Promise<WorkspaceTheme> =>
        apiClient.patch<WorkspaceTheme>(`/api/workspaces/${workspaceSlug}/theme`, data).then((r) => r.data),
};
