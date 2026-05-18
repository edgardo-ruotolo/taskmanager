export interface Page {
    id: string;
    workspaceId: string;
    title: string;
    description: string;
    isLocked: boolean;
    isArchived: boolean;
    ownedById: string;
    ownedByName: string;
    createdAt: string;
    updatedAt: string;
    labelIds: string[];
}

export interface PageVersion {
    id: string;
    pageId: string;
    description: string;
    ownedById: string;
    versionNumber: number;
    createdAt: string;
}

export interface CreatePageData {
    title: string;
    description?: string;
    labelIds?: string[];
}

export interface UpdatePageData {
    title?: string;
    description?: string;
    labelIds?: string[];
}
