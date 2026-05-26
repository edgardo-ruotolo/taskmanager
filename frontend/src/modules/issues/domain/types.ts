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
    descriptionHtml?: string;
    descriptionJson?: string;
    priority: IssuePriority;
    projectId: string;
    stateId: string;
    stateName: string;
    stateColor: string;
    stateGroup?: string;
    createdById: string;
    updatedById?: string;
    assigneeId?: string;
    assigneeIds: string[];
    labelIds: string[];
    moduleIds: string[];
    cycleId?: string;
    parentId?: string;
    issueTypeId?: string;
    startDate?: string;
    dueDate?: string;
    completedAt?: string;
    sortOrder: number;
    isDraft: boolean;
    isArchived: boolean;
    archivedAt?: string;
    externalSource?: string;
    externalId?: string;
    requiresAdminApproval: boolean;
    approvalRequiredStateIds: string[];
    approvedById: string | null;
    approvedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateIssueData {
    title: string;
    description?: string;
    descriptionHtml?: string;
    descriptionJson?: string;
    priority: IssuePriority;
    stateId: string;
    assigneeId?: string;
    assigneeIds?: string[];
    labelIds?: string[];
    moduleIds?: string[];
    cycleId?: string;
    parentId?: string;
    issueTypeId?: string;
    startDate?: string;
    dueDate?: string;
    isDraft?: boolean;
    sortOrder?: number;
}

export interface UpdateIssueData {
    title?: string;
    description?: string;
    descriptionHtml?: string;
    descriptionJson?: string;
    priority?: IssuePriority;
    stateId?: string;
    assigneeId?: string;
    assigneeIds?: string[];
    labelIds?: string[];
    moduleIds?: string[];
    cycleId?: string;
    parentId?: string;
    issueTypeId?: string;
    startDate?: string;
    dueDate?: string;
    isDraft?: boolean;
    sortOrder?: number;
}

export interface IssueComment {
    id: string;
    body: string;
    issueId: string;
    authorId: string;
    authorName: string;
    parentId: string | null;
    access: 'Internal' | 'External';
    editedAt?: string;
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
    verb?: string;
    epoch: number;
    oldIdentifier?: string;
    newIdentifier?: string;
    actorId: string;
    actorName: string;
    createdAt: string;
}

export interface CreateCommentData {
    body: string;
    parentId?: string;
    access?: 'Internal' | 'External';
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
    icon?: string;
    isDefault: boolean;
    isEpic: boolean;
    level: number;
    logoProps?: string;
    workspaceId: string;
    createdAt: string;
}

export interface CreateIssueTypeData {
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    isDefault?: boolean;
    isEpic?: boolean;
    level?: number;
    logoProps?: string;
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

export type IssueRelationType =
    | 'DuplicateOf'
    | 'BlockedBy'
    | 'Blocking'
    | 'IsEpicOf'
    | 'Duplicate'
    | 'RelatesTo'
    | 'StartBefore'
    | 'StartAfter'
    | 'FinishBefore'
    | 'FinishAfter'
    | 'ImplementedBy'
    | 'Implements';

export interface IssueRelation {
    id: string;
    issueId: string;
    relatedIssueId: string;
    relatedIssueTitle: string;
    relatedIssueSequenceId: number;
    relationType: IssueRelationType;
    createdAt: string;
}

export interface CreateIssueRelationData {
    relatedIssueId: string;
    relationType: IssueRelationType;
}

export interface IssueVersion {
    id: string;
    issueId: string;
    ownedById: string;
    ownedByName: string;
    lastSavedAt: string;
    descriptionJson?: string;
}

export interface IssueMention {
    issueId: string;
    mentionedUserId: string;
    createdAt: string;
}

export interface IssueTemplate {
    id: string;
    name: string;
    description?: string;
    workspaceId: string;
    projectId?: string;
    templateJson?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateIssueTemplateData {
    name: string;
    description?: string;
    projectId?: string;
    templateJson?: string;
}

export interface SearchSimilarIssuesData {
    title: string;
    description?: string;
}
