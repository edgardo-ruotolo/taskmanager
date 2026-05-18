export interface AiCompletionRequest {
    prompt: string;
}

export interface AiCompletionResult {
    result: string;
}

export interface AiLabelSuggestion {
    labels: string[];
}

export interface AiSubIssuesResult {
    subIssues: string[];
}
