import axios from 'axios';
import { apiClient } from '@/shared/lib/api-client';
import type { DeployBoard, PublicSpaceData, CreateDeployBoardData } from '../domain/types';

const publicApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000',
    headers: { 'Content-Type': 'application/json' },
});

export const spaceRepository = {
    getBoards: (workspaceSlug: string, projectId: string): Promise<DeployBoard[]> =>
        apiClient
            .get<DeployBoard[]>(
                `/api/workspaces/${workspaceSlug}/projects/${projectId}/deploy-boards`,
            )
            .then((r) => r.data),

    createBoard: (
        workspaceSlug: string,
        projectId: string,
        data: CreateDeployBoardData,
    ): Promise<DeployBoard> =>
        apiClient
            .post<DeployBoard>(
                `/api/workspaces/${workspaceSlug}/projects/${projectId}/deploy-boards`,
                data,
            )
            .then((r) => r.data),

    updateBoard: (
        workspaceSlug: string,
        projectId: string,
        boardId: string,
        data: Partial<CreateDeployBoardData>,
    ): Promise<DeployBoard> =>
        apiClient
            .patch<DeployBoard>(
                `/api/workspaces/${workspaceSlug}/projects/${projectId}/deploy-boards/${boardId}`,
                data,
            )
            .then((r) => r.data),

    deleteBoard: (
        workspaceSlug: string,
        projectId: string,
        boardId: string,
    ): Promise<void> =>
        apiClient
            .delete(
                `/api/workspaces/${workspaceSlug}/projects/${projectId}/deploy-boards/${boardId}`,
            )
            .then(() => undefined),

    getPublicSpace: (token: string): Promise<PublicSpaceData> =>
        publicApi
            .get<PublicSpaceData>(`/api/public/space/${token}`)
            .then((r) => r.data),
};
