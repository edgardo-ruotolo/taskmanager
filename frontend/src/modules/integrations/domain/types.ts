export interface IntegrationStatus {
    isConnected: boolean;
    accountName?: string;
    teamName?: string;
    channel?: string;
}

export interface GitHubRepo {
    id: string;
    repoOwner: string;
    repoName: string;
    fullName: string;
    syncIssues: boolean;
    syncPRs: boolean;
}

export interface CreateGitHubRepoData {
    repoOwner: string;
    repoName: string;
    syncIssues: boolean;
    syncPRs: boolean;
}

export interface IntegrationConnectResponse {
    success: boolean;
    message: string;
}

export interface TestMessageResponse {
    success: boolean;
    message: string;
}
