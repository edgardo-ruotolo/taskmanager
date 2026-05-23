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

// ── Admin analytics (filtered) ───────────────────────────────────────────

export type AnalyticsStateCategoryName =
    | 'Backlog'
    | 'Unstarted'
    | 'Started'
    | 'Completed'
    | 'Cancelled';

export type AnalyticsPriorityName = 'Urgent' | 'High' | 'Medium' | 'Low' | 'None';

export interface IssueGanttDto {
    id: string;
    sequenceId: number;
    title: string;
    projectIdentifier: string;
    assigneeId: string | null;
    assigneeName: string | null;
    assigneeAvatarUrl: string | null;
    labelIds: string[];
    stateId: string;
    stateName: string;
    stateColor: string;
    stateCategory: AnalyticsStateCategoryName;
    priority: AnalyticsPriorityName;
    startDate: string | null;
    dueDate: string | null;
    completedAt: string | null;
    isOverdue: boolean;
}

export interface BurndownPoint {
    date: string;
    total: number;
    remaining: number;
    completed: number;
    ideal: number;
}

export interface IssueRowDto {
    id: string;
    sequenceId: number;
    title: string;
    projectIdentifier: string;
    assigneeId: string | null;
    assigneeName: string | null;
    assigneeAvatarUrl: string | null;
    labelNames: string[];
    labelIds: string[];
    stateId: string;
    stateName: string;
    stateColor: string;
    priority: AnalyticsPriorityName;
    startDate: string | null;
    dueDate: string | null;
    completedAt: string | null;
    createdAt: string;
    daysInProgress: number;
}

export interface UserRankingDto {
    userId: string;
    fullName: string;
    email: string | null;
    avatarUrl: string | null;
    assigned: number;
    completed: number;
    inProgress: number;
    overdue: number;
    avgResolutionDays: number;
    throughputPerWeek: number;
}

export interface ClientComparisonDto {
    labelId: string;
    labelName: string;
    labelColor: string;
    total: number;
    open: number;
    completed: number;
    overdue: number;
    percentComplete: number;
    avgResolutionDays: number;
}

export interface ReportRequestPayload {
    reportName?: string;
    filters?: Record<string, unknown>;
    sections?: string[];
}
