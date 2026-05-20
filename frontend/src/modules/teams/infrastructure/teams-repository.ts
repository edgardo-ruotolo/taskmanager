import { apiClient } from '@/shared/lib/api-client';
import type { Team, TeamMember, CreateTeamData, UpdateTeamData } from '../domain/types';

interface PagedResponse<T> {
    items: T[];
    totalCount: number;
    page: number;
    pageSize: number;
}

const base = (slug: string): string => `/api/workspaces/${slug}/teams`;

export const teamsRepository = {
    getAll: (workspaceSlug: string): Promise<Team[]> =>
        apiClient.get<PagedResponse<Team>>(`${base(workspaceSlug)}?pageSize=100`).then((r) => r.data.items),

    getOne: (workspaceSlug: string, teamId: string): Promise<Team> =>
        apiClient.get<Team>(`${base(workspaceSlug)}/${teamId}`).then((r) => r.data),

    create: (workspaceSlug: string, data: CreateTeamData): Promise<Team> =>
        apiClient.post<Team>(base(workspaceSlug), data).then((r) => r.data),

    update: (workspaceSlug: string, teamId: string, data: UpdateTeamData): Promise<Team> =>
        apiClient.patch<Team>(`${base(workspaceSlug)}/${teamId}`, data).then((r) => r.data),

    delete: (workspaceSlug: string, teamId: string): Promise<void> =>
        apiClient.delete(`${base(workspaceSlug)}/${teamId}`).then(() => undefined),

    getMembers: (workspaceSlug: string, teamId: string): Promise<TeamMember[]> =>
        apiClient.get<TeamMember[]>(`${base(workspaceSlug)}/${teamId}/members`).then((r) => r.data),

    addMember: (workspaceSlug: string, teamId: string, userId: string): Promise<void> =>
        apiClient.post(`${base(workspaceSlug)}/${teamId}/members`, { userId }).then(() => undefined),

    removeMember: (workspaceSlug: string, teamId: string, userId: string): Promise<void> =>
        apiClient.delete(`${base(workspaceSlug)}/${teamId}/members/${userId}`).then(() => undefined),
};
