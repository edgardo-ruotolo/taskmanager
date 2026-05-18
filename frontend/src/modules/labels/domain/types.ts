export interface Label {
    id: string;
    name: string;
    color: string;
    workspaceId: string;
    createdAt: string;
}

export interface CreateLabelData {
    name: string;
    color: string;
}
