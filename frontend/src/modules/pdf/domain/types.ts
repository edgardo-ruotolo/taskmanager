export interface PdfIssueData {
    sequenceId: number;
    title: string;
    description?: string;
    stateName: string;
    priority: number;
    createdAt: string;
    dueDate?: string;
}
