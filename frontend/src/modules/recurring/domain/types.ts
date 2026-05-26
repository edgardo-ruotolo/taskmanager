export type RecurringFrequency = 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly';

export type RecurringRunStatus =
    | 'Success'
    | 'SkippedPreviousNotDone'
    | 'SkippedPaused'
    | 'SkippedManual'
    | 'Failed';

export interface RecurringTemplateProjectSummary {
    id: string;
    identifier: string;
    name: string;
}

export interface RecurringTemplateAssigneeSummary {
    id: string;
    displayName: string;
    avatarUrl: string | null;
}

export interface RecurringTemplateCycleSummary {
    id: string;
    name: string;
    projectId: string;
}

export interface RecurringTemplate {
    id: string;
    sequenceId: number;
    workspaceId: string;
    name: string;
    descriptionHtml: string;
    frequency: RecurringFrequency;
    interval: number;
    daysOfWeek: number[];
    dayOfMonth: number | null;
    monthOfYear: number | null;
    runAtTime: string;
    endTime: string | null;
    timezone: string;
    startsOn: string;
    endsOn: string | null;
    isActive: boolean;
    isPaused: boolean;
    skipNextRun: boolean;
    lastRunAt: string | null;
    nextRunAt: string | null;
    stateGroup: string;
    priority: string;
    startDateOffsetDays: number;
    targetDateOffsetDays: number;
    blockPolicy: string;
    issueTypeId?: string | null;
    cycleId: string | null;
    cycle: RecurringTemplateCycleSummary | null;
    createdById: string;
    createdAt: string;
    updatedAt: string;
    projectIds: string[];
    assigneeIds: string[];
    labelIds: string[];
    projects: RecurringTemplateProjectSummary[];
    assignees: RecurringTemplateAssigneeSummary[];
}

export interface RecurringRunIssueRef {
    issueId: string;
    projectId: string;
}

export interface RecurringRun {
    id: string;
    templateId: string;
    scheduledFor: string;
    executedAt: string | null;
    status: RecurringRunStatus;
    errorMessage: string;
    generatedIssueIds: RecurringRunIssueRef[];
    blockedByIssueIds: string[];
    createdAt: string;
}

export interface RecurringPreview {
    nextRuns: string[];
}

export interface RecurringFromIssuePrefill {
    name: string;
    descriptionHtml: string;
    priority: string;
    stateGroup: string;
    issueTypeId?: string | null;
    projectIds: string[];
    assigneeIds: string[];
    labelIds: string[];
}

export interface CreateRecurringTemplateData {
    name: string;
    descriptionHtml: string;
    frequency: RecurringFrequency;
    interval: number;
    daysOfWeek: number[];
    dayOfMonth: number | null;
    monthOfYear: number | null;
    runAtTime: string;
    endTime: string | null;
    timezone: string;
    startsOn: string;
    endsOn: string | null;
    stateGroup: string;
    priority: string;
    startDateOffsetDays: number;
    targetDateOffsetDays: number;
    blockPolicy: string;
    issueTypeId?: string | null;
    cycleId: string | null;
    projectIds: string[];
    assigneeIds: string[];
    labelIds: string[];
}

export type UpdateRecurringTemplateData = Partial<CreateRecurringTemplateData>;

export type RecurringStatusFilter = 'active' | 'paused' | 'inactive';

export interface RecurringListParams {
    page?: number;
    pageSize?: number;
    search?: string;
    frequency?: RecurringFrequency;
    status?: RecurringStatusFilter;
}
