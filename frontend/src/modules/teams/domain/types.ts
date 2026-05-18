export interface Team {
    id: string;
    name: string;
    description: string | null;
    identifier: string | null;
    logoUrl: string | null;
    workspaceId: string;
    createdById: string;
    memberCount: number;
    createdAt: string;
}

export interface TeamMember {
    id: string;
    teamId: string;
    userId: string;
    userName: string;
    userEmail: string;
    role: 'member' | 'admin';
}

export interface CreateTeamData {
    name: string;
    description?: string;
    identifier?: string;
}

export interface UpdateTeamData {
    name?: string;
    description?: string;
    identifier?: string;
    logoUrl?: string;
}
