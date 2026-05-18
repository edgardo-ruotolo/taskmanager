export type StickyColor = 'yellow' | 'pink' | 'green' | 'blue' | 'orange' | 'purple';

export interface Sticky {
    id: string;
    workspaceId: string;
    ownedById: string;
    title: string;
    description: string;
    color: StickyColor;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateStickyData {
    title: string;
    description?: string;
    color: StickyColor;
}

export interface UpdateStickyData {
    title?: string;
    description?: string;
    color?: StickyColor;
}
