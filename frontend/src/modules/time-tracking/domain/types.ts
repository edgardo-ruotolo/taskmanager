export interface Worklog {
    id: string;
    issueId: string;
    userId: string;
    startedAt: string;
    endedAt?: string;
    durationMinutes?: number;
    description?: string;
    createdAt: string;
}

export interface WorklogSummary {
    totalMinutes: number;
    totalHours: number;
    byUser: Array<{ userId: string; userName: string; totalMinutes: number }>;
}

export interface CreateWorklogData {
    startedAt: string;
    endedAt?: string;
    durationMinutes?: number;
    description?: string;
}

export interface UpdateWorklogData {
    startedAt?: string;
    endedAt?: string;
    durationMinutes?: number;
    description?: string;
}
