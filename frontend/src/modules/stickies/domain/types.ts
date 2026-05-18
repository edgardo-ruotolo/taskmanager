export type StickyColor = 'yellow' | 'pink' | 'green' | 'blue' | 'orange' | 'purple';

export interface Sticky {
    id: string;
    title: string;
    content: string;
    color: StickyColor;
    createdAt: string;
    updatedAt: string;
}

export interface CreateStickyData {
    title: string;
    content?: string;
    color: StickyColor;
}

export interface UpdateStickyData {
    title?: string;
    content?: string;
    color?: StickyColor;
}
