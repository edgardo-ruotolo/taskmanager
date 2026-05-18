export interface Favorite {
    id: string;
    entityType: string;
    entityId: string;
    workspaceId: string;
    sequence: number;
    createdAt: string;
}

export interface CreateFavoriteData {
    entityType: string;
    entityId: string;
}
