export interface Workspace {
    id: string;
    name: string;
    slug: string;
    description?: string;
    logoUrl?: string;
    ownerId: string;
    createdAt: string;
}

export interface CreateWorkspaceData {
    name: string;
    slug: string;
    description?: string;
}

export interface UpdateWorkspaceData {
    name?: string;
    description?: string;
    logoUrl?: string;
}

export interface WorkspaceMember {
    userId: string;
    email: string;
    displayName?: string;
    avatarUrl?: string;
    role: 'Admin' | 'Member';
    isActive: boolean;
}

export interface WorkspaceInvitation {
    id: string;
    email: string;
    role: 'Admin' | 'Member';
    expiresAt: string;
    acceptedAt?: string;
}

export interface CreateInvitationData {
    email: string;
    role: 'Admin' | 'Member';
}

export const WORKSPACE_ROLE_LABELS: Record<'Admin' | 'Member', string> = {
    Admin: 'Administrador',
    Member: 'Usuario',
};
