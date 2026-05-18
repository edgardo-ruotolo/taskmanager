export interface RecentVisit {
    id: string;
    entityType: string;
    entityId: string;
    entityTitle: string;
    entityUrl: string | null;
    visitedAt: string;
}

export interface QuickLink {
    id: string;
    title: string;
    url: string;
    description: string | null;
    icon: string | null;
    sequence: number;
    createdAt: string;
}

export interface CreateQuickLinkData {
    title: string;
    url: string;
    description?: string;
    icon?: string;
}

export interface TrackVisitData {
    entityType: string;
    entityId: string;
    entityTitle: string;
    entityUrl?: string;
}
