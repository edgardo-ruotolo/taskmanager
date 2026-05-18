export interface ProjectModule {
    id: string;
    name: string;
    description: string | null;
    status: 'Backlog' | 'InProgress' | 'Paused' | 'Completed' | 'Archived';
    issueCount: number;
    companyId: string;
    leadId: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateModuleData {
    name: string;
    description?: string;
    status?: string;
}

export interface ModuleIssueRef {
    issueId: string;
    issueTitle: string;
    issueSequenceId: number;
    stateName: string;
    stateColor: string;
    priority: number;
}
