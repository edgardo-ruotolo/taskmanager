import { apiClient } from '@/shared/lib/api-client';
import type { PagedResult } from '@/shared/types/pagination';
import type {
    Project,
    ProjectMember,
    CreateProjectData,
    UpdateProjectData,
    AddProjectMemberData,
    UpdateProjectMemberRoleData,
} from '../domain/types';

export const projectRepository = {
    getAll: (workspaceSlug: string): Promise<PagedResult<Project>> =>
        apiClient
            .get<PagedResult<Project>>(`/api/workspaces/${workspaceSlug}/projects`)
            .then((r) => r.data),
    getById: (workspaceSlug: string, projectId: string): Promise<Project> =>
        apiClient
            .get<Project>(`/api/workspaces/${workspaceSlug}/projects/${projectId}`)
            .then((r) => r.data),
    create: (workspaceSlug: string, data: CreateProjectData): Promise<Project> =>
        apiClient
            .post<Project>(`/api/workspaces/${workspaceSlug}/projects`, data)
            .then((r) => r.data),
    update: (workspaceSlug: string, projectId: string, data: UpdateProjectData): Promise<Project> =>
        apiClient
            .patch<Project>(`/api/workspaces/${workspaceSlug}/projects/${projectId}`, data)
            .then((r) => r.data),
    updateTeam: (workspaceSlug: string, projectId: string, teamId: string | null): Promise<Project> =>
        apiClient
            .patch<Project>(`/api/workspaces/${workspaceSlug}/projects/${projectId}/team`, { teamId })
            .then((r) => r.data),
    delete: (workspaceSlug: string, projectId: string): Promise<void> =>
        apiClient
            .delete(`/api/workspaces/${workspaceSlug}/projects/${projectId}`)
            .then(() => undefined),
    getMembers: (workspaceSlug: string, projectId: string): Promise<ProjectMember[]> =>
        apiClient
            .get<ProjectMember[]>(`/api/workspaces/${workspaceSlug}/projects/${projectId}/members`)
            .then((r) => r.data),
    addMember: (
        workspaceSlug: string,
        projectId: string,
        data: AddProjectMemberData,
    ): Promise<ProjectMember> =>
        apiClient
            .post<ProjectMember>(
                `/api/workspaces/${workspaceSlug}/projects/${projectId}/members`,
                data,
            )
            .then((r) => r.data),
    removeMember: (workspaceSlug: string, projectId: string, userId: string): Promise<void> =>
        apiClient
            .delete(`/api/workspaces/${workspaceSlug}/projects/${projectId}/members/${userId}`)
            .then(() => undefined),
    updateMemberRole: (
        workspaceSlug: string,
        projectId: string,
        userId: string,
        data: UpdateProjectMemberRoleData,
    ): Promise<ProjectMember> =>
        apiClient
            .patch<ProjectMember>(
                `/api/workspaces/${workspaceSlug}/projects/${projectId}/members/${userId}/role`,
                data,
            )
            .then((r) => r.data),
};
