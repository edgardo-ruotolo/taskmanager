export interface SearchResults {
    issues: SearchIssueResult[];
    cycles: SearchCycleResult[];
    modules: SearchModuleResult[];
    views: SearchViewResult[];
    labels: SearchLabelResult[];
}

export interface SearchIssueResult {
    id: string;
    title: string;
    sequenceId: number;
    projectId: string;
}

export interface SearchCycleResult {
    id: string;
    name: string;
    projectId: string;
}

export interface SearchModuleResult {
    id: string;
    name: string;
    projectId: string;
}

export interface SearchViewResult {
    id: string;
    name: string;
    projectId: string | null;
}

export interface SearchLabelResult {
    id: string;
    name: string;
    color: string;
}
