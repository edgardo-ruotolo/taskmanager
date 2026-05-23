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

export type WorkspaceRole = 'Admin' | 'Lead' | 'Member';

export interface WorkspaceMember {
    userId: string;
    email: string;
    displayName?: string;
    avatarUrl?: string;
    role: WorkspaceRole;
    isActive: boolean;
}

export interface WorkspaceUserSearchResult {
    userId: string;
    email: string;
    displayName?: string;
    avatarUrl?: string;
}

export interface AddMemberData {
    userId: string;
    role: WorkspaceRole;
}

export interface CreateUserAndAddMemberData {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    role: WorkspaceRole;
}

export const WORKSPACE_ROLE_LABELS: Record<WorkspaceRole, string> = {
    Admin: 'Administrador',
    Lead: 'Líder',
    Member: 'Usuario',
};
