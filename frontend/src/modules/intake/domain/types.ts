export type IntakeStatus = 'Pending' | 'Accepted' | 'Declined' | 'Duplicate' | 'Snoozed';

export interface IntakeIssue {
    id: string;
    companyId: string;
    title: string;
    description: string | null;
    status: IntakeStatus;
    source: string | null;
    submitterEmail: string | null;
    declineReason: string | null;
    snoozedUntil: string | null;
    acceptedAsIssueId: string | null;
    duplicateOfIssueId: string | null;
    reviewedByUserId: string | null;
    reviewedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateIntakeIssueData {
    title: string;
    description?: string;
    source?: string;
    submitterEmail?: string;
}

export interface ReviewIntakeIssueData {
    status: IntakeStatus;
    declineReason?: string;
    snoozedUntil?: string;
}

export interface IntakePage {
    items: IntakeIssue[];
    totalCount: number;
    page: number;
    pageSize: number;
}
