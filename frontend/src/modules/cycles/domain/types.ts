export interface Cycle {
    id: string;
    name: string;
    description: string | null;
    startDate: string | null;
    endDate: string | null;
    status: 'Draft' | 'Started' | 'Completed';
    issueCount: number;
    projectId: string;
    ownerId: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCycleData {
    name: string;
    description?: string;
    startDate?: string;
    endDate?: string;
}

export interface CycleIssueRef {
    issueId: string;
    issueTitle: string;
    issueSequenceId: number;
    stateName: string;
    stateColor: string;
    priority: number;
}
