export type IssuePriority = 0 | 1 | 2 | 3 | 4;

export const PRIORITY_LABELS: Record<IssuePriority, string> = {
    0: 'Sin prioridad',
    1: 'Urgente',
    2: 'Alta',
    3: 'Media',
    4: 'Baja',
};

export const PRIORITY_COLORS: Record<IssuePriority, string> = {
    0: 'text-placeholder',
    1: 'text-red-500',
    2: 'text-orange-500',
    3: 'text-yellow-500',
    4: 'text-blue-400',
};

export interface Issue {
    id: string;
    sequenceId: number;
    title: string;
    description?: string;
    priority: IssuePriority;
    companyId: string;
    stateId: string;
    stateName: string;
    stateColor: string;
    createdById: string;
    assigneeId?: string;
    parentId?: string;
    startDate?: string;
    targetDate?: string;
    dueDate?: string;
    completedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateIssueData {
    title: string;
    description?: string;
    priority: IssuePriority;
    stateId: string;
    assigneeId?: string;
    dueDate?: string;
}

export interface UpdateIssueData {
    title?: string;
    description?: string;
    priority?: IssuePriority;
    stateId?: string;
    assigneeId?: string;
    dueDate?: string;
}

export interface IssueComment {
    id: string;
    body: string;
    issueId: string;
    authorId: string;
    authorName: string;
    parentId: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface IssueReaction {
    id: string;
    emoji: string;
    actorId: string;
    issueId: string;
    createdAt: string;
}

export interface IssueActivity {
    id: string;
    field: string;
    oldValue: string | null;
    newValue: string | null;
    actorId: string;
    actorName: string;
    createdAt: string;
}

export interface CreateCommentData {
    body: string;
    parentId?: string;
}

export interface CreateReactionData {
    emoji: string;
}

export interface IssueView {
    id: string;
    name: string;
    description?: string;
    filtersJson?: string;
    isGlobal: boolean;
    workspaceId: string;
    createdById: string;
    createdAt: string;
}

export interface CreateIssueViewData {
    name: string;
    description?: string;
    filtersJson?: string;
    isGlobal?: boolean;
}

export interface IssueType {
    id: string;
    name: string;
    description?: string;
    color?: string;
    isDefault: boolean;
    workspaceId: string;
    createdAt: string;
}

export interface CreateIssueTypeData {
    name: string;
    description?: string;
    color?: string;
    isDefault?: boolean;
}

export interface IssueSubscriber {
    userId: string;
    userEmail: string;
    userFirstName: string;
    userLastName: string;
}

export interface IssueLink {
    id: string;
    issueId: string;
    url: string;
    title: string;
    createdAt: string;
}

export interface CreateIssueLinkData {
    url: string;
    title: string;
}

export type IssueRelationType = 'DuplicateOf' | 'BlockedBy' | 'Blocking' | 'IsEpicOf';

export interface IssueRelation {
    id: string;
    issueId: string;
    relatedIssueId: string;
    relatedIssueTitle: string;
    relatedIssueSequenceId: number;
    relationType: IssueRelationType;
}

export interface CreateIssueRelationData {
    relatedIssueId: string;
    relationType: IssueRelationType;
}
