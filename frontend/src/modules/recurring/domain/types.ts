export type RecurringFrequency = 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';

export type RecurringRunStatus =
    | 'Success'
    | 'SkippedPreviousNotDone'
    | 'SkippedPaused'
    | 'SkippedManual'
    | 'Failed';

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
    createdById: string;
    createdAt: string;
    updatedAt: string;
    companyIds: string[];
    assigneeIds: string[];
    labelIds: string[];
}

export interface RecurringRunIssueRef {
    issueId: string;
    companyId: string;
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
    companyIds: string[];
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
    companyIds: string[];
    assigneeIds: string[];
    labelIds: string[];
}

export type UpdateRecurringTemplateData = Partial<CreateRecurringTemplateData>;
