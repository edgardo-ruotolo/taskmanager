export type ArchivedItemKind = 'issue' | 'cycle' | 'module';

export interface ArchivedIssue {
    id: string;
    sequenceId: number;
    title: string;
    stateName: string;
    stateColor: string;
    priority: number;
    archivedAt: string;
}

export interface ArchivedCycle {
    id: string;
    name: string;
    description: string | null;
    status: string;
    issueCount: number;
    archivedAt: string;
}

export interface ArchivedModule {
    id: string;
    name: string;
    description: string | null;
    status: string;
    issueCount: number;
    archivedAt: string;
}
