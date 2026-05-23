export interface DeployBoard {
    id: string;
    projectId: string;
    workspaceSlug: string;
    token: string;
    title: string;
    description?: string;
    isPublic: boolean;
    showVoting: boolean;
    showComments: boolean;
    showPriority: boolean;
    showState: boolean;
    showAssignees: boolean;
    createdAt: string;
}

export interface PublicIssue {
    id: string;
    title: string;
    priority?: string;
    stateName?: string;
    assignees?: string[];
}

export interface PublicSpaceData {
    board: DeployBoard;
    issues: PublicIssue[];
}

export interface CreateDeployBoardData {
    title: string;
    description?: string;
    showVoting?: boolean;
    showComments?: boolean;
    showPriority?: boolean;
    showState?: boolean;
    showAssignees?: boolean;
}
