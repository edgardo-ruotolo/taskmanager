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
