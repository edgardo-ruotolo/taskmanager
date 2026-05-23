export type ProjectRole = 'Member' | 'Lead' | 'Admin';

export const COMPANY_ROLE_LABELS: Record<ProjectRole, string> = {
    Admin: 'Administrador',
    Lead: 'Gestor',
    Member: 'Usuario',
};

export interface ProjectMember {
    userId: string;
    projectId: string;
    role: ProjectRole;
    displayName?: string;
    email?: string;
}

export interface Project {
    id: string;
    name: string;
    identifier: string;
    description?: string;
    logoUrl?: string;
    workspaceId: string;
    ownerId: string;
    stateGroupId: string;
    stateGroupName: string;
    teamId?: string | null;
    teamName?: string | null;
    createdAt: string;
}

export interface CreateProjectData {
    name: string;
    identifier: string;
    description?: string;
    teamId?: string | null;
}

export interface UpdateProjectData {
    name?: string;
    description?: string;
    logoUrl?: string;
    stateGroupId?: string;
}

export interface AddProjectMemberData {
    userId: string;
    role: ProjectRole;
}

export interface UpdateProjectMemberRoleData {
    role: ProjectRole;
}
