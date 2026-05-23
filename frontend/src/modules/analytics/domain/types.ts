export interface PriorityCount {
    priority: number;
    count: number;
}

export interface StateCount {
    stateName: string;
    stateColor: string;
    count: number;
}

export interface AnalyticsOverview {
    totalIssues: number;
    openIssues: number;
    completedIssues: number;
    overdueIssues: number;
    issuesByPriority: PriorityCount[];
    issuesByState: StateCount[];
    recentActivity: unknown[];
}

// Backend records — mirror C# `StateBucket(string StateName, int Count)` etc.
export interface StateBucket {
    stateName: string;
    count: number;
}

export interface PriorityBucket {
    priority: string;
    count: number;
}

export interface CreatedVsResolvedPoint {
    date: string;
    created: number;
    resolved: number;
}

export interface ProjectActivityPoint {
    date: string;
    completed: number;
}

export interface AnalyticView {
    id: string;
    name: string;
    description: string | null;
    query: string;
    isGlobal: boolean;
    workspaceId: string;
    ownedById: string;
    createdAt: string;
}

export interface CreateAnalyticViewData {
    name: string;
    description?: string;
    query?: string;
    isGlobal?: boolean;
}

export interface UpdateAnalyticViewData {
    name?: string;
    description?: string;
    query?: string;
    isGlobal?: boolean;
}

export interface ExporterHistory {
    id: string;
    format: string;
    status: string;
    fileName: string | null;
    downloadUrl: string | null;
    errorMessage: string | null;
    createdAt: string;
    completedAt: string | null;
}
