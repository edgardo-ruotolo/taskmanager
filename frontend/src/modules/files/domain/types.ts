export interface FileAsset {
    id: string;
    fileName: string;
    contentType: string;
    sizeBytes: number;
    entityType: string | null;
    entityId: string | null;
    uploadedById: string;
    workspaceId: string;
    createdAt: string;
    url: string;
}
