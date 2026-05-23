export type IssuePriority = 0 | 1 | 2 | 3 | 4;

export interface DraftIssue {
    id: string;
    title: string;
    description: string | null;
    priority: IssuePriority;
    projectId: string;
    stateId: string | null;
    stateName: string | null;
    ownedById: string;
    assigneeId: string | null;
    dueDate: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateDraftIssueData {
    title: string;
    description?: string;
    priority?: IssuePriority;
    projectId: string;
    stateId?: string;
    assigneeId?: string;
    dueDate?: string;
}

export interface UpdateDraftIssueData {
    title?: string;
    description?: string;
    priority?: IssuePriority;
    stateId?: string;
    assigneeId?: string;
    dueDate?: string;
}
