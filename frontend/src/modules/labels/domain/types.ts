export interface Label {
    id: string;
    name: string;
    color: string;
    description?: string;
    workspaceId: string;
    createdAt: string;
}

export interface CreateLabelData {
    name: string;
    color: string;
    description?: string;
}
