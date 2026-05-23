import { apiClient } from '@/shared/lib/api-client';
import type { State, StateGroup, CreateStateData, UpdateStateData, CreateStateGroupData, UpdateStateGroupData } from '../domain/types';

export const stateRepository = {
    getAll: (stateGroupId?: string): Promise<State[]> =>
        apiClient.get<State[]>('/api/states', { params: stateGroupId ? { stateGroupId } : undefined })
            .then((r) => r.data),

    getProjectStates: (workspaceSlug: string, projectId: string): Promise<State[]> =>
        apiClient.get<State[]>(`/api/workspaces/${workspaceSlug}/projects/${projectId}/states`)
            .then((r) => r.data),

    create: (data: CreateStateData): Promise<State> =>
        apiClient.post<State>('/api/states', data).then((r) => r.data),

    update: (id: string, data: UpdateStateData): Promise<State> =>
        apiClient.patch<State>(`/api/states/${id}`, data).then((r) => r.data),

    remove: (id: string): Promise<void> =>
        apiClient.delete(`/api/states/${id}`).then(() => undefined),

    getAllGroups: (): Promise<StateGroup[]> =>
        apiClient.get<StateGroup[]>('/api/admin/state-groups').then((r) => r.data),

    getGroup: (id: string): Promise<StateGroup> =>
        apiClient.get<StateGroup>(`/api/admin/state-groups/${id}`).then((r) => r.data),

    createGroup: (data: CreateStateGroupData): Promise<StateGroup> =>
        apiClient.post<StateGroup>('/api/admin/state-groups', data).then((r) => r.data),

    updateGroup: (id: string, data: UpdateStateGroupData): Promise<StateGroup> =>
        apiClient.patch<StateGroup>(`/api/admin/state-groups/${id}`, data).then((r) => r.data),

    deleteGroup: (id: string): Promise<void> =>
        apiClient.delete(`/api/admin/state-groups/${id}`).then(() => undefined),
};
