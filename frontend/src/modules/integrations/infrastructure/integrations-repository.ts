import { apiClient } from '@/shared/lib/api-client';
import type {
    IntegrationStatus,
    GitHubRepo,
    CreateGitHubRepoData,
    IntegrationConnectResponse,
    TestMessageResponse,
} from '../domain/types';

export const integrationsRepository = {
    // GitHub
    getGitHubStatus: (workspaceSlug: string): Promise<IntegrationStatus> =>
        apiClient
            .get<IntegrationStatus>(`/api/workspaces/${workspaceSlug}/integrations/github/status`)
            .then((r) => r.data),

    connectGitHub: (workspaceSlug: string, code: string): Promise<IntegrationConnectResponse> =>
        apiClient
            .post<IntegrationConnectResponse>(
                `/api/workspaces/${workspaceSlug}/integrations/github/connect`,
                { code },
            )
            .then((r) => r.data),

    disconnectGitHub: (workspaceSlug: string): Promise<void> =>
        apiClient
            .delete(`/api/workspaces/${workspaceSlug}/integrations/github/disconnect`)
            .then(() => undefined),

    getGitHubRepos: (workspaceSlug: string): Promise<GitHubRepo[]> =>
        apiClient
            .get<GitHubRepo[]>(`/api/workspaces/${workspaceSlug}/integrations/github/repos`)
            .then((r) => r.data),

    addGitHubRepo: (workspaceSlug: string, data: CreateGitHubRepoData): Promise<GitHubRepo> =>
        apiClient
            .post<GitHubRepo>(`/api/workspaces/${workspaceSlug}/integrations/github/repos`, data)
            .then((r) => r.data),

    removeGitHubRepo: (workspaceSlug: string, repoId: string): Promise<void> =>
        apiClient
            .delete(`/api/workspaces/${workspaceSlug}/integrations/github/repos/${repoId}`)
            .then(() => undefined),

    // Slack
    getSlackStatus: (workspaceSlug: string): Promise<IntegrationStatus> =>
        apiClient
            .get<IntegrationStatus>(`/api/workspaces/${workspaceSlug}/integrations/slack/status`)
            .then((r) => r.data),

    connectSlack: (workspaceSlug: string, code: string): Promise<IntegrationConnectResponse> =>
        apiClient
            .post<IntegrationConnectResponse>(
                `/api/workspaces/${workspaceSlug}/integrations/slack/connect`,
                { code },
            )
            .then((r) => r.data),

    disconnectSlack: (workspaceSlug: string): Promise<void> =>
        apiClient
            .delete(`/api/workspaces/${workspaceSlug}/integrations/slack/disconnect`)
            .then(() => undefined),

    testSlackMessage: (workspaceSlug: string): Promise<TestMessageResponse> =>
        apiClient
            .post<TestMessageResponse>(
                `/api/workspaces/${workspaceSlug}/integrations/slack/test-message`,
            )
            .then((r) => r.data),
};
